#!/bin/bash
# Android Termux Launch Script

echo "Checking Python dependencies..."
pip install --quiet flask yt-dlp

# Set download directory environment variable (fallback if not set)
export YT_DL_DIR="${YT_DL_DIR:-$HOME/yt_downloads}"
echo "Download directory is configured to: $YT_DL_DIR"

# Launch Flask application
python app.py
