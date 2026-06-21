@echo off
title YT Downloader Launcher
echo Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not installed or not added to PATH.
    pause
    exit /b 1
)

echo Installing dependencies from requirements.txt...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Warning: Failed to install dependencies. Proceeding anyway...
)

echo Launching browser...
start http://localhost:5000

echo Starting Flask server...
python app.py
pause
