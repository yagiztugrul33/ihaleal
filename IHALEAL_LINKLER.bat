@echo off
chcp 65001 >nul
setlocal
set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

echo.
echo === ihaleal.com — hizli adresler ve dosyalar ===
echo.
echo Canli site (HashRouter):
echo   https://ihaleal.com/#/
echo.
echo GitHub repo:
echo   https://github.com/yagiztugrul33/ihaleal
echo   PR ac (main ile karsilastir — dali GitHub'da secin):
echo   https://github.com/yagiztugrul33/ihaleal/compare/main?expand=1
echo.
echo Yerel Vite (once bu klasorde: npm run dev):
echo   http://127.0.0.1:5173/#/
echo   (5173 doluysa konsoldaki Local satirina bakin)
echo.
echo Dokumanlar:
echo   %ROOT%\docs\LAUNCH_CHECKLIST.md
echo   %ROOT%\docs\VERCEL_ENV_AFTER_MAIN_MERGE.md
echo.
echo Betikler:
echo   %ROOT%\scripts\bitir-kisitli-butce.ps1   (verify:ci + yedek .bundle + commit/push)
echo   %ROOT%\scripts\release-50-commands.ps1   (uzun checklist)
echo.
echo Tarayicida canli siteyi aciyorum...
start "" "https://ihaleal.com/#/"
exit /b 0
