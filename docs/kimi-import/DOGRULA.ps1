# Kimi gorev* teslim kontrolu (beklenen dosya listesi tablo ile uyumlu)
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$expected = @(
  "gorev1_ihaleler.json",
  "gorev2_saticilar.json",
  "gorev3_alicilar.json",
  "gorev4_sss.md",
  "gorev5_eposta.md",
  "gorev6_blog.md",
  "gorev7_kampanyalar.md",
  "gorev8_push.md",
  "gorev9_tooltips.md",
  "gorev10_hata.md",
  "gorev11_yorumlar.md",
  "gorev12_sozlesmeler.md",
  "gorev13_sosyal.md",
  "gorev14_reels.md",
  "gorev16_sehirler.md",
  "gorev17_sozluk.md",
  "gorev18_komisyon.md",
  "gorev19_case_study.md",
  "gorev20_yatirim.md",
  "gorev21_app_store.md",
  "gorev22_basin.md",
  "gorev23_drip.md",
  "gorev24_bankalar.md",
  "gorev25_tapu_rehber.md",
  "gorev26_kyc.md",
  "gorev27_ilan_rehber.md",
  "gorev28_teklif_rehber.md",
  "gorev29_veri_guvenligi.md",
  "gorev30_roadmap.md"
)

Write-Host "Klasor: $root"
Write-Host ""

$missing = @()
$ok = @()
foreach ($name in $expected) {
  $p = Join-Path $root $name
  if (-not (Test-Path -LiteralPath $p) -and $name -match "^gorev22_") {
    $hit = Get-ChildItem -LiteralPath $root -Filter "gorev22_*.md" -File -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($hit) { $p = $hit.FullName; $name = $hit.Name }
  }
  if (-not (Test-Path -LiteralPath $p)) {
    $missing += $name
    continue
  }
  $fi = Get-Item -LiteralPath $p
  $kb = [math]::Round($fi.Length / 1024, 1)
  $md5 = (Get-FileHash -LiteralPath $p -Algorithm MD5).Hash.ToLowerInvariant()
  $extra = ""
  if ($p -match "\.json$") {
    try {
      $raw = Get-Content -LiteralPath $p -Raw -Encoding UTF8
      $j = $raw | ConvertFrom-Json
      if ($j -is [System.Collections.IEnumerable] -and $j -isnot [string]) {
        $extra = " JSON eleman: " + @($j).Count
      } elseif ($j.PSObject.Properties) {
        $extra = " JSON ozellik: " + @($j.PSObject.Properties).Count
      }
    } catch {
      $extra = " JSON parse HATA: " + $_.Exception.Message
    }
  }
  $ok += "${name}: ${kb} KB, MD5=${md5}${extra}"
}

foreach ($line in $ok) { Write-Host $line }
Write-Host ""
if ($missing.Count -gt 0) {
  Write-Host "EKSik ($($missing.Count)):"
  $missing | ForEach-Object { Write-Host "  - $_" }
  exit 2
}
Write-Host "Tum beklenen dosyalar mevcut ($($expected.Count) adet)."
exit 0
