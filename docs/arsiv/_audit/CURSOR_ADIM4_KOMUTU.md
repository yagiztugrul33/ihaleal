# Cursor Komutu — Adım 4: Mobile UI bağlama

**Hazırlayan:** Claude Code (main branch — ana worktree)
**Hedef worktree:** `ihaleal-mobile`, branch: `feat/mobile-calculators`
**Bağlam:** Adım 2 (mobile facade altyapısı) tamamlandı (commit `deb6b18`); 3 facade hazır:
- `registerBidDeposit` (depositRegister.ts)
- `executeBuyNow` (buyNow.ts)
- `submitBid` (bidActions.ts — D-7 setTimeout kaldırıldı, gerçek place_bid RPC)

Bu turda mobile UI ekranları **mock → gerçek RPC akışına** bağlanacak.

---

## ⚠️ AŞAĞIDAKİ TÜM METNİ CURSOR'A YAPIŞTIR

---

```
GÖREV — Adım 4: Mobile UI ekranlarını gerçek RPC akışına bağla

Ana worktree (ihaleal, main branch) Claude Code 3 mobile facade'i tamamladı
(mobile/shared/ altında):
  - registerBidDeposit: register_bid_deposit RPC (KYC guard sunucuda)
  - executeBuyNow:       execute_buy_now RPC (KYC + deposit guard sunucuda)
  - submitBid:           place_bid RPC (bond guard sunucuda — security bundle
                         20260527130100 sonrası gerçek). D-7 setTimeout fake-
                         success kaldırıldı, mevcut imza geri-uyumlu.

Senin işin: 4 mobile UI ekranını mock'tan gerçek RPC akışına bağla. Her birinde
discriminated union sonuçlara göre UI feedback + KYC redirect handler.

WORKTREE: ihaleal-mobile (feat/mobile-calculators — kendi alanın, HEAD: deb6b18)
KAPSAM: SADECE mobile/src/app/** — UI ekranları
DOKUNMA: mobile/shared/** (Adım 2 tamamlandı), src/** (web — ana worktree'nin)

═══════════════════════════════════════════════════════════════════════════
KAPSAM — 4 EKRAN
═══════════════════════════════════════════════════════════════════════════

ADIM 4.1 — mobile/src/app/ihale/[id]/teklif.tsx
  Mock submitMock → gerçek 2-aşamalı akış:
    a) registerBidDeposit({context:'bid', listingId, auctionId, base, deposit}) → depositId
    b) submitBid({auctionId, bidderId, currentBid, newBid, minIncrement, userMaxProxy?})
  SubmitBidOutcome 7-case handling:
    - ok=true,  status='accepted'                → "Teklif kaydedildi" alert + close
    - ok=false, code='validation' (pure)         → Min tutar hata mesajı (mevcut UX)
    - ok=false, code='deposit_required'          → "Önce teminat" alert
    - ok=false, code='kyc_required' (deposit'ten) → KYC redirect (aşağı)
    - ok=false, code='rate_limited'              → "Çok sık deneme" + cooldown
    - ok=false, code='bid_too_low'               → Min tutar vurgula
    - ok=false, code='auction_ended'             → "İhale kapandı" + listeye dön
    - ok=false, code='auth_required'             → Login redirect
    - Diğer (preconditions_failed/rpc_error/...) → Generic Alert

ADIM 4.2 — mobile/src/app/ihale/[id]/hemen-al.tsx
  Mock onMockBuyNow → gerçek 2-aşamalı akış:
    a) registerBidDeposit({context:'buy_now', listingId, auctionId, base, deposit}) → depositId
    b) executeBuyNow({listingId, depositId, idempotencyKey})
  ExecuteBuyNowResult 7-case handling:
    - ok=true,  status='ok'                  → "Hemen Al başarılı" alert + buyNowId göster
    - ok=true,  status='duplicate'           → "Zaten kayıtlı" info
    - ok=false, status='kyc_required'        → KYC redirect (aşağı)
    - ok=false, status='auth_required'       → Login redirect
    - ok=false, status='preconditions_failed' → Mesajı göster (rapor onayı/blokaj/listing eksik vb.)
    - ok=false, status='rpc_error'           → Generic Alert + retry buton
    - ok=false, status='config_missing'      → "Yapılandırma eksik" geliştirici uyarısı

ADIM 4.3 — mobile/src/app/ihale/[id]/kapali-teklif.tsx
  Sealed-bid backend YOK (production'da hiç çağrılan RPC yok — sistem röntgenli kanıtlı).
  DOKUNMA mevcut mock akışına — sadece üst kısmına "preview only" banner ekle:
    "⚠ Bu özellik henüz ön-izlemededir. Kapalı teklif backend hazır olduğunda etkinleşecek."
  D-6 önlem: kullanıcı yanıltıcı gerçek-gibi UX'ten korunur.

ADIM 4.4 — mobile/src/app/(tabs)/borsa.tsx hata handling güncellemesi
  submitBid imzası uyumlu, gerçek RPC otomatik aktif (Adım 2.3 ile).
  Mevcut handleSubmit (satır 98-142) sadece `result.ok` / `else` ayırıyor:
    `Alert.alert('Reddedildi', `${result.message}\nMin gerekli: ${formatTry(result.requiredMinimum)}`)`
  GÜNCELLE: result.code'a göre toast/alert detay (özellikle deposit_required):
    - result.code === 'deposit_required' → "Önce teminat yatırmalısınız" + butonla deposit ekranına
    - result.code === 'kyc_required'     → KYC redirect (aşağı)
    - result.code === 'rate_limited'     → "Çok sık deneme" + bekleme süresi
    - result.code === 'auction_ended'    → "İhale kapandı"
    - Diğer (validation/bid_too_low/rpc_error) → Mevcut "Reddedildi" akışı korunur

═══════════════════════════════════════════════════════════════════════════
KYC REDIRECT PATTERN (4 ekran için ORTAK)
═══════════════════════════════════════════════════════════════════════════

Tüm KYC_REQUIRED case'lerde aynı handler:

  import { Linking, Alert } from 'react-native';

  const handleKycRedirect = (message: string) => {
    Alert.alert(
      'KYC Doğrulaması Gerekli',
      message + '\n\nWeb sayfasında kimlik doğrulamayı tamamlayın, sonra bu ekrana dönün.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'KYC Sayfasını Aç',
          onPress: async () => {
            try {
              await Linking.openURL('https://www.ihaleal.com/kyc');
            } catch (e) {
              Alert.alert('Hata', 'KYC sayfası açılamadı. Tarayıcıdan ihaleal.com/kyc adresine gidin.');
            }
          },
        },
      ],
    );
  };

Not: AB10 ile web /kyc route'u mount edildi (ana worktree commit 3ab94a8).
KycSimulationPage şu an demo — production'da gerçek KYC provider entegrasyonu
ayrı bir tur (F1.1 release-blocker, AB2). UI redirect yine de doğru hedef.

═══════════════════════════════════════════════════════════════════════════
ŞABLON KOD — Adım 4.1 (teklif.tsx) referans
═══════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, router } from 'expo-router';

import { registerBidDeposit, submitBid } from '@/shared';
import { getSupabaseClient } from '../../(auth)/authClient';
import { FeedbackStateCard } from '@/components/FeedbackStateCard';

const DEPOSIT_RATE = 0.05;  // %5 bond bid context için (web ile parite)
const MIN_INCREMENT = 25_000;  // borsa.tsx ile uyumlu

export default function IhaleTeklifScreen() {
  const { id: auctionId } = useLocalSearchParams<{ id?: string }>();
  const [amount, setAmount] = useState('');
  const [proxy, setProxy] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleKycRedirect = (message: string) => {
    Alert.alert('KYC Doğrulaması Gerekli', message + '\n\nWeb sayfasında doğrulamayı tamamlayın.', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'KYC Sayfasını Aç',
        onPress: () => Linking.openURL('https://www.ihaleal.com/kyc').catch(() => {
          Alert.alert('Hata', 'Sayfa açılamadı. Tarayıcıdan ihaleal.com/kyc');
        }),
      },
    ]);
  };

  const handleSubmit = async () => {
    if (!auctionId) return;
    if (!consentAccepted) {
      Alert.alert('Onay gerekli', 'KVKK + teklif şartlarını onaylamanız gerekiyor.');
      return;
    }

    const parsedAmount = Number(amount.replace(/[^0-9]/g, ''));
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Geçersiz tutar', 'Pozitif bir tutar girin.');
      return;
    }
    const parsedProxy = proxy ? Number(proxy.replace(/[^0-9]/g, '')) : undefined;

    // Session'dan bidderId
    let bidderId: string | null = null;
    try {
      const client = await getSupabaseClient();
      const { data } = await client.auth.getSession();
      bidderId = data.session?.user?.id ?? null;
    } catch {
      bidderId = null;
    }
    if (!bidderId) {
      Alert.alert('Giriş gerekli', 'Teklif vermek için giriş yapmalısınız.');
      return;
    }

    setSubmitting(true);
    try {
      // 1) DEPOSIT — register_bid_deposit (KYC guard burada)
      // Not: listingId genelde auctionId ile aynı veya ilan tablosundan çekilir.
      // Mevcut mobil veri modelinde auctionId === listingId varsayımı geçerli mi
      // teyit et; değilse mock ihale verisinden listingId çıkar (mobile/src/app/
      // ihale veri kaynağına göre revize).
      const depositResult = await registerBidDeposit({
        listingId: auctionId,
        auctionId,
        context: 'bid',
        baseAmountTry: parsedAmount,
        depositAmountTry: Math.round(parsedAmount * DEPOSIT_RATE),
        preAuthRef: 'mock',  // mobile'da iyzico capture henüz yok
      });

      if (!depositResult.ok) {
        if (depositResult.status === 'kyc_required') {
          handleKycRedirect(depositResult.message);
        } else if (depositResult.status === 'auth_required') {
          Alert.alert('Giriş gerekli', depositResult.message);
          router.push('/(auth)/login');
        } else {
          Alert.alert('Teminat hatası', depositResult.message);
        }
        return;
      }

      // depositResult.ok === true, depositId mevcut

      // 2) BID — place_bid (bond guard sunucu deposit'i görür)
      const bidResult = await submitBid({
        auctionId,
        bidderId,
        currentBid: 0,  // borsa.tsx'te mevcut bid; bu ekrandaki currentBid kaynağı revize
        newBid: parsedAmount,
        minIncrement: MIN_INCREMENT,
        userMaxProxy: parsedProxy,
      });

      if (bidResult.ok) {
        Alert.alert('Teklif kaydedildi', `Son tutar: ₺${bidResult.finalAmount.toLocaleString('tr-TR')}${bidResult.proxy ? ' (vekil teklif uygulandı)' : ''}`);
        setAmount('');
        setProxy('');
        return;
      }

      // bidResult.ok === false, code'a göre handle
      switch (bidResult.code) {
        case 'kyc_required':
          handleKycRedirect(bidResult.message);
          break;
        case 'deposit_required':
          Alert.alert('Teminat gerekli', bidResult.message);
          break;
        case 'auth_required':
          Alert.alert('Giriş gerekli', bidResult.message);
          router.push('/(auth)/login');
          break;
        case 'rate_limited':
          Alert.alert('Çok sık deneme', bidResult.message + '\nLütfen biraz bekleyin.');
          break;
        case 'bid_too_low':
          Alert.alert('Teklif yetersiz', `${bidResult.message}\nMin gerekli: ₺${bidResult.requiredMinimum.toLocaleString('tr-TR')}`);
          break;
        case 'auction_ended':
          Alert.alert('İhale kapandı', bidResult.message);
          router.back();
          break;
        case 'listing_not_found':
          Alert.alert('İlan bulunamadı', bidResult.message);
          router.back();
          break;
        case 'config_missing':
          Alert.alert('Yapılandırma eksik', bidResult.message);
          break;
        default:
          Alert.alert('Reddedildi', bidResult.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Stack.Screen options={{ headerShown: true, title: 'Teklif Ver' }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>İhale Teklif Akışı</Text>
        <Text style={styles.subtitle}>İhale: {auctionId ?? 'bilinmiyor'}</Text>

        {/* Mevcut form alanları + KVKK consent + submit button — */}
        {/* handleSubmit'i submitting state ile bağla */}
      </ScrollView>
    </SafeAreaView>
  );
}

═══════════════════════════════════════════════════════════════════════════
ŞABLON KOD — Adım 4.2 (hemen-al.tsx) referans
═══════════════════════════════════════════════════════════════════════════

import { registerBidDeposit, executeBuyNow } from '@/shared';
// ... diğer importlar Adım 4.1 ile aynı

const BUY_NOW_DEPOSIT_RATE = 0.015;  // %1.5 buy_now context için (web ile parite)

export default function IhaleHemenAlScreen() {
  const { id: listingId } = useLocalSearchParams<{ id?: string }>();
  const [confirmed, setConfirmed] = useState(false);
  const [buyNowPrice, setBuyNowPrice] = useState<number>(0);  // ilan verisinden gelir
  const [auctionId, setAuctionId] = useState<string | null>(null);  // ilan verisinden gelir
  const [busy, setBusy] = useState(false);

  const handleKycRedirect = (message: string) => {
    // Adım 4.1 ile aynı
  };

  const handleBuyNow = async () => {
    if (!listingId || !auctionId || buyNowPrice <= 0) return;
    if (!confirmed) {
      Alert.alert('Onay gerekli', 'KVKK + Hemen Al şartlarını onaylamanız gerekiyor.');
      return;
    }

    setBusy(true);
    try {
      // 1) DEPOSIT — register_bid_deposit (buy_now context)
      const depositResult = await registerBidDeposit({
        listingId,
        auctionId,
        context: 'buy_now',
        baseAmountTry: buyNowPrice,
        depositAmountTry: Math.round(buyNowPrice * BUY_NOW_DEPOSIT_RATE),
        preAuthRef: 'mock',
      });

      if (!depositResult.ok) {
        if (depositResult.status === 'kyc_required') {
          handleKycRedirect(depositResult.message);
        } else {
          Alert.alert('Teminat hatası', depositResult.message);
        }
        return;
      }

      // 2) BUY NOW — execute_buy_now
      const buyResult = await executeBuyNow({
        listingId,
        depositId: depositResult.depositId,
        idempotencyKey: undefined,  // facade üretir
      });

      if (buyResult.ok) {
        if (buyResult.status === 'ok') {
          Alert.alert(
            'Hemen Al başarılı',
            `₺${buyResult.amountTry.toLocaleString('tr-TR')} ile ihaleyi kazandınız.\nbuyNowId: ${buyResult.buyNowId}`,
          );
          router.back();
        } else if (buyResult.status === 'duplicate') {
          Alert.alert('Zaten kayıtlı', buyResult.message);
        }
        return;
      }

      // buyResult.ok === false, status'a göre handle
      switch (buyResult.status) {
        case 'kyc_required':
          handleKycRedirect(buyResult.message);
          break;
        case 'auth_required':
          Alert.alert('Giriş gerekli', buyResult.message);
          router.push('/(auth)/login');
          break;
        case 'preconditions_failed':
          Alert.alert('İşlem tamamlanamadı', buyResult.message);
          break;
        case 'rpc_error':
          Alert.alert('Sunucu hatası', buyResult.message);
          break;
        case 'config_missing':
          Alert.alert('Yapılandırma eksik', buyResult.message);
          break;
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Stack.Screen options={{ headerShown: true, title: 'Hemen Al' }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* İlan detayı + buyNowPrice + 5 KVKK/sözleşme onay kutusu + button */}
        {/* handleBuyNow'i busy state ile bağla */}
      </ScrollView>
    </SafeAreaView>
  );
}

═══════════════════════════════════════════════════════════════════════════
ŞABLON KOD — Adım 4.3 (kapali-teklif.tsx) preview banner
═══════════════════════════════════════════════════════════════════════════

Mevcut mock akışa DOKUNMA — sadece üst kısmına ekle:

<View style={styles.previewBanner}>
  <Text style={styles.previewText}>
    ⚠️ Bu özellik henüz ön-izlemededir. Kapalı teklif backend hazır olduğunda etkinleşecek.
    Şu an gönderdiğiniz teklif sadece UI test amaçlı kaydedilir, sunucuya iletilmez.
  </Text>
</View>

// styles ekle:
previewBanner: {
  backgroundColor: '#fff3cd',
  borderColor: '#ffc107',
  borderWidth: 1,
  borderRadius: 8,
  padding: 12,
  margin: 16,
},
previewText: {
  color: '#856404',
  fontSize: 13,
  lineHeight: 18,
},

═══════════════════════════════════════════════════════════════════════════
ŞABLON KOD — Adım 4.4 (borsa.tsx handleSubmit hata handling güncellemesi)
═══════════════════════════════════════════════════════════════════════════

Mevcut handleSubmit (satır 98-142) else dalını revize:

if (result.ok) {
  Alert.alert(
    'Teklif alındı',
    `Son tutar: ${formatTry(result.finalAmount)}${result.proxy ? ' (vekil teklif uygulandı)' : ''}`,
  );
  setBidInput('');
  setProxyInput('');
} else {
  // YENİ: result.code switch
  switch (result.code) {
    case 'kyc_required':
      handleKycRedirect(result.message);  // KYC redirect helper
      break;
    case 'deposit_required':
      Alert.alert(
        'Teminat gerekli',
        result.message + '\n\nBu sürümde borsa terminali deposit akışına bağlı değil. ' +
          'Lütfen ihale detayı ekranından teklif verin.',
      );
      break;
    case 'rate_limited':
      Alert.alert('Çok sık deneme', result.message + '\nLütfen biraz bekleyin.');
      break;
    case 'auction_ended':
      Alert.alert('İhale kapandı', result.message);
      break;
    case 'auth_required':
      Alert.alert('Giriş gerekli', result.message);
      break;
    case 'bid_too_low':
    case 'validation':
    default:
      Alert.alert('Reddedildi', `${result.message}\nMin gerekli: ${formatTry(result.requiredMinimum)}`);
  }
}

═══════════════════════════════════════════════════════════════════════════
DOĞRULAMA (her ekran için)
═══════════════════════════════════════════════════════════════════════════

1. npx tsc --noEmit (mobile/) PASS
2. npm run lint (mobile/) PASS
3. npx expo export --platform web YEŞİL (build bozulmasın)
4. Grep teyit (her dosyada):
   - registerBidDeposit veya executeBuyNow veya submitBid import edilmiş mi
   - Mock setTimeout/setStatus pattern KALMADI (teklif.tsx + hemen-al.tsx için)
   - handleKycRedirect Linking.openURL("https://www.ihaleal.com/kyc") çağırıyor mu
5. Manuel deneme (yapabilirsen Expo Go ile):
   - Login → ihale detayı → teklif ekle → real RPC çağrısı
   - kyc_required mock test user ile gelmeli (4 user kyc=none production'da)
   - KYC redirect web sayfasına açılmalı

═══════════════════════════════════════════════════════════════════════════
COMMITS (lokal, push YOK)
═══════════════════════════════════════════════════════════════════════════

Her ekran için AYRI commit (audit izi temiz):

Commit 1: feat(mobile-ui): teklif.tsx mock → real registerBidDeposit + submitBid flow
Commit 2: feat(mobile-ui): hemen-al.tsx mock → real registerBidDeposit + executeBuyNow flow
Commit 3: chore(mobile-ui): kapali-teklif.tsx add preview-only banner (D-6 protection)
Commit 4: refactor(mobile-ui): borsa.tsx handleSubmit code-based error handling

Veya tek anlamlı commit:
  feat(mobile-ui): wire teklif/hemen-al/borsa to real RPC flows + kapali-teklif preview banner

═══════════════════════════════════════════════════════════════════════════
KURALLAR
═══════════════════════════════════════════════════════════════════════════

- mobile/shared/** DOKUNMA — facade'ler Claude Code'un (Adım 2 tamam)
- src/** DOKUNMA — web ana worktree'nin
- supabase/** DOKUNMA — RPC'ler ana worktree'nin
- @/lib/supabase IMPORT ETME (mobile facade'lar zaten KORUR — sen tüketici)
- KYC redirect TÜM ekranlarda aynı pattern (Linking.openURL https://www.ihaleal.com/kyc)
- Mevcut UI/UX kalite korunsun (FeedbackStateCard pattern, KVKK consent flow)
- Build/tsc/lint her commit öncesi YEŞİL — fail ederse DUR + raporla
- push YOK

═══════════════════════════════════════════════════════════════════════════
SÜRPRİZ DURUMU
═══════════════════════════════════════════════════════════════════════════

Olası sürpriz noktaları:

1. teklif.tsx içinde "currentBid" değerinin kaynağı: ihale veri modelinde
   `currentHighBid` veya benzeri bir alan var mı? Mock veriden mi geliyor?
   Yoksa Supabase auction tablosundan mı çekilmeli? KEŞİF gerek — yoksa DUR.

2. listingId === auctionId varsayımı geçerli mi mobile veri modelinde?
   Mock ihale verisi (mobile/src/app/ihaleler/data.ts veya benzeri) kontrol et.
   Eşit değilse register_bid_deposit p_listing_id alanı için ayrı kaynak gerek.

3. dispatchTransactionNotifications helper (AuctionDetail merge sonrası
   c36f540) mobile-spesifik. teklif/hemen-al gerçek RPC'de side-effect olarak
   çağrılmalı mı? Web buyNow facade case "ok"'ta zaten var (mobile dispatch
   benzer mantık). Eklemeyi düşün ama bu turda opsiyonel.

4. Tüm 4 ekranda KYC redirect aynı handler — DRY için ortak helper:
   mobile/src/app/(auth)/kycRedirect.ts (yeni, küçük) veya inline copy-paste
   her ekrana. Senin kararın.

5. borsa.tsx handleSubmit'te yeni `handleKycRedirect` helper yoksa eklenmeli
   (KYC redirect cooperative). Adım 4 turun parçası.

Sürpriz çıkarsa: dosyayı düzenleme, kaydet & DUR. Ana worktree'ye geri
döndüğümüzde Claude Code'la konuşulup karar verilecek.

═══════════════════════════════════════════════════════════════════════════
RAPORLAMA (iş bittiğinde)
═══════════════════════════════════════════════════════════════════════════

→ Raporla:
  - 4 ekranın güncel durumu (mock → real geçişi tam mı, hangi adım kaldı)
  - Commit hash'leri (her ekran ayrı veya tek anlamlı)
  - tsc/lint/expo build PASS her aşamada
  - Grep teyitleri (registerBidDeposit/executeBuyNow/submitBid import + KYC URL)
  - Mobile branch yeni HEAD
  - Working tree temiz mi
  - Sürpriz noktası var mı (yukarıdaki 5 öğeden hangileri karşılaşıldı)
  - Manuel test denendi mi (Expo Go ile gerçek RPC çağrısı), sonuç ne

NOT: Adım 4 bitince Adım 5 hazırlığı:
  - mobile branch'i origin'e push
  - main worktree'de mobile branch push (CI/Vercel/Supabase v2-deploy 3 workflow tetikler)
  - F1.1 (KYC verify mekanizması — release-blocker AB2) — Claude Code'un ana worktree'sinde ayrı tur

Adım 4 büyük tur — kullanıcı uyanıkken sen yaparsın, raporla, sonra birlikte
Adım 5 push planına bakarız.
```

---

## CLAUDE NOTU (Cursor için değil, kendi referansım)

Bu dosya Cursor'a komut metni hazırlığı — Adım 4 talimatı. Yukarıdaki triple-backtick blok
Cursor penceresine kopyalanacak.

**Bilinmeyen / araştırılacak (Cursor karşılaşacak):**
- `currentBid` kaynağı (mobile auction veri modelinden çekme)
- `listingId === auctionId` varsayımı (mobile mock veri kontrolü)
- `dispatchTransactionNotifications` opsiyonel çağrı
- KYC redirect helper paylaşımı (DRY)
- borsa.tsx KYC redirect helper eklenmesi

Bu noktalarda Cursor karar verirse iyi, takılırsa DUR'durup birlikte çözeriz.

**Sonra (Adım 5 — büyük tur):**
- Mobile branch origin push
- main branch push (3 workflow tetikler — CI yeşil + Faz 4 hazır olmalı)
- F1.1 KYC verify mekanizması (release-blocker)
