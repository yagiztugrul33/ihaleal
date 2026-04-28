@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Yerel onizleme: http://localhost:5173
echo  (Bos hash ise index.html otomatik #/ yapar.)
echo.
npm run dev
