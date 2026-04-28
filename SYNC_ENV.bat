@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo [ihaleal.com] Masaustu supabase-keys.txt --^> .env.local
call npm run env:sync
if errorlevel 1 (
  echo.
  echo Masaustune supabase-keys.txt koy veya: npm run env:sync -- "C:\yol\keys.txt"
  pause
  exit /b 1
)
echo Tamam.
pause
