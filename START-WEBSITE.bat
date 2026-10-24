@echo off
setlocal
title DIEN BIEN 3D STEAM
cd /d "%~dp0"

if not exist "index.html" (
  echo.
  echo [LOI] Khong tim thay index.html.
  echo Hay dam bao tep index.html nam cung thu muc voi START-WEBSITE.bat.
  echo.
  pause
  exit /b 1
)

where powershell.exe >nul 2>nul
if errorlevel 1 (
  echo.
  echo [LOI] May tinh khong co Windows PowerShell.
  echo Goi nay ho tro Windows 10 va Windows 11.
  echo.
  pause
  exit /b 1
)

echo.
echo Dang khoi dong website. Trinh duyet se tu mo sau vai giay...
echo.
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0runtime\server.ps1"

set "START_RESULT=%ERRORLEVEL%"
if not "%START_RESULT%"=="0" (
  echo.
  echo [LOI] Website da dung do co loi. Ma loi: %START_RESULT%
  echo Xem tep HUONG-DAN.txt de xu ly.
  echo.
  pause
)
exit /b %START_RESULT%
