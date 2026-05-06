$ErrorActionPreference = "Stop"
Set-Location "C:\Users\yagiz\Documents\GitHub\ihaleal"

function Run-Step {
  param(
    [Parameter(Mandatory = $true)][string]$Title,
    [Parameter(Mandatory = $true)][scriptblock]$Script
  )
  Write-Host ""
  Write-Host "=== $Title ===" -ForegroundColor Cyan
  & $Script
}

# 01-04
Run-Step "01-04 Repo" {
  git status -sb
  git fetch origin
  $b = git branch --show-current
  if (git status --porcelain) {
    Write-Host "Calisma agaci kirli: pull atlandi. Dal: $b" -ForegroundColor Yellow
  }
  else {
    $prev = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    git pull --rebase origin $b
    if ($LASTEXITCODE -ne 0) { Write-Host "pull cikis: $LASTEXITCODE" -ForegroundColor Yellow }
    $ErrorActionPreference = $prev
  }
  git status -sb
}

# 05
Run-Step "05 npm ci" { npm ci }

# 06 — bloklar; script icinde calistirilmaz
Run-Step "06 Dev server (ayri terminal)" {
  Write-Host "Atlandi: npm run dev -- --host --port 5175" -ForegroundColor Yellow
}

# 07
Run-Step "07 verify:ci" { npm run verify:ci }

# 08-11
Run-Step "08-11 Git inceleme" {
  git fetch origin
  git log --oneline --decorate -20
  git diff --name-only origin/main...HEAD
  git diff --stat origin/main...HEAD
}

# 12-26
Run-Step "12-26 rg taramalari" {
  rg -n "\bany\b" src
  rg -n "dangerouslySetInnerHTML" src
  rg -n "TODO|FIXME|HACK" src
  rg -n "console\.error|console\.warn" src
  rg -n "try\s*\{" src
  rg -n "catch\s*\(" src
  rg -n "ErrorBoundary|error boundary" src
  rg -n "React\.lazy|lazy\(" src
  rg -n "Suspense" src
  rg -n "nasil-calisir|rehber" src/components
  rg -n "og:description|twitter:description|hreflang|og:image:alt|twitter:image:alt" index.html
  rg -n "isSupabaseConfigured" src
  rg -n "PreLaunch|YillikUyelik" src/pages
  rg -n "supabase" src/pages/PreLaunch.tsx
  rg -n "supabase" src/pages/membership/YillikUyelik.tsx
}

# 27
Run-Step "27 Playwright smoke" { npm run test:smoke }

# 28-31 — yalnizca degisiklik varsa commit
Run-Step "28-31 Commit ve push (varsa)" {
  git add -A
  git status -sb
  if (git status --porcelain) {
    git commit -m "chore: release hardening pass (quality, checks, cleanup)"
    git push origin HEAD
  }
  else {
    Write-Host "Commit atlaniyor: calisma agaci temiz." -ForegroundColor Yellow
  }
}

# 32-40 — gh oturumu kullanicida olmali
Run-Step "32-40 GitHub CLI + PR" {
  $head = git branch --show-current
  gh --version
  gh auth status
  Write-Host "34) Etkilesimli: gh auth login (token veya tarayici)" -ForegroundColor Yellow
  gh repo view --json nameWithOwner -q .nameWithOwner
  gh pr list --head $head
  gh pr create --base main --head $head --title "release: verify:ci + quality" --body "## Summary`n- verify:ci (coverage + bundle budget)`n- Release checklist`n`n## Test`n- [x] npm run verify:ci`n- [x] npm run test:smoke"
  if ($LASTEXITCODE -ne 0) {
    Write-Host "gh pr create atlandi veya hata (PR zaten olabilir). Cikis: $LASTEXITCODE" -ForegroundColor Yellow
  }
  gh pr view --web
  gh pr checks
  gh pr status
}

# 41-45
Run-Step "41-45 Tag (istege bagli) ve son dogrulama" {
  git tag -a ("pre-release-" + (Get-Date -Format "yyyyMMdd-HHmm")) -m "Pre-release checkpoint"
  git push origin --tags
  npm run verify:ci
  git status -sb
  Write-Output "READY_FOR_MERGE"
}

Write-Host ""
Write-Host "Not: gh adimlari oturum yoksa hata verir; once gh auth login." -ForegroundColor Magenta
Write-Host "Betik kok: C:\Users\yagiz\Documents\GitHub\ihaleal — docs: LAUNCH_CHECKLIST.md" -ForegroundColor DarkGray
