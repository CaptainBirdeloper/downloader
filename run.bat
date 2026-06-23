@echo off
title YT Downloader Launcher
echo Checking local environment...

:: Activate virtual environment if present
if exist "%~dp0venv\Scripts\activate.bat" (
    echo Activating virtual environment...
    call "%~dp0venv\Scripts\activate.bat"
) else (
    echo Installing dependencies from requirements.txt...
    pip install -r "%~dp0requirements.txt"
)

:: Set download directory environment variable
set YT_DL_DIR=%~dp0downloads
echo Download directory is configured to: %YT_DL_DIR%

echo Launching browser...
start http://localhost:5000

echo Starting Flask server...
python "%~dp0app.py"
pause
