@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"
cd /d "%ROOT%"

echo ============================================
echo  ihaleal.com - SITE BITIRME ^(tek calistir^)
echo ============================================
echo.
echo [1/3] output.zip: Downloads, Desktop, proje kokinde aranir ve acilir.
powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%\docs\kimi-import\INDIR_VE_CIKAR_OUTPUT.ps1"
if errorlevel 1 (
  echo [BILGI] output.zip bulunamadi veya acilamadi. Kod zinciri yine calisir.
)

echo.
echo [2/3] Kimi gorev* dogrulama ^(dosya yoksa uyari^)
powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%\docs\kimi-import\DOGRULA.ps1"
set DOEC=!errorlevel!
if not "!DOEC!"=="0" (
  echo [UYARI] DOGRULA cikis kodu: !DOEC! ^(eksik dosya normal olabilir^)
)

echo.
echo [3/3] Teknik zincir + gorev* varsa git commit/push
call "%ROOT%\CALISTIR_SITEYI_BITIR.bat"
set EC=!errorlevel!

echo.
echo ============================================
echo  Bitti. Cikis kodu: !EC!
echo  Yerel site: npm run dev  veya BASLA_DEV.bat
echo ============================================
exit /b !EC!
