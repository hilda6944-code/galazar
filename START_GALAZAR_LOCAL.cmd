@echo off
setlocal
title Galazar Local Launcher

set "GALAZAR_DIR=%USERPROFILE%\Documents\GALAZAR_LIVE"
set "GALAZAR_REPO=https://github.com/hilda6944-code/galazar.git"

where git >nul 2>nul
if errorlevel 1 (
  echo Git is required but was not found.
  echo Install Git for Windows, then run this launcher again.
  pause
  exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required but was not found.
  echo Install the current Node.js LTS, then run this launcher again.
  pause
  exit /b 1
)

if not exist "%GALAZAR_DIR%\.git" (
  echo Installing the current Galazar...
  git clone "%GALAZAR_REPO%" "%GALAZAR_DIR%"
  if errorlevel 1 goto :failed
) else (
  echo Updating Galazar...
  git -C "%GALAZAR_DIR%" pull --ff-only
  if errorlevel 1 goto :failed
)

echo Preparing Galazar...
call npm --prefix "%GALAZAR_DIR%" install
if errorlevel 1 goto :failed

echo Starting Galazar at http://localhost:3000
start "Galazar Server" cmd /k "cd /d ""%GALAZAR_DIR%"" && npm run dev"
timeout /t 5 /nobreak >nul
start "" "http://localhost:3000"
exit /b 0

:failed
echo.
echo Galazar could not be installed or updated.
echo Nothing in your existing Galazar folders was deleted.
pause
exit /b 1
