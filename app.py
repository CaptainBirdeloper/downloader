import os
import subprocess
import logging
import json
import re
from flask import Flask, request, jsonify, render_template, Response, send_from_directory

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Detect Vercel / serverless cloud environments
IS_VERCEL = "VERCEL" in os.environ

# Ensure downloads directory exists (skip on read-only cloud filesystems)
DOWNLOADS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), 'downloads'))
if not IS_VERCEL and not os.path.exists(DOWNLOADS_DIR):
    os.makedirs(DOWNLOADS_DIR)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/sw.js')
def service_worker():
    response = send_from_directory(os.path.join(app.static_folder, 'js'), 'sw.js')
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Content-Type'] = 'application/javascript'
    response.headers['Service-Worker-Allowed'] = '/'
    return response

@app.route('/status', methods=['GET'])
def status():
    return jsonify({
        "status": "ok",
        "downloads_dir": DOWNLOADS_DIR,
        "is_vercel": IS_VERCEL
    })

@app.route('/browse', methods=['POST'])
def browse():
    if IS_VERCEL:
        return jsonify({
            "success": False, 
            "path": "", 
            "message": "Local folder browsing is disabled in cloud deployments. Please run this app locally."
        }), 400

    try:
        import tkinter as tk
        from tkinter import filedialog
        
        root = tk.Tk()
        root.withdraw()
        root.attributes('-topmost', True)
        
        selected_dir = filedialog.askdirectory(title="Select Download Folder")
        root.destroy()
        
        if selected_dir:
            norm_dir = os.path.abspath(selected_dir)
            return jsonify({"success": True, "path": norm_dir})
        else:
            return jsonify({"success": False, "path": "", "message": "Selection cancelled."})
    except Exception as e:
        logger.error(f"Error during directory selection: {str(e)}")
        return jsonify({"success": False, "path": "", "message": f"Failed to browse directory: {str(e)}"}), 500

@app.route('/info', methods=['POST'])
def info():
    if IS_VERCEL:
        return jsonify({
            "success": False,
            "message": "Subprocess executions (like yt-dlp metadata querying) are disabled in serverless cloud deployments. Please run this application locally."
        }), 400

    data = request.get_json() or {}
    url = data.get('url')
    
    if not url:
        return jsonify({"success": False, "message": "URL is required"}), 400
        
    cmd = ["yt-dlp", "--dump-single-json", "--flat-playlist", url]
    
    try:
        logger.info(f"Retrieving metadata for: {url}")
        res = subprocess.run(cmd, capture_output=True, text=True, check=True)
        metadata = json.loads(res.stdout)
        
        # Check if playlist
        is_playlist = metadata.get('_type') == 'playlist' or 'entries' in metadata
        
        items = []
        if is_playlist:
            entries = metadata.get('entries', [])
            for entry in entries:
                if not entry:
                    continue
                v_id = entry.get('id')
                v_title = entry.get('title') or "Unknown Title"
                v_artist = entry.get('uploader') or entry.get('channel') or metadata.get('title') or "Unknown Artist"
                
                # Fetch thumbnail
                v_thumb = ""
                thumbnails = entry.get('thumbnails', [])
                if thumbnails:
                    v_thumb = thumbnails[-1].get('url', '')
                if not v_thumb and v_id:
                    v_thumb = f"https://i.ytimg.com/vi/{v_id}/mqdefault.jpg"
                    
                v_url = entry.get('url') or entry.get('webpage_url')
                if not v_url and v_id:
                    v_url = f"https://www.youtube.com/watch?v={v_id}"
                    
                items.append({
                    "id": v_id,
                    "title": v_title,
                    "artist": v_artist,
                    "thumbnail": v_thumb,
                    "url": v_url
                })
            title = metadata.get('title') or "Playlist"
        else:
            v_id = metadata.get('id')
            v_title = metadata.get('title') or "Unknown Title"
            v_artist = metadata.get('uploader') or metadata.get('channel') or "Unknown Artist"
            v_thumb = metadata.get('thumbnail') or ""
            if not v_thumb and metadata.get('thumbnails'):
                v_thumb = metadata['thumbnails'][-1].get('url', '')
            v_url = metadata.get('webpage_url') or url
            items.append({
                "id": v_id,
                "title": v_title,
                "artist": v_artist,
                "thumbnail": v_thumb,
                "url": v_url
            })
            title = v_title
            
        return jsonify({
            "success": True,
            "title": title,
            "is_playlist": is_playlist,
            "items": items
        })
    except subprocess.CalledProcessError as e:
        err_msg = e.stderr.strip() or e.stdout.strip() or "Failed to query URL info."
        logger.error(f"Metadata retrieval error: {err_msg}")
        return jsonify({"success": False, "message": err_msg}), 400
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/download-stream', methods=['GET'])
def download_stream():
    if IS_VERCEL:
        return Response("data: " + json.dumps({"status": "error", "message": "Downloading is not supported on Vercel serverless functions. Please run this application locally using run.bat."}) + "\n\n", mimetype='text/event-stream')

    url = request.args.get('url')
    fmt = request.args.get('format')
    custom_path = request.args.get('path')

    if not url or not fmt:
        return Response("data: " + json.dumps({"status": "error", "message": "Missing URL or format"}) + "\n\n", mimetype='text/event-stream')

    target_dir = DOWNLOADS_DIR
    if custom_path:
        custom_path = custom_path.strip()
        if custom_path:
            try:
                normalized_path = os.path.abspath(os.path.expanduser(custom_path))
                if not os.path.exists(normalized_path):
                    os.makedirs(normalized_path)
                target_dir = normalized_path
            except Exception as e:
                return Response("data: " + json.dumps({"status": "error", "message": f"Invalid download path: {str(e)}"}) + "\n\n", mimetype='text/event-stream')

    out_tmpl = os.path.join(target_dir, "%(title)s.%(ext)s")

    flags = []
    if fmt == 'mp3':
        flags = ["--extract-audio", "--audio-format", "mp3", "--audio-quality", "0"]
    elif fmt == 'mp4':
        flags = ["-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]", "--merge-output-format", "mp4"]
    elif fmt == 'webm':
        flags = ["-f", "bestvideo[ext=webm]+bestaudio[ext=webm]/best[ext=webm]", "--merge-output-format", "webm"]
    elif fmt == 'm4a':
        flags = ["-f", "bestaudio[ext=m4a]/best[ext=m4a]"]

    # Spawns real-time output stream
    def generate():
        # Get filename first
        get_name_cmd = ["yt-dlp", "--get-filename", "-o", out_tmpl, "--no-playlist"] + flags + [url]
        filename = "media_file"
        try:
            res_name = subprocess.run(get_name_cmd, capture_output=True, text=True, check=True)
            filename = os.path.basename(res_name.stdout.strip())
        except Exception:
            pass

        yield f"data: {json.dumps({'status': 'starting', 'filename': filename})}\n\n"

        download_cmd = ["yt-dlp", "--newline", "--progress", "-o", out_tmpl, "--no-playlist"] + flags + [url]
        process = subprocess.Popen(
            download_cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            universal_newlines=True
        )

        percent_regex = re.compile(r"\[download\]\s+(\d+\.\d+)%")
        
        while True:
            line = process.stdout.readline()
            if not line and process.poll() is not None:
                break
            if not line:
                continue

            line_str = line.strip()
            match = percent_regex.search(line_str)
            if match:
                percent = float(match.group(1))
                yield f"data: {json.dumps({'status': 'downloading', 'progress': percent})}\n\n"
            elif "error" in line_str.lower() or "failed" in line_str.lower():
                yield f"data: {json.dumps({'status': 'error', 'message': line_str})}\n\n"

        exit_code = process.poll()
        if exit_code == 0:
            yield f"data: {json.dumps({'status': 'complete', 'filename': filename})}\n\n"
        else:
            yield f"data: {json.dumps({'status': 'error', 'message': f'Process exited with code {exit_code}'})}\n\n"

    return Response(generate(), mimetype='text/event-stream')

