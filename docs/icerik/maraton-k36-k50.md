# Kimi maraton çıktıları (K36–K50) — Cursor tarafından dosyalandı

**Kaynak:** kullanıcı maraton komutu + patron §A. **Hukuki bağlayıcılık yok**; imza öncesi avukat onayı şart. **Varsayım:** Rakip sözleşme PDF’si okunmadı (telif + OCR yok).

---

## K36 — Yetki sözleşmesi kullanıcı özeti (kısaltılmış)

ihaleal.com ile çalıştığınızda gayrimenkulünüzün satışı veya kiralanması sürecinde **tek muhatap** olarak platformu kullanırsınız: ilanda alıcı veya kiracıya doğrudan telefon gösterilmez; talepler ve teklifler kayıt altında size iletilir. Hedef modelde **yetki sözleşmesi**, süreci platform dışına taşımadan yürütmenizi ve aracılık komisyonunun yalnızca **anlaşılan işlem tutarı** üzerinden doğmasını tanımlar. Kiralıkta hedef ücret: **kiraya verenden bir aylık kira + KDV** (kiracıdan ilan ücreti yok). “Çevresinde dolaşarak” platformu bypass etme yükümlülükleri hukuk paketinde açık yazılmalıdır — burada yalnızca ürün fikri anlatılır. **Avukat onayı olmadan imzalanmaz.**

---

## K37 — Taahhüt + cezai şart (SSS örnekleri)

1. **Alt / üst limit ne işe yarar?** Satıcı veya kiraya veren fiyat bandını beyan eder; üst limite ulaşıldığında işlemi tamamlama hedefi sözleşmede tanımlanır.  
2. **İhlal olursa?** Müspet zarar veya sözleşmede yazılı cezai şart (oranı avukat belirler).  
3. **Alıcı / kiracı?** Teklif veya kabul aşamasında simetrik kurallar aynı pakette olmalıdır (taslak).  
4. **Demo ile canlı aynı mı?** Hayır; canlıda imza ve ödeme entegrasyonu gerekir.

---

## K38 — Ekspertiz paketi (checklist özeti)

- SPK düzenine uygun ekspertiz raporu.  
- Şerh, ipotek, haciz ve benzeri takyidat özeti.  
- Sahte evrak riski: AI ön tarama + insan onayı; nihai hukuk uzmanında.

---

## K39 — Resmi belgeler butonu (broşür cümlesi)

İmar planı notları, belediye yazıları ve varsa idari yargı özeti alıcı veya kiracıya **ilan detayında ayrı butonla** sunulur; amaç tapu öncesi şeffaflıktır.

---

## K40 — Piyasa raporu dili

Üçüncü taraf **bölge / fiyat raporu** (örnek kaynak olarak Endeksa benzeri PDF) yüklenir; platform yapay zeka destekli **özet ve tutarlılık** sunar — resmi ekspertiz yerine geçmez.

---

## K41–K43 — Yolculuk başlıkları

- **Alıcı:** Arama → ilan kartı belge şeridi → detayda rapor / resmi belge butonları → teklif (üretimde KYC).  
- **Satıcı:** İlan aç → rapor + ekspertiz + taahhüt alanları → yayın.  
- **Kira:** Aynı üç mod; ücret kiraya verenden bir aylık kira çizgisi (hedef).

---

## K44 — E-posta taslak konu satırları

- `[ihaleal] Ekspertiz dosyası eksik` — Gövde: ilan no + PDF yükleme hatırlatması (üretim).  
- `[ihaleal] Resmi belge paketi güncellendi` — Gövde: ilan no + incele linki (üretim).

---

## K45 — Moderasyon (ek cümle)

Sahte teklif veya **sahte / çelişkili evrak** tespitinde ilan dondurma ve sözleşmedeki yaptırımlar uygulanır (hedef).

---

## K46 — Risk register (+10 kısa satır)

| Risk | Not |
|------|-----|
| Rapor telif | Üçüncü taraf PDF kullanıcı sorumluluğu |
| Limit ihlali | Delil ve sözleşme şartı |
| KVKK | Kişisel veri minimizasyonu |
| AI halüsinasyonu | İnsan onayı zorunlu |
| Ödeme temerrüdü | Escrow hedefi |
| Tapu sürpriz | Resmi belge butonu ile azaltma hedefi |
| Findeks erişimi | Üretim API |
| Demo / canlı karışması | DemoBanner |
| Çok taraflı anlaşmazlık | Tahkim / mahkeme seçimi avukat |
| Veri güvenliği | RLS + şifreleme (backend) |

---

## K47 — İngilizce pitch (1 paragraf)

ihaleal.com is a Turkey-focused, AI-assisted residential and commercial marketplace that keeps listings professional: no party phone numbers on cards, structured documents (market PDF, SPK appraisal, municipal/zoning summaries), and a commission-only revenue target on successful closings—plus a one-month-rent-from-landlord line for rentals. Legal wording is counsel-approved before launch.

---

## K48 — Video senaryo (90 sn, sahne başlıkları)

1. Ekranda ilan kartı + belge chip’leri.  
2. Detay: iki buton (rapor analizi, resmi belgeler).  
3. Ses: “Tek muhatap ihaleal.com”.  
4. Kapanış: “Avukat onaylı sözleşme ile üretim”.

---

## K49 — Route listesi (Cursor teyit — özet)

Örnek: `/`, `/ihale-ac`, `/ilan/:id`, `/veri-ve-endeks`, `/sat-basla`, `/karsilastir`, `/arama` — tam liste `src/App.tsx` içinde.

---

## K50 — Özet satırı

`Özet: K36–K50 dosyalandı | varsayım: PDF madde eşlemesi yok | Cursor’a: bu dosya + patch seti`
