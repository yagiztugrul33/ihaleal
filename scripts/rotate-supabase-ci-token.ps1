<#
  GitHub Actions'taki SUPABASE_ACCESS_TOKEN secret'ını yeni (sınırlı) bir token ile değiştirir.
  Token'ı ekrana YAZDIRMAZ, dosyaya yazmaz; panodan okur, biçimini doğrular, secret'a aktarır.

  KULLANIM
    1) Supabase Dashboard -> Account -> Access Tokens -> "Generate new token"
       (ad: ihaleal-ci-migrations gibi). Çıkan sbp_... değerini KOPYALAYIN (panoya).
    2) PowerShell'de:   .\scripts\rotate-supabase-ci-token.ps1
       (workflow'u da hemen çalıştırmak için:  .\scripts\rotate-supabase-ci-token.ps1 -Trigger)
    3) İşiniz bitince eski (cli_user@...) token'ı Dashboard'dan iptal edin (Revoke).

  Gereksinim: gh CLI (giriş yapılmış).
#>
param(
  [string]$Repo = "yagiztugrul33/ihaleal",
  [string]$SecretName = "SUPABASE_ACCESS_TOKEN",
  [switch]$Trigger
)
$ErrorActionPreference = "Stop"

$gh = (Get-Command gh -ErrorAction SilentlyContinue).Source
if (-not $gh) {
  $gh = Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Recurse -Filter gh.exe -ErrorAction SilentlyContinue |
        Select-Object -First 1 -ExpandProperty FullName
}
if (-not $gh) { throw "gh CLI bulunamadi (winget install GitHub.cli)." }

$token = (Get-Clipboard -Raw).Trim()
if ($token -notmatch '^sbp_(oauth_)?[a-f0-9]{40}$') {
  throw "Panodaki deger Supabase erisim token'i bicimine (sbp_ + 40 hex) uymuyor. Token'i kopyaladiniz mi?"
}

$before = & $gh secret list -R $Repo | Select-String "^$SecretName\s"
& $gh secret set $SecretName -R $Repo --body $token | Out-Null
if ($LASTEXITCODE -ne 0) { throw "gh secret set basarisiz (cikis kodu $LASTEXITCODE)." }
$token = $null
Set-Clipboard -Value " "   # panoyu temizle

$after = & $gh secret list -R $Repo | Select-String "^$SecretName\s"
Write-Output "Once : $before"
Write-Output "Sonra: $after"
if ("$before" -eq "$after") { Write-Warning "Zaman damgasi degismedi; secret guncellenmemis olabilir." }

if ($Trigger) {
  & $gh workflow run supabase-v2-deploy.yml -R $Repo --ref main
  Start-Sleep -Seconds 10
  $id = & $gh run list --workflow supabase-v2-deploy.yml -R $Repo --limit 1 --json databaseId -q '.[0].databaseId'
  & $gh run watch $id -R $Repo --exit-status --interval 10
}
