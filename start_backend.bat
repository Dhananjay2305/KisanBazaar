@echo off
set PORT=5001
echo =========================================
echo Starting Farmer Market Backend Server...
echo =========================================

netstat -ano | findstr :%PORT% | findstr LISTENING > temp_port.txt
if %errorlevel% equ 0 (
    for /f "tokens=5" %%a in (temp_port.txt) do set PID=%%a
    del temp_port.txt
    echo.
    echo [!] Port %PORT% is already in use by PID %PID%.
    echo [!] This usually means the server is already running.
    set /p CHOICE="Do you want to stop the existing process and restart? (y/n): "
    if /i "%CHOICE%"=="y" (
        echo Stopping PID %PID%...
        taskkill /F /PID %PID%
        timeout /t 2 > nul
    ) else (
        echo.
        echo Please close the other window or stop the process manually.
        pause
        exit /b
    )
) else (
    if exist temp_port.txt del temp_port.txt
)

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%backend"
node server.js
pause
