Kimi ciktisi (gorev* / output.zip) bu klasore gelmeli.

output.zip (Kimi):
  A) Indirme URL'si varsa:
     powershell -NoProfile -ExecutionPolicy Bypass -File "INDIR_VE_CIKAR_OUTPUT.ps1" -Url "https://..."
  B) Zip zaten indiyse (Downloads\output.zip veya Desktop\output.zip):
     OUTPUT_ZIP_CIKAR.bat
  C) Zip baska yerdeyse surukle OUTPUT_ZIP_CIKAR.bat uzerine veya:
     OUTPUT_ZIP_CIKAR.bat "C:\tam\yol\output.zip"

Genel zip (dosya adi farkli):
  CIKAR_ZIP.bat "C:\yol\paket.zip"

Dogrulama (29 dosya listesi):
  powershell -NoProfile -ExecutionPolicy Bypass -File "DOGRULA.ps1"
