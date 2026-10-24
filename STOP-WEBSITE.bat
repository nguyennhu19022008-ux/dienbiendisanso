@echo off
setlocal
title DUNG DIEN BIEN 3D STEAM
cd /d "%~dp0"

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0runtime\stop-server.ps1"
echo.
pause
