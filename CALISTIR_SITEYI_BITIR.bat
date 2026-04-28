@echo off
setlocal
set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"
set "GIT=C:\Program Files\Git\bin\git.exe"

echo ============================================
echo  ihaleal.com - SITEYI BITIRME (Faz 1 otomatik)
echo ============================================
echo.

REM --- Faz 1a: mevcut tam zincir ---
call "%ROOT%\CALISTIR_KALAN_KONTROL.bat"
if errorlevel 1 (
  echo [HATA] CALISTIR_KALAN_KONTROL basarisiz.
  exit /b 1
)

echo.
echo --- Faz 1b: kimi-import varsa commit ---
if exist "%ROOT%\docs\kimi-import\" (
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
) else (
  echo SKIP: docs\kimi-import yok - Faz 2 icin zip cikar.
)

echo.
echo --- Son durum ---
if exist "%GIT%" "%GIT%" -C "%ROOT%" status -sb

echo.
echo ============================================
echo  Faz 1 tamam. Sonraki adimlar:
echo   docs\SITEYI_BITIRME_PLANI.md  (Faz 2-5)
echo   npm run dev  (yerel onizleme)
echo ============================================
exit /b 0
