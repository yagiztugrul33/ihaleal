# İhaleAL — iOS / Android Store Review Risk Listesi

**Doküman:** Store Review Risk Matrix  
**Hedef:** Apple App Store + Google Play Store  
**Son Güncelleme:** 2026-05-04

---

## Risk Seviyesi Renk Kodları

| Emoji | Seviye | Tanım |
|-------|--------|-------|
| 🔴 | **Kritik** | Kesin reddetme sebebi, mimari değişiklik gerektirir |
| 🟠 | **Yüksek** | Yüksek reddetme olasılığı, UX/iş akışı değişikliği gerekir |
| 🟡 | **Orta** | İnceleme süresi uzar veya ek açıklama ister, düşük reddetme riski |
| 🟢 | **Düşük** | Genellikle geçer, sadece metadata/başvuru metni etkilenir |

---

## Fasıl 1 — Kayıt & Misafir Mod (Auth)

### 🔴 Kritik: Zorunlu Kayıt (Forced Registration)
- **Risk:** Apple Guideline 5.1.1 — Uygulama temel fonksiyonlarını görmek için kayıt zorunluysa reddedilir.
- **Çözüm:** Misafir mod (Guest Mode) eklenmiştir. `/api/v2/auth/guest` endpoint'i ile 20 ilan detayı görüntüleme hakkı verilir. Ana sayfa, arama ve filtreleme kayıtsız çalışır.
- **Uygulama:** `WelcomeScreen`'de "Misafir Olarak Devam Et" butonu en az "Giriş Yap" kadar belirgin.

### 🟠 Yüksek: Sosyal Giriş Tekelleği
- **Risk:** Sign in with Apple zorunluluğu (Apple Guideline 4.8). Eğer Facebook/Google giriş varsa Apple Sign In de olmalı.
- **Çözüm:** Expo `expo-apple-authentication` entegre edilecek. Apple girişi diğerleri kadar görünür.
- **Not:** Sadece telefon numarası girişi ile Apple Sign In'dan kaçınılamaz.

### 🟡 Orta: KVKK Onayı UX
- **Risk:** Apple Guideline 5.1.1(i) — Kişisel veri toplamadan önce açık rıza. Kayıt öncesi scroll-to-end zorunlu.
- **Çözüm:** `KVKKConsentScreen`'de kullanıcı en alta kadar kaydırana kadar onay checkbox'ı disabled kalır. Tam metin yerine (yerel kaynaklardan) hash kontrolü yapılır.
- **Uygulama:** `LegalConsentModal.tsx` web'de olduğu gibi, mobilde `scrollEndHash` ile 30 günlük geçerlilik.

---

## Fasıl 2 — Güvenlik & Cihaz Bağlama

### 🟠 Yüksek: Cihaz Bağlama & Attestation
- **Risk:** Apple, uygulamanın cihazı "tanımladığını" görürse (fingerprinting) Guideline 5.1.2 ihlali iddiası.
- **Çözüm:** Cihaz ID'si sadece güvenlik amaçlı (dolandırıcılık önleme) kullanılır. `App Tracking Transparency` popup'ı gösterilir. Kullanıcı reddederse misafir mod ile sınırlı fonksiyonellik sunulur.
- **Uygulama:** `expo-tracking-transparency` + `ATT` izni alınmadan cihaz fingerprint oluşturulmaz.

### 🟡 Orta: Root / Jailbreak Tespiti
- **Risk:** Apple root tespiti kullanan uygulamaları bazen "güvenlik" gerekçesiyle sorgular.
- **Çözüm:** Root tespiti sadece finansal işlemleri bloke eder, uygulamayı tamamen engellemez. Kullanıcıya "Güvenli ortamda işlem yapınız" mesajı gösterilir.
- **Uygulama:** `security/device-bind` endpoint'inde `isRooted=true` ise sadece `wallet` ve `bid` endpoint'leri 403 döner.

### 🟢 Düşük: Biometrik Doğrulama
- **Risk:** Face ID / Touch ID kullanımı için Info.plist `NSFaceIDUsageDescription` açıklaması gereklidir.
- **Çözüm:** `Info.plist`'e "Kolay ve güvenli giriş için Face ID kullanılır" açıklaması eklendi.

