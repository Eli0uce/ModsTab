@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js est requis. Installation via winget...
  winget install -e --id OpenJS.NodeJS.LTS
  echo.
  echo Si l'installation a reussi, fermez cette fenetre et relancez Install-Windows.bat.
  echo Sinon, installez Node.js depuis https://nodejs.org puis relancez ce fichier.
  pause
  exit /b 1
)
node installer\install.js %*
echo.
pause
