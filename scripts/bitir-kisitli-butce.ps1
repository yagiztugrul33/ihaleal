$ErrorActionPreference = "Stop"
Set-Location "C:\Users\yagiz\Documents\GitHub\ihaleal"

function Banner($t) {
  Write-Host ""
  Write-Host "=== $t ===" -ForegroundColor Cyan
}

Banner "1) Git"
git status -sb
git fetch origin
$b = git branch --show-current
$prev = $ErrorActionPreference
$ErrorActionPreference = "Continue"
git pull --rebase origin $b
$pullCode = $LASTEXITCODE
$ErrorActionPreference = $prev
if ($pullCode -ne 0) {
  Write-Host "pull cikis: $pullCode (devam)" -ForegroundColor Yellow
}

Banner "2) npm ci"
npm ci

Banner "3) verify:ci"
npm run verify:ci

Banner "4) git bundle -> Indirilenler"
$stamp = Get-Date -Format "yyyyMMdd-HHmm"
$bundle = Join-Path $env:USERPROFILE "Downloads\ihaleal-yedek-$stamp.bundle"
git bundle create $bundle --all
Write-Host "Yedek: $bundle" -ForegroundColor Green

Banner "5) commit + push (varsa)"
git add -A
if (git status --porcelain) {
  git commit --trailer "Co-authored-by: Cursor <cursoragent@cursor.com>" -m "chore: bitirme runbook (verify:ci + yedek)"
  git push origin HEAD
} else {
  Write-Host "Temiz agac, commit yok." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "PR: https://github.com/yagiztugrul33/ihaleal/compare/main...$b`?expand=1" -ForegroundColor Magenta
git log -1 --oneline