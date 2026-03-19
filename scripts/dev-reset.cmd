@echo off
setlocal

for /f "tokens=5" %%a in ('netstat -ano -p tcp ^| findstr /R /C:":3000 .*LISTENING"') do (
  for /f "tokens=1 delims=," %%p in ('tasklist /FI "PID eq %%a" /FO CSV /NH') do (
    if /I "%%~p"=="node.exe" taskkill /F /PID %%a >nul 2>nul
  )
)

if exist ".next\dev\lock" del /f /q ".next\dev\lock"

call npm run dev -- --port 3000
