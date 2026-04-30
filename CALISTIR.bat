@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo [ihaleal.com] Masaustu supabase-keys.txt --^> .env.local
call npm run env:sync
if errorlevel 1 (
  echo [ihaleal.com] UYARI: env:sync olmadi. Masaustune supabase-keys.txt koy ^(SUPABASE_URL + SUPABASE_ANON_KEY^).
  echo Devam ediliyor; Supabase baglantisi olmayabilir.
)
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
echo [ihaleal.com] Gelistirme sunucusu basliyor; tarayici otomatik acilir.
echo Port 5173 doluysa konsoldaki ^"Local:^" satirindaki adresi kullanin ^(or. 5174^).
echo Kapatmak icin bu pencerede Ctrl+C basin.
echo.
call npm run dev