# Legacy endpoint kept for fallback compatibility
@app.route('/download', methods=['POST'])
def download():
    data = request.get_json() or {}
    url = data.get('url')
    fmt = data.get('format')
    custom_path = data.get('path')

    if not url or not fmt:
        return jsonify({"success": False, "message": "Missing URL or format"}), 400

    target_dir = DOWNLOADS_DIR
    if custom_path:
        custom_path = custom_path.strip()
        if custom_path:
            try:
                normalized_path = os.path.abspath(os.path.expanduser(custom_path))
                if not os.path.exists(normalized_path):
                    os.makedirs(normalized_path)
                target_dir = normalized_path
            except Exception as e:
                return jsonify({"success": False, "message": str(e)}), 400

    out_tmpl = os.path.join(target_dir, "%(title)s.%(ext)s")
    flags = []
    if fmt == 'mp3':
        flags = ["--extract-audio", "--audio-format", "mp3", "--audio-quality", "0"]
    elif fmt == 'mp4':
        flags = ["-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]", "--merge-output-format", "mp4"]
    elif fmt == 'webm':
        flags = ["-f", "bestvideo[ext=webm]+bestaudio[ext=webm]/best[ext=webm]", "--merge-output-format", "webm"]
    elif fmt == 'm4a':
        flags = ["-f", "bestaudio[ext=m4a]/best[ext=m4a]"]

    cmd = ["yt-dlp", "-o", out_tmpl, "--no-playlist"] + flags + [url]
    try:
        subprocess.run(cmd, check=True, capture_output=True)
        return jsonify({"success": True, "filename": "downloaded_file", "message": "Download successful"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/downloads/<path:filename>')
def serve_download(filename):
    from flask import send_from_directory
    try:
        # send_from_directory prevents directory traversal attacks
        return send_from_directory(DOWNLOADS_DIR, filename, as_attachment=True)
    except FileNotFoundError:
        return "File not found.", 404

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
