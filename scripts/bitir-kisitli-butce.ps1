$ErrorActionPreference = "Stop"
Set-Location "C:\Users\yagiz\Documents\GitHub\ihaleal"

function Banner($t) { Write-Host ""; Write-Host "=== $t ===" -ForegroundColor Cyan }

Banner "1) Git"
git status -sb
git fetch origin
$b = git branch --show-current
if (git status --porcelain) {
  Write-Host "Working tree not clean. Commit or stash, then re-run. Skipping pull." -ForegroundColor Yellow
} else {
  $prev = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  git pull --rebase origin $b
  $pullCode = $LASTEXITCODE
  $ErrorActionPreference = $prev
  if ($pullCode -ne 0) { Write-Host "pull exit: $pullCode" -ForegroundColor Yellow }
}

Banner "2) npm ci"
$ErrorActionPreference = "Continue"
npm ci
$ci = $LASTEXITCODE
$ErrorActionPreference = "Stop"
if ($ci -ne 0) {
  Write-Host "npm ci FAILED (close Vite/Node using esbuild.exe, then retry). Exit: $ci" -ForegroundColor Red
  exit $ci
}

Banner "3) verify:ci"
npm run verify:ci

Banner "4) git bundle -> Downloads"
$stamp = Get-Date -Format "yyyyMMdd-HHmm"
$bundle = Join-Path $env:USERPROFILE "Downloads\ihaleal-yedek-$stamp.bundle"
git bundle create $bundle --all
Write-Host "Backup: $bundle" -ForegroundColor Green

Banner "5) commit + push if needed"
git add -A
if (git status --porcelain) {
  git commit --trailer "Co-authored-by: Cursor <cursoragent@cursor.com>" -m "chore: bitirme runbook (verify:ci + backup)"
  git push origin HEAD
} else { Write-Host "Working tree clean, no commit." -ForegroundColor Yellow }

Write-Host ""
Write-Host "PR: https://github.com/yagiztugrul33/ihaleal/compare/main...$b`?expand=1" -ForegroundColor Magenta
git log -1 --oneline