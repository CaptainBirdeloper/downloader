# Local PWA Media Downloader

A lightweight, installable Progressive Web App (PWA) to download audio and video locally from various websites. Powered by a local Python Flask backend and the high-performance `yt-dlp` CLI tool, with a beautiful modern user interface based on the **Material 3 Expressive** design system.

## Key Features

- **PWA Capabilities**: Installable directly on desktop and mobile home screens with offline container shell support.
- **Dynamic Dark Theme**: Styled with a default dark mode theme based on the Material 3 Expressive guidelines.
- **Playlist Downloads**: Expands playlists (such as YouTube playlists or albums) into queues showing video thumbnail images, titles, and artist/uploader names.
- **Real-Time Progress**: Downloads items sequentially while streaming output percentages directly to individual progress bars in the queue.
- **Desktop Directory Selection**: Features a native folder picker dialog (via host-level Tkinter integration) to set custom output paths.
- **Zero Framework Bloat**: Built using modular vanilla CSS and JavaScript for lightning-fast loads.

---

## Technical Stack

- **Frontend**: HTML5 (Semantic & SEO optimized), CSS3 (Custom Variables, State Layers, M3 Animations), Vanilla JS (Modular, SSE Streaming).
- **Backend**: Python 3, Flask.
- **Download Engine**: `yt-dlp` CLI.

---

## File Structure

```
yt-downloader/
├── app.py                      # Flask server (SSE, /info, /browse, static routes)
├── run.bat                     # Windows environment launcher
├── requirements.txt            # Python dependencies
├── templates/
│   └── index.html              # Main HTML container (PWA optimizations)
└── static/
    ├── manifest.json           # PWA metadata
    ├── images/
    │   └── icon.svg            # Vector branding icon
    ├── css/
    │   ├── reset.css           # Global resets and M3 Design system tokens
    │   ├── layout.css          # Page margins, cards, and queue list scrollboards
    │   ├── form.css            # Floating labels, segmented buttons, and queue cards
    │   └── status.css          # Snackbar-style inline status banner
    └── js/
        ├── api.js              # Fetch requests and EventSource stream connection
        ├── form-handler.js     # Input validation, controls toggling, and queue loop
        ├── status-display.js   # Global status updates
        ├── segmented-button.js # Syncs segmented buttons with form selects
        ├── sw.js               # Service Worker caching assets
        └── main.js             # Registers sw and boots DOM events
```

---

## Installation & Setup (Windows)

1. Make sure you have **Python 3** installed and added to your system `PATH`.
2. Ensure `yt-dlp` is installed and globally available in your system path, or can be run by python.
3. Simply double-click the `run.bat` launcher file.
   - The script will automatically verify your Python installation.
   - It will install all backend dependencies from `requirements.txt`.
   - It will start the local Flask server at `http://localhost:5000` and launch your default browser.

---

## Usage

1. **Set Custom Download Path (Optional)**: Click **BROWSE...** to open a native folder window and select where downloads are saved. Defaults to a local `./downloads/` folder.
2. **Select Output Format**: Use the segmented buttons to select **MP4**, **MP3** (audio extraction), **WEBM**, or **M4A**.
3. **Paste URL**: Copy and paste any media link or playlist link into the URL input field.
4. **Download**: Click **START DOWNLOAD**. If it is a playlist, the queue panel will show listing all tracks with their thumbnails, uploading authors, and individual progress bars.

---

## Local Mobile Usage (Wi-Fi)

To download files directly onto your mobile phone or tablet using your local PC as the server:

1. Ensure your PC and mobile device are connected to the same local Wi-Fi network.
2. Find your PC's local IP address (e.g., run `ipconfig` in Command Prompt on Windows).
3. Start the application on your PC by double-clicking `run.bat`.
4. Open the browser on your mobile device and navigate to `http://<PC-IP>:5000` (replace `<PC-IP>` with your PC's IP address, e.g., `http://192.168.1.100:5000`).
5. Enter a URL, choose the format, and click **START DOWNLOAD**.
6. When the download completes, a **"SAVE TO DEVICE"** button will appear on the queue card. Click it to transfer the completed media file directly from your PC to your mobile device's storage.

