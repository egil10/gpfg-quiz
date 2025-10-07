@echo off
chcp 65001 > nul
echo ============================================================
echo NBIM Quiz - Full Setup and Launch
echo ============================================================
echo.

echo [1/3] Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo Done!
echo.

echo [2/3] Processing data from Excel to JSON...
python process_data.py
if errorlevel 1 (
    echo ERROR: Failed to process data
    pause
    exit /b 1
)
echo Done!
echo.

echo [3/3] Starting web server...
echo.
echo ============================================================
echo Setup complete! 
echo.
echo Opening http://localhost:8000 in your browser...
echo Press Ctrl+C to stop the server when done
echo ============================================================
echo.

start http://localhost:8000
python -m http.server 8000

