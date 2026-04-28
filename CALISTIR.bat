@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "node_modules\" (
  echo [ihaleal.com] node_modules yok, npm install calisiyor...
  call npm install
  if errorlevel 1 exit /b 1
)
if not exist "public\icon-192.png" (
  echo [ihaleal.com] PWA / OG gorselleri uretiliyor ^(npm run gen:assets^)...
  call npm run gen:assets
  if errorlevel 1 exit /b 1
)
echo.
echo [ihaleal.com] Gelistirme sunucusu: http://localhost:5173
echo Kapatmak icin bu pencerede Ctrl+C basin.
echo.
call npm run dev
