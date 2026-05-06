@echo off
setlocal
set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"
set "GIT=C:\Program Files\Git\bin\git.exe"

echo ============================================
echo  ihaleal.com - SITEYI BITIRME (Faz 1 otomatik)
echo ============================================
echo.
echo Bu adim: npm install + typecheck + test + build (Vite acik kalabilir).
echo Tam CI + yedek .bundle icin: BITIR_VERIFY_CI.bat
echo.

call "%ROOT%\CALISTIR_KALAN_KONTROL.bat"
if errorlevel 1 (
  echo [HATA] CALISTIR_KALAN_KONTROL basarisiz.
  exit /b 1
)

echo.
echo --- Faz 1b: kimi-import icinde gorev* varsa commit ---
set GOREVFILES=0
if exist "%ROOT%\docs\kimi-import\" (
  for /f %%A in ('2^>nul dir /b "%ROOT%\docs\kimi-import\gorev*" ^| find /c /v ""') do set GOREVFILES=%%A
)
if "%GOREVFILES%"=="0" (
  echo SKIP: docs\kimi-import altinda gorev* yok ^(yalnizca betik/README ise commit yok^).
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
echo --- Son durum ---
if exist "%GIT%" "%GIT%" -C "%ROOT%" status -sb

echo.
echo ============================================
echo  Faz 1 tamam. Tam CI+yedek: BITIR_VERIFY_CI.bat
echo  Sonraki: docs\SITEYI_BITIRME_PLANI.md  npm run dev
echo ============================================
if /i not "%~1"=="nopause" pause
exit /b 0
