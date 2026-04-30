@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Migration dosyalari birlestiriliyor...
call npm run sql:bundle
if errorlevel 1 (
  echo HATA: npm run sql:bundle basarisiz. Once bu klasorde "npm install" calistir.
  pause
  exit /b 1
)
start "" notepad "supabase\SQL_EDITOR_TEK_DOSYA.sql"
echo.
echo Notepad acildi. Tumunu kopyala -^> Supabase SQL Editor -^> Run
pause