---

## Fasıl 3 — Hemen Al (Buy It Now)

### 🔴 Kritik: Haksız Rekabet / Fiyat Sabitleme
- **Risk:** Google Play "Deceptive Behavior" ve Apple "Unfair Competition" politikaları. Fiyatı kitlemek "tüketiciyi zorlayıcı" görülebilir.
- **Çözüm:** 15 dakikalık kilit UX'te net şekilde açıklanır: "Bu fiyat size özel 15 dakika boyunca saklanmaktadır. Süre dolmadan ödeme yapabilirsiniz." İptal her an mümkündür.
- **Uygulama:** `BuyNowScreen`'de geri sayım ekranı + "Fiyatı İptal Et" butonu her zaman aktif.

### 🟠 Yüksek: Offline Senkronizasyon
- **Risk:** "Offline ödeme başlatıldı, online olunca işlendi" senaryosu Apple'da "confusing user experience" olarak değerlendirilebilir.
- **Çözüm:** Offline ödeme sadece "kilit yenileme" olarak davranır. Gerçek ödeme mutlaka online olmalı. Kullanıcıya "İnternet bağlantınız yok, ödeme yapılamaz" mesajı gösterilir.
- **Uygulama:** `BuyNowCheckoutScreen` açılmadan önce `navigator.onLine` (RN equivalent: NetInfo) kontrolü.

---

## Fasıl 4 — Ödeme & Provizyon

### 🔴 Kritik: Kripto / Alternatif Ödeme
- **Risk:** Apple In-App Purchase (IAP) zorunluluğu. Uygulama içi kredi, jeton veya sanal para satılıyorsa %30 komisyon Apple'a gider.
- **Çözüm:** İhaleAL "fiziksel gayrimenkul" platformudur. IAP kapsamına girmez. Ancak "cüzdan" ve "bloke" sistemleri sanal bakiye gibi görünebilir.
- **Mitigasyon:** Bloke = geçici provizyon, satın alma değil. Cüzdan = sadece iade bekleyen tutarlar. Her iki işlem de banka kartından direkt çekilir, platform içi kredi değildir.
- **Uygulama:** `WalletScreen`'de bakiye her zaman `0` veya negatif (bloke) gösterilir. Pozitif bakiye saklanmaz.

### 🟠 Yüksek: 3DS WebView Akışı
- **Risk:** Apple, ödeme için Safari/WebView açmayı "kullanıcıyı uygulamadan çıkarma" olarak görür. Ancak 3DS banka zorunluluğudur.
- **Çözüm:** `react-native-webview` içinde 3DS akışı yapılır, Safari dışına çıkılmaz. WebView `SFSafariViewController` yerine inline WebView kullanır.
- **Not:** PayTR/İyzico'nun mobil SDK'ları varsa native SDK tercih edilmelidir.

### 🟡 Orta: 1₺ Provizyon Doğrulama
- **Risk:** Kullanıcı bilinçsizce 1₺ çekildiğini görürse şikayet edebilir.
- **Çözüm:** Kart ekleme akışında "Kartınızı doğrulamak için 1₺ geçici provizyon oluşturulacaktır. Bu tutar 24 saat içinde iade edilir." açıklaması zorunlu.
- **Uygulama:** `AddCardScreen`'de onay modalı.

---

## Fasıl 5 — OCR & Fotoğraf

### 🟡 Orta: EXIF Veri Şeridi (GPS)
- **Risk:** Fotoğraflardan konum bilgisi çıkarılması Apple'da "privacy" sorgusu oluşturur.
- **Çözüm:** `expo-image-picker` ile seçilen görseller `expo-image-manipulator` ile EXIF şeridi atılarak yüklenir. `removeGPSData: true` zorunlu.
- **Uygulama:** `ai_engine/TapuOCRService.ts`'de `stripExif` fonksiyonu.

### 🟡 Orta: Kamera İzni Açıklaması
- **Risk:** `NSCameraUsageDescription` eksik veya yetersizse reddedilir.
- **Çözüm:** "Tapu fotograflarınızı otomatik okumak ve veri girişini hızlandırmak için kamera kullanılır." açıklaması.

---

