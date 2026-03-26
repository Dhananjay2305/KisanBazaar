@echo off
echo =========================================
echo Starting Farmer Market Backend Server...
echo =========================================
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%backend"
npm start
pause
