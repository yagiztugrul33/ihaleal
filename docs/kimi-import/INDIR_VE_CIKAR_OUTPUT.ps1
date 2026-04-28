# Kimi output.zip: indir (URL verilirse) ve kimi-import klasorune ac.
# Kullanim:
#   powershell -NoProfile -ExecutionPolicy Bypass -File INDIR_VE_CIKAR_OUTPUT.ps1 -Url "https://..."
#   powershell ... -ZipPath "C:\Users\yagiz\Downloads\output.zip"
#   (parametresiz) Once Downloads, sonra Desktop'ta output.zip arar.
param(
  [string] $Url = "",
  [string] $ZipPath = ""
)

$ErrorActionPreference = "Stop"
$here = $PSScriptRoot
if (-not (Test-Path -LiteralPath $here)) { throw "Klasor yok: $here" }

$zipLocal = Join-Path $here "output.zip"

if ($Url -ne "") {
  Write-Host "Indiriliyor: $Url"
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  Invoke-WebRequest -Uri $Url -OutFile $zipLocal -UseBasicParsing
  $ZipPath = $zipLocal
}

if ($ZipPath -eq "") {
  $candidates = @(
    (Join-Path $env:USERPROFILE "Downloads\output.zip"),
    (Join-Path $env:USERPROFILE "Desktop\output.zip"),
    (Join-Path $here "output.zip")
  )
  foreach ($c in $candidates) {
    if (Test-Path -LiteralPath $c) { $ZipPath = $c; break }
  }
}

if ($ZipPath -eq "" -or -not (Test-Path -LiteralPath $ZipPath)) {
  Write-Host @"
output.zip bulunamadi.

1) Kimi'den indirme baglantisini (URL) kopyalayin, sonra:
   powershell -NoProfile -ExecutionPolicy Bypass -File "$here\INDIR_VE_CIKAR_OUTPUT.ps1" -Url "YAPISTIR"

2) Veya zip'i kaydedin ve yol verin:
   powershell -NoProfile -ExecutionPolicy Bypass -File "$here\INDIR_VE_CIKAR_OUTPUT.ps1" -ZipPath "C:\tam\yol\output.zip"

3) Veya output.zip dosyasini Surukleyip CIKAR_ZIP.bat uzerine birakin.
"@
  exit 1
}

Write-Host "ZIP: $ZipPath"
$tmp = Join-Path $here "_extract_tmp"
if (Test-Path -LiteralPath $tmp) { Remove-Item -LiteralPath $tmp -Recurse -Force }
New-Item -ItemType Directory -Path $tmp | Out-Null
& tar.exe -xf $ZipPath -C $tmp
if ($LASTEXITCODE -ne 0) { throw "tar basarisiz (exit $LASTEXITCODE)" }

$top = Get-ChildItem -LiteralPath $tmp -Force
if ($top.Count -eq 1 -and $top[0].PSIsContainer) {
  $inner = Get-ChildItem -LiteralPath $top[0].FullName -Force
  foreach ($it in $inner) {
    $dest = Join-Path $here $it.Name
    if (Test-Path -LiteralPath $dest) { Remove-Item -LiteralPath $dest -Recurse -Force }
    Move-Item -LiteralPath $it.FullName -Destination $here -Force
  }
  Remove-Item -LiteralPath $top[0].FullName -Force
} else {
  foreach ($it in $top) {
    $dest = Join-Path $here $it.Name
    if ($it.Name -eq "_extract_tmp") { continue }
    if (Test-Path -LiteralPath $dest) { Remove-Item -LiteralPath $dest -Recurse -Force }
    Move-Item -LiteralPath $it.FullName -Destination $here -Force
  }
}

Remove-Item -LiteralPath $tmp -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Cikarma tamam: $here"
Write-Host "Dogrulama icin: .\DOGRULA.ps1"
exit 0
