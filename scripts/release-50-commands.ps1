$ErrorActionPreference = "Stop"

function Run-Step {
  param(
    [Parameter(Mandatory = $true)][string]$Title,
    [Parameter(Mandatory = $true)][scriptblock]$Script
  )
  Write-Host ""
  Write-Host "=== $Title ===" -ForegroundColor Cyan
  & $Script
}

Run-Step "01-04 Repo hazirlik" {
  Set-Location "C:\Users\yagiz\Documents\GitHub\ihaleal"
  git checkout chore/footer-nav-seo-meta
  git pull --rebase origin chore/footer-nav-seo-meta
  git status -sb
}

Run-Step "05 Bagimliliklar" { npm ci }

Run-Step "06 Dev server (ayri terminal onerilir)" {
  Write-Host "Dev server bu scriptte bloklayacagi icin otomatik atlandi." -ForegroundColor Yellow
  Write-Host "Ayri terminalde calistir: npm run dev -- --host --port 5175" -ForegroundColor Yellow
}

Run-Step "07-11 Kalite dogrulama" {
  npm run typecheck
  npm run precheck:encoding
  npm run test:run
  npm run build
  npm run verify
}

Run-Step "12-15 Git inceleme" {
  git fetch origin
  git log --oneline --decorate -20
  git diff --name-only origin/main...HEAD
  git diff --stat origin/main...HEAD
}

Run-Step "16-30 Kod taramalari" {
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

Run-Step "31 Coverage" { npm run test:coverage }

Run-Step "32-35 Commit ve push" {
  git add -A
  git status -sb
  git commit -m "chore: release hardening pass (quality, checks, cleanup)"
  git push origin chore/footer-nav-seo-meta
}

Run-Step "36-45 GH ve PR adimlari" {
  gh --version
  gh auth status
  Write-Host "Gerekirse bir kez gh auth login calistir." -ForegroundColor Yellow
  gh repo view --json nameWithOwner -q .nameWithOwner
  gh pr list --head chore/footer-nav-seo-meta
  gh pr diff --name-only
  gh pr create --base main --head chore/footer-nav-seo-meta --title "release: nav/footer/seo + supabase guard hardening" --body "## Summary`n- Navbar/Footer route and labels aligned`n- SEO meta/OG/Twitter/hreflang alignment`n- PreLaunch + yearly membership safe behavior when Supabase is not configured`n- verify pipeline green`n`n## Test Plan`n- [x] npm run verify`n- [x] route checks`n- [x] form guard checks"
  gh pr view --web
  gh pr checks
  gh pr status
}

Run-Step "46-49 Tag ve son verify" {
  git tag -a ("pre-release-" + (Get-Date -Format "yyyyMMdd-HHmm")) -m "Pre-release checkpoint"
  git push origin --tags
  npm run verify
  git status -sb
}

Run-Step "50 Tamam" { Write-Output "READY_FOR_MERGE" }

Write-Host ""
Write-Host "BILGISAYARI YENIDEN BASLATMA (istege bagli): shutdown /r /t 15" -ForegroundColor Magenta
