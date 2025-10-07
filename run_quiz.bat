@echo off
chcp 65001 > nul
echo ============================================================
echo NBIM Quiz - Quick Start
echo ============================================================
echo.
echo Starting web server on http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.
echo ============================================================
echo.

python -m http.server 8000