## Fasıl 6 — Canlı İhale & WebSocket

### 🟢 Düşük: Gerçek Zamanlı Veri
- **Risk:** Genellikle bir risk değil. Apple/Google canlı içeriği destekler.
- **Not:** Ancak " Kumar / Şans Oyunu" kategorisine girme riski var.
- **Mitigasyon:** İhale = "açık artırma" (auction), kumar değil. Tüm açıklamalarda "gayrimenkul açık artırma platformu" vurgusu.
- **Uygulama:** App Store başvuru metni ve ekran görüntüleri "Emlak / Gayrimenkul" kategorisinde hazırlanır.

### 🟡 Orta: Anti-Sniper Geri Sayım Uzatma
- **Risk:** Kullanıcıyı "bekletme" olarak algılanabilir.
- **Çözüm:** Uzatma kuralları ihale başlamadan önce açıkça belirtilir. "Son 2 dakikada teklif gelirse süre 5 dakika uzar (max 3 kez)."
- **Uygulama:** `AuctionDetailScreen`'de ihale kuralları expandable accordion.

---

## Fasıl 7 — Push Bildirim & Chat

### 🟢 Düşük: Push Bildirim İzin UX
- **Risk:** iOS 17+ otomatik izin iptali.
- **Çözüm:** `expo-notifications`'ta bildirim izni kullanıcı anlamlı bir aksiyon sonrası istenir (örn: "Teklif ver" butonuna basınca "Teklif durumunuzu bildirimle takip edin?").
- **Uygulama:** Primer pattern — doğrudan sistem popup'ı yerine önce custom modal.

### 🟡 Orta: Telefon Masking / Numara Paylaşımı
- **Risk:** Apple/Google kullanıcıları uygulama dışına çıkarmak istemez.
- **Çözüm:** Telefon numaraları sözleşme imzalanana kadar masked kalır. WhatsApp/SMS entegrasyonu yoktur. Tüm iletişim uygulama içi chat üzerinden.
- **Uygulama:** `ChatService.ts`'de `maskPhone()` fonksiyonu.

---

## Fasıl 8 — Emlakçı Paneli (Net-30)

### 🟢 Düşük: Fatura Yükleme (Document Picker)
- **Risk:** `UIDocumentPickerViewController` açıklaması gerekebilir.
- **Çözüm:** `expo-document-picker` ile PDF/JPG/PNG fatura yükleme. Açıklama: "Ödeme alabilmek için fatura yüklemeniz gerekmektedir."

### 🟡 Orta: Net-30 Ödeme Vaadi
- **Risk:** Apple "finansal hizmet" kategorisine girme iddiası.
- **Çözüm:** Net-30 = komisyon ödemesi gecikmesi değil, "emlakçıya ödeme takvimi". Platform banka HVALE/EFT yapar. Fintech değil, pazaryeri modeli.
- **Uygulama:** `RealtorDashboardScreen`'de "Komisyon Ödeme Takvimi" olarak adlandırılır.

---

## Fasıl 9 — KKA Harita

### 🟡 Orta: Konum İzni (Background)
- **Risk:** `NSLocationAlwaysUsageDescription` gereklidir. Background konum izni reddedilebilir.
- **Çözüm:** KKA 500m radius için sadece `NSLocationWhenInUseUsageDescription` yeterlidir. Background konum gereksizdir — kullanıcı haritayı açtığında foreground konum alınır.
- **Uygulama:** `KKAMapScreen`'de `useForegroundLocation` hook'u.

### 🟢 Düşük: Harita Sağlayıcısı
- **Risk:** Google Maps kullanımı Apple'da sorun değil, Apple Maps kullanımı Google'da sorun değil.
- **Çözüm:** `react-native-maps` ile her iki sağlayıcı da desteklenir. Platform varsayılanı kullanılır.

---

## Fasıl 10 — Sözleşme & Onay

### 🟠 Yüksek: PDF İmzalama / e-İmza
- **Risk:** Apple, "imza" işlemini uygulama içi IAP ile ilişkilendirebilir.
- **Çözüm:** İmza = SMS onay kodu veya biyometrik onay. Ücretli e-İmza (Nitelikli) kullanılmaz. Temel onay yeterlidir.
- **Uygulama:** `contracts/sign` endpoint'inde `signature.type: "sms_onay"` varsayılan.

