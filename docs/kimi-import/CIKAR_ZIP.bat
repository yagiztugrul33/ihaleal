@echo off
chcp 65001 >nul
setlocal
set "HERE=%~dp0"
if "%HERE:~-1%"=="\" set "HERE=%HERE:~0,-1%"
if "%~1"=="" (
  echo Kullanim: zip dosyasini bu betige surukleyin.
  echo   veya: CIKAR_ZIP.bat "C:\yol\paket.zip"
  exit /b 1
)
set "ZIP=%~1"
if not exist "%ZIP%" (
  echo Bulunamadi: %ZIP%
  exit /b 1
)
where tar >nul 2>&1
if errorlevel 1 (
  echo HATA: tar bulunamadi (Windows 10+ gerekli).
  exit /b 1
)
echo Cikartiliyor: %ZIP%
echo Hedef: %HERE%
tar -xf "%ZIP%" -C "%HERE%"
if errorlevel 1 (
  echo tar basarisiz.
  exit /b 1
)
echo Tamam. Sonraki: DOGRULA.ps1
exit /b 0
