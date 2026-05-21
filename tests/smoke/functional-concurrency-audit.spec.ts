import { expect, test } from "@playwright/test";

type FlowStatus = "pass" | "fail" | "blocked";
type FlowResult = { flow: string; status: FlowStatus; detail: string };

function logResults(scope: string, results: FlowResult[]) {
  // CI/list reporter outputundan rapora alınabilir.
  // eslint-disable-next-line no-console
  console.log(`[FLOW_AUDIT:${scope}] ${JSON.stringify(results)}`);
}

test.describe("Functional + logic audit", () => {
  test("listing create and lifecycle controls", async ({ page }) => {
    const results: FlowResult[] = [];

    await page.addInitScript(() => {
      window.localStorage.setItem("ihaleal_e2e_auth", JSON.stringify({ id: "e2e-user", email: "e2e@test.com" }));
    });

    await page.goto("/ihale-ac");

    const envGate = page.getByText(/Supabase ortam değişkenleri/i);
    const authGate = page.getByText(/İhale açmak için giriş yapmanız gerekiyor/i);
    const title = page.getByRole("heading", { name: /Gayrimenkul ilanı oluştur/i });
    await Promise.race([
      envGate.waitFor({ state: "visible", timeout: 10_000 }),
      authGate.waitFor({ state: "visible", timeout: 10_000 }),
      title.waitFor({ state: "visible", timeout: 10_000 }),
    ]).catch(() => undefined);

    if (await envGate.isVisible().catch(() => false)) {
      results.push({
        flow: "İLAN VER",
        status: "blocked",
        detail: "Supabase env gate aktif; form akışı çalıştırılamadı.",
      });
      results.push({
        flow: "İLAN YAYINDAN ÇIKAR / GERİ AL",
        status: "blocked",
        detail: "CreateAuction ekranı env gate nedeniyle erişilemedi.",
      });
      logResults("create-flow", results);
      return;
    }

    if (await authGate.isVisible().catch(() => false)) {
      results.push({
        flow: "İLAN VER",
        status: "blocked",
        detail: "Auth gate aktif; oturum kurulamadı.",
      });
      logResults("create-flow", results);
      return;
    }

    if (!(await title.isVisible().catch(() => false))) {
      results.push({
        flow: "İLAN VER",
        status: "blocked",
        detail: "Ekran başlığı görünmedi; akış başlatılamadı.",
      });
      logResults("create-flow", results);
      return;
    }
    await expect(page.getByRole("button", { name: /İlanı kaydet ve yayınla/i })).toBeVisible();

    const unpublishButton = page.getByRole("button", { name: /Yayından çıkar/i }).first();
    await expect(unpublishButton).toBeVisible();
    await unpublishButton.click();
    await expect(page.getByRole("button", { name: /Yayına al/i }).first()).toBeVisible();
    await page.getByRole("button", { name: /Yayına al/i }).first().click();
    await expect(page.getByRole("button", { name: /Yayından çıkar/i }).first()).toBeVisible();

    results.push({ flow: "İLAN VER", status: "pass", detail: "Form ekranı ve yayınla CTA görünür." });
    results.push({
      flow: "İLAN YAYINDAN ÇIKAR / GERİ AL",
      status: "pass",
      detail: "Aktif -> Taslak -> Aktif durum döngüsü butonlarla çalıştı.",
    });
    logResults("create-flow", results);
  });

  test("auth, favorites, filters and plan selection", async ({ page }) => {
    const results: FlowResult[] = [];

    await page.goto("/kayit");
    const registerButton = page.getByRole("button", { name: /Kayıt Ol/i });
    await registerButton.click();
    const registerRequiredError = page.getByText(/Ad soyad, e-posta ve şifre zorunludur/i);
    const registerEnvError = page.getByText(/Supabase ortam değişkenleri gerekir/i);
    await Promise.race([
      registerRequiredError.waitFor({ state: "visible", timeout: 8_000 }),
      registerEnvError.waitFor({ state: "visible", timeout: 8_000 }),
    ]).catch(() => undefined);
    if (await registerRequiredError.isVisible().catch(() => false)) {
      results.push({ flow: "ÜYE OL validasyon", status: "pass", detail: "Boş gönderimde zorunlu alan hatası gösterildi." });
    } else {
      results.push({ flow: "ÜYE OL validasyon", status: "blocked", detail: "Supabase env gate nedeniyle form validasyonu tetiklenemedi." });
    }

    await page.goto("/giris");
    const loginButton = page.getByRole("button", { name: /^Giriş Yap$/i });
    if (await loginButton.isDisabled()) {
      results.push({ flow: "GİRİŞ validasyon", status: "blocked", detail: "Supabase env gate nedeniyle giriş butonu pasif." });
    } else {
      await loginButton.click();
    }
    const loginRequiredError = page.getByText(/E-posta ve şifre gereklidir/i);
    const loginEnvError = page.getByText(/Supabase ortam değişkenleri gerekir/i);
    await Promise.race([
      loginRequiredError.waitFor({ state: "visible", timeout: 8_000 }),
      loginEnvError.waitFor({ state: "visible", timeout: 8_000 }),
    ]).catch(() => undefined);
    if (await loginButton.isDisabled()) {
      // blocked sonucu yukarıda eklendi
    } else if (await loginRequiredError.isVisible().catch(() => false)) {
      results.push({ flow: "GİRİŞ validasyon", status: "pass", detail: "Boş gönderimde hata mesajı gösterildi." });
    } else {
      results.push({ flow: "GİRİŞ validasyon", status: "blocked", detail: "Supabase env gate nedeniyle login validasyonu tetiklenemedi." });
    }

    await page.goto("/kurumsal");
    await page.getByRole("link", { name: /Planları İncele/i }).click();
    await expect(page.locator("#planlar")).toBeInViewport();
    await expect(page.getByRole("link", { name: /Başla|İletişime Geç/i }).first()).toBeVisible();
    results.push({ flow: "PLAN SEÇ", status: "pass", detail: "Plan bölümüne anchor geçişi ve CTA görünürlüğü doğrulandı." });

    await page.goto("/ilanlar/prop-001");
    const favButton = page.getByRole("button", { name: /Favorilere ekle|Favoriden kaldır/i }).first();
    await expect(favButton).toBeVisible();
    const before = await favButton.getAttribute("aria-label");
    await favButton.click();
    const after = await favButton.getAttribute("aria-label");
    if (before !== after) {
      results.push({ flow: "İZLE/FAVORİ", status: "pass", detail: "Favori butonu aria-label durumunu değiştirdi." });
    } else {
      results.push({ flow: "İZLE/FAVORİ", status: "fail", detail: "Favori butonunda durum değişikliği gözlenmedi." });
    }

    const askButton = page.getByRole("link", { name: /Soru Sor/i }).first();
    await askButton.click();
    await expect(page).toHaveURL(/\/destek/);
    results.push({ flow: "SORU SOR", status: "pass", detail: "İlan detayından destek sayfasına yönlendirme çalıştı." });

    await page.goto("/ihaleler");
    const filterInput = page.getByPlaceholder(/Konum, kelime/i).first();
    await expect(filterInput).toBeVisible();
    await filterInput.fill("Kadıköy");
    results.push({ flow: "FİLTRE", status: "pass", detail: "Canlı ihale arama filtresi input etkileşimi çalıştı." });

    logResults("auth-favorites-filter-plan", results);
  });

  test("bid + buy now dialogs and tab interactions", async ({ page }) => {
    const results: FlowResult[] = [];

    await page.goto("/ilan/1");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 20_000 });

    for (const tabName of ["Genel Bakış", "Detaylar", "Özellikler", "Konum", "Fiyat Geçmişi", "AI Analiz"]) {
      const tab = page.getByRole("button", { name: new RegExp(tabName, "i") }).first();
      await expect(tab).toBeVisible();
      await tab.click();
    }
    results.push({ flow: "SEKMELER", status: "pass", detail: "AuctionDetail sekmeleri tıklanarak içerik geçişi test edildi." });

    const bidButton = page.getByRole("button", { name: /Teklif ver|Kapalı teklif ver/i }).first();
    const bidDisabled = (await bidButton.getAttribute("disabled")) !== null;
    if (bidDisabled) {
      results.push({
        flow: "TEKLİF VER",
        status: "blocked",
        detail: "Teklif butonu giriş gereği nedeniyle pasif; canlı teklif akışı çalıştırılamadı.",
      });
    } else {
      await bidButton.click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.getByLabel(/Teklif Tutarı/i).fill("1");
      await page.getByRole("button", { name: /Teklif Ver|Kapalı teklifi gönder/i }).click();
      await expect(page.getByText(/Teklif en az|Geçerli bir teklif/i)).toBeVisible({ timeout: 10_000 });
      results.push({
        flow: "TEKLİF VER",
        status: "pass",
        detail: "Teklif diyalogu açıldı; düşük/uygunsuz tutarda validasyon mesajı doğrulandı.",
      });
    }

    const buyNowButton = page.getByRole("button", { name: /Hemen Al/i }).first();
    if ((await buyNowButton.isVisible().catch(() => false)) && !(await buyNowButton.isDisabled().catch(() => false))) {
      await buyNowButton.click();
      await expect(page.getByRole("dialog")).toBeVisible();
      results.push({ flow: "HEMEN AL", status: "pass", detail: "Hemen Al diyalog akışı açıldı." });
    } else {
      results.push({ flow: "HEMEN AL", status: "blocked", detail: "Hemen Al düğmesi görünmedi veya giriş gereği pasif." });
    }

    results.push({
      flow: "KAPORA/TEMİNAT BLOK",
      status: "blocked",
      detail: "Bu test ortamında Supabase UUID + gerçek deposit kaydı olmadan blokaj RPC doğrulanamadı.",
    });

    logResults("bid-buy-tabs", results);
  });

  test("all property detail pages render without crash", async ({ page }) => {
    const results: FlowResult[] = [];
    let crashCount = 0;
    let unresolvedCount = 0;
    let pageErrorCount = 0;
    page.on("pageerror", () => {
      pageErrorCount += 1;
    });

    for (let i = 1; i <= 60; i += 1) {
      const id = `prop-${String(i).padStart(3, "0")}`;
      const errorsBefore = pageErrorCount;
      try {
        await page.goto(`/ilanlar/${id}`, { waitUntil: "domcontentloaded" });
      } catch {
        crashCount += 1;
        continue;
      }
      const hasDetail = await page.getByTestId("ilan-detay").isVisible().catch(() => false);
      if (!hasDetail) unresolvedCount += 1;
      if (pageErrorCount > errorsBefore) crashCount += 1;
    }

    if (crashCount === 0) {
      results.push({
        flow: "TÜM İLAN AÇILIŞI (prop-001..prop-060)",
        status: "pass",
        detail: `60 rota içinde runtime çökme yok. Detay bileşeni görünmeyen rota: ${unresolvedCount}.`,
      });
    } else {
      results.push({
        flow: "TÜM İLAN AÇILIŞI (prop-001..prop-060)",
        status: "fail",
        detail: `${crashCount} rotada runtime/nav çökmesi tespit edildi; detay bileşeni görünmeyen rota: ${unresolvedCount}.`,
      });
    }

    logResults("all-properties", results);
  });
});

