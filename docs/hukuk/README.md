# Hukuk taslakları ve kaynak sözleşmeler

## Üçüncü taraf örnek PDF (sizin tarafınızdan)

Örnek tarama dosyası örnek yollar (yerel):  
`C:\Users\yagiz\Downloads\CamScanner 4-23-26 10.24.pdf`  
Eski workspace yolu da kullanılabilir; repoya koyarken `kaynak/` altında yeniden adlandırın.

**Kaybolmaması için:**

1. PDF’yi repoya kopyalayın (örnek ad): `docs/hukuk/kaynak/ORNEK_ARACILIK_SOZLESME_TARAMA.pdf`
2. Bu dosya **üçüncü taraf telifidir**; public repo’ya koymayacaksanız `.gitignore` ile `kaynak/*.pdf` hariç tutun veya yalnızca şirket içi arşivde saklayın.
3. Avukat, `docs/hukuk/YETKI_VE_ARACILIK_TASLAK_CERCEVE.md` ile PDF maddelerini **madde madde eşleştirir**; nihai metin `SOZLESMESONRASI_TEK_KOMUT.md` §I tablosuna işlenir.

## Dosyalar

| Dosya | Amaç |
|--------|------|
| `YETKI_VE_ARACILIK_TASLAK_CERCEVE.md` | ihaleal.com için **orijinal** madde iskeleti (üçüncü taraf marka metninin kopyası değil). |
| `FINANCE_TAX_BILLING_CORE_RULES_TASLAK.md` | Finans / e-Fatura / Teknokent — ürün taslağı (avukat + YMM). |
| `KIRALIK_DEVREN_ANAYASASI_TASLAK.md` | Kiralık & devren kuralları özeti (`rentalCommissionEngine` ile uyum). |
| `KKA_SOZLESME_VE_KAZANC_PLANI_TASLAK.md` | Kat karşılığı sözleşme iskeleti ve gelir çerçevesi. |
| `SUPABASE_RLS_AUDIT_RPC_UYUM_KONTROL_LISTESI.md` | Supabase migration’daki **RLS politika adları**, `audit_log` ve **RPC** ile bire bir eşleşen teknik uyum / denetim izi kontrol listesi (site: `#/yasal/supabase-uyum`). |
| `kaynak/` | Örnek / karşılaştırma PDF’leri (isteğe bağlı). |

**Uyarı:** Buradaki metinler hukuki danışmanlık değildir; imzalanabilir sözleşme yalnızca Türkiye’de yetkili avukat onayından sonra kullanılır.
