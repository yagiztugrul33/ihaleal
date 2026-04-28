@echo off
setlocal
set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"
set "GIT=C:\Program Files\Git\bin\git.exe"

echo === ihaleal.com verify ===
echo ROOT=%ROOT%
cd /d "%ROOT%"
if not exist package.json (
  echo ERROR: package.json not found
  exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: node not in PATH
  exit /b 1
)

echo [1/5] npm install
call npm install
if errorlevel 1 exit /b 1

echo [2/5] npm run typecheck
call npm run typecheck
if errorlevel 1 exit /b 1

echo [3/5] npm run test:run
call npm run test:run
if errorlevel 1 exit /b 1

echo [4/5] npm run build
call npm run build
if errorlevel 1 exit /b 1

echo [5/5] npm audit
call npm audit

echo kimi-mega-pack file count:
dir /b "docs\kimi-mega-pack" 2>nul | find /c /v ""

echo kimi-import folder:
if exist "docs\kimi-import\" (dir /b "docs\kimi-import") else (echo NOT FOUND)

echo DONE verify chain
if exist "%GIT%" (
  "%GIT%" -C "%ROOT%" status -sb
)
exit /b 0
