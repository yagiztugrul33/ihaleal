@echo off
chcp 65001 >nul
set "HERE=%~dp0"
if "%HERE:~-1%"=="\" set "HERE=%HERE:~0,-1%"
REM Zip surukle-birak: ilk parametre zip yolu olur.
REM URL ile indirme: asagidaki satiri duzenleyip -Url ekleyin veya INDIR_VE_CIKAR_OUTPUT.ps1 dokumantasyonuna bakin.
if "%~1"=="" (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%HERE%\INDIR_VE_CIKAR_OUTPUT.ps1"
) else (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%HERE%\INDIR_VE_CIKAR_OUTPUT.ps1" -ZipPath "%~1"
)
if errorlevel 1 exit /b 1
powershell -NoProfile -ExecutionPolicy Bypass -File "%HERE%\DOGRULA.ps1"
exit /b %ERRORLEVEL%
