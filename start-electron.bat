@echo off
echo Starting Clinic Management System...
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo Error: Node.js is not installed or not in PATH
  echo Please install Node.js from https://nodejs.org/
  echo.
  pause
  exit /b 1
)

REM Start the server and Electron app
echo Starting server and launching application...
npx concurrently "npm run dev" "npx wait-on http://localhost:5000 && npx electron ."

pause