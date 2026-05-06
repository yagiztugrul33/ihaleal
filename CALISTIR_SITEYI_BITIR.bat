@echo off
setlocal
chcp 65001 >nul
set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"
cd /d "%ROOT%"

echo ============================================
echo  ihaleal.com — SITEYI BITIRME (CI + yedek)
echo ============================================
echo.
echo npm ci calisir. Vite / "npm run dev" kapali olsun (esbuild EPERM onlenir).
echo Calisma agaci kirli ise pull atlanir; once commit veya stash yapin.
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%\scripts\bitir-kisitli-butce.ps1"
set "EC=%ERRORLEVEL%"

if not "%EC%"=="0" (
  echo.
  echo [HATA] bitir-kisitli-butce.ps1 cikis kodu: %EC%
  pause
  exit /b %EC%
)

echo.
echo --- Istege bagli: docs\kimi-import altinda gorev* varsa commit ---
set "GIT=C:\Program Files\Git\bin\git.exe"
set GOREVFILES=0
if exist "%ROOT%\docs\kimi-import\" (
  for /f %%A in ('2^>nul dir /b "%ROOT%\docs\kimi-import\gorev*" ^| find /c /v ""') do set GOREVFILES=%%A
)
if "%GOREVFILES%"=="0" (
  echo SKIP: gorev* yok.
) else (
  echo Bulunan gorev* dosya sayisi: %GOREVFILES%
  if exist "%GIT%" (
    "%GIT%" -C "%ROOT%" add docs/kimi-import
    "%GIT%" -C "%ROOT%" diff --cached --quiet
    if errorlevel 1 (
      "%GIT%" -C "%ROOT%" commit -m "content: kimi import"
      "%GIT%" -C "%ROOT%" push
    ) else (
      echo Staged degisiklik yok, commit atlandi.
    )
  ) else (
    echo Git yok: commit atlandi.
  )
)

echo.
if exist "%GIT%" "%GIT%" -C "%ROOT%" status -sb
echo.
echo ============================================
echo  Bitti. Yerel: npm run dev  veya BASLA_DEV.bat
echo ============================================
if /i not "%~1"=="nopause" pause
exit /b 0
