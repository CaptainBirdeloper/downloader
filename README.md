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

## Installation & Setup

### Running on Windows
1. Ensure **Python 3** is installed and added to your system `PATH`.
2. Double-click the `run.bat` launcher file.
   - The script will activate a local Python virtual environment if present (`venv\Scripts\activate.bat`).
   - If not in a virtual environment, it will install dependencies from `requirements.txt`.
   - It will configure the default download folder to `%~dp0downloads` via the `YT_DL_DIR` environment variable.
   - It will start the local Flask server at `http://127.0.0.1:5000` and automatically open it in your browser.

### Running on Android (Termux)
1. Install **Termux** on your Android device.
2. Copy the project folder into your Termux `$HOME` directory.
3. Make the launch script executable:
   ```bash
   chmod +x run.sh
   ```
4. Run the launcher script:
   ```bash
   ./run.sh
   ```
   - The script will quietly install the required Python dependencies (`flask`, `yt-dlp`).
   - It will set the default download folder to `$HOME/yt_downloads` via the `YT_DL_DIR` environment variable.
   - It will start the Flask server. Open `http://127.0.0.1:5000` in your device's mobile browser.
   *Note: Ensure `ffmpeg` is installed on your device (e.g. `pkg install ffmpeg`) to allow file merging.*

---

## API Endpoints

### POST `/browse`
Validates absolute folder paths for download directories.

- **Request Body Format**:
  ```json
  {
    "path": "/absolute/path/to/downloads"
  }
  ```

- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "path": "/absolute/path/to/downloads"
  }
  ```

- **Error Response (400 Bad Request)**:
  ```json
  {
    "success": false,
    "message": "Selected path does not exist."
  }
  ```

---

## Local Mobile Usage (Wi-Fi)
To download files directly onto your mobile device using your local PC as the server:
1. Ensure your PC and mobile device are connected to the same local Wi-Fi network.
2. Start the application on your PC by double-clicking `run.bat`.
3. Open the browser on your mobile device and navigate to `http://<PC-IP>:5000` (e.g. `http://192.168.1.100:5000`).
4. Once a download finishes, click **"SAVE TO DEVICE"** to copy the media file to your mobile storage.

