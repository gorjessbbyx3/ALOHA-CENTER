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

REM Set DB_TYPE to aws-rds to use AWS RDS database
set DB_TYPE=aws-rds

REM Start the server and Electron app with environment variables
echo Starting server and launching application...
node electron-start.js

pause