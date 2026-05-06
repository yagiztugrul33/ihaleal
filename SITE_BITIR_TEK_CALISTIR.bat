@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"
cd /d "%ROOT%"

echo ============================================
echo  ihaleal.com — TEK CALISTIR (Kimi + tam bitirme)
echo ============================================
echo.
echo [1/3] output.zip: Downloads, Desktop, proje kokinde aranir ve acilir.
powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%\docs\kimi-import\INDIR_VE_CIKAR_OUTPUT.ps1"
if errorlevel 1 (
  echo [BILGI] output.zip bulunamadi veya acilamadi. Devam ediliyor.
)

echo.
echo [2/3] Kimi gorev* dogrulama ^(dosya yoksa uyari^)
powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%\docs\kimi-import\DOGRULA.ps1"
set DOEC=!errorlevel!
if not "!DOEC!"=="0" (
  echo [UYARI] DOGRULA cikis kodu: !DOEC! ^(eksik dosya normal olabilir^)
)

echo.
echo [3/3] Site dogrulama + kimi commit (npm ci YOK — Vite acik kalabilir)
call "%ROOT%\CALISTIR_SITEYI_BITIR.bat" nopause
set EC=!errorlevel!

echo.
echo ============================================
echo  Zincir bitti. Son cikis kodu: !EC!
echo  Hizli linkler: IHALEAL_LINKLER.bat
echo ============================================
if not "!EC!"=="0" pause
exit /b !EC!
