@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Yerel onizleme: http://localhost:5173  ^(5173 doluysa konsolda yazan porta gidin, or. 5174^)
echo  HashRouter: adres otomatik #/ ile acilir; acilmazsa tarayiciya elle yazin.
echo.
npm run dev