### 🟡 Orta: Scroll-to-End Zorunluluğu
- **Risk:** Apple Guideline 5.1.1 — Kullanıcı onay vermeden önce metni görmelidir.
- **Çözüm:** Sözleşme PDF'si WebView/ScrollView içinde tamamen görüntülenir. Kullanıcı en alta inmeden "Onaylıyorum" butonu disabled. Scroll pozisyonu loglanır (`scrollEndHash`).
- **Uygulama:** `ContractDetailScreen`'de `scrollEventThrottle` + `onScroll` ile pozisyon takibi.

---

## Genel Red Riskleri (Platform Bağımsız)

### 🔴 Kritik: Sahte İlan / Dolandırıcılık
- **Risk:** Platformda sahte ilan olursa uygulama " facilitating fraud" gerekçesiyle kaldırılır.
- **Çözüm:**
  1. AI OCR tapu doğrulama
  2. Emlakçılar için T.C. kimlik + vergi no doğrulaması
  3. Kullanıcı raporlama butonu (her ilanda)
  4. Admin moderasyon paneli (web üzerinden)
  5. Trust & Safety ekibi iletişim bilgisi
- **Uygulama:** `ListingDetailScreen`'de "Şüpheli İlan Bildir" butonu → 3 kategori (Sahte İlan, Yanıltıcı Fiyat, Tekrar Yayınlanmış).

### 🟠 Yüksek: İçerik Moderasyon
- **Risk:** Kullanıcı üretimli içerik (ilan açıklamaları, mesajlar) yasaklı kelime içerirse platform sorumlu.
- **Çözüm:**
  1. `ChatService.ts`'de mesaj filtreleme (küfür, telefon numarası, harici link)
  2. `ListingService.ts`'de ilan başlık/açıklama AI moderasyon
  3. `ReportService.ts`'de raporlama sistemi
- **Uygulama:** Backend `ContentModerationEngine` + Client `MessageFilter`.

### 🟡 Orta: Erişilebilirlik (Accessibility)
- **Risk:** Apple/Google a11y eksikliği nedeniyle ret nadirdir ancak "premium" uygulamalar için beklentidir.
- **Çözüm:** Tüm butonlar `accessibilityLabel` + `accessibilityRole`. Renk kontrastı WCAG 2.1 AA.
- **Uygulama:** Her ekran için `a11y` test checklist'i.

### 🟢 Düşük: Uygulama Boyutu
- **Risk:** APK > 150MB veya IPA > 200MB App Bundle'a zorlar.
- **Çözüm:** Hedef: APK < 45MB, IPA < 55MB. `expo-updates` OTA güncellemeleri kullanılır. Asset'ler CDN'den lazy-load.

---

## Başvuru Öncesi Kontrol Listesi

### Apple App Store
- [ ] Misafir mod çalışıyor (kayıtsız ilan görüntüleme)
- [ ] Sign in with Apple entegre
- [ ] ATT (App Tracking Transparency) izni isteniyor
- [ ] Kamera / Fotoğraf / Konum açıklamaları Info.plist'de
- [ ] Face ID açıklaması Info.plist'de
- [ ] Demo hesabı sağlandı (reviewer için test@ihaleal.com / Review2026!)
- [ ] Video: Hemen Al akışı (15dk kilitleme → ödeme → başarı)
- [ ] Başvuru metni: "Gayrimenkul açık artırma ve doğrudan satış platformu."

### Google Play Store
- [ ] Target API Level 34+
- [ ] Privacy Policy URL (web sitesinde KVKK sayfası)
- [ ] Data Safety Form dolduruldu (konum, kamera, ödeme bilgisi)
- [ ] AB/EEA kullanıcıları için GDPR/KVKK consent
- [ ] 20+ dilde store listing (önemli: Türkçe, İngilizce)
- [ ] AAB (Android App Bundle) formatında build

---

*Bu risk listesi İhaleAL mobil uygulamasının App Store ve Play Store review süreçlerinde karşılaşılabilecek engelleri minimize etmek için hazırlanmıştır.*
