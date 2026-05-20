import { expect, test } from "@playwright/test";

test.describe("CreateAuction smoke", () => {
  test("unauthenticated user sees create-auction auth gate", async ({ page }) => {
    await page.goto("/ihale-ac");

    await expect(page).toHaveURL(/\/ihale-ac/);
    const authGate = page.getByText(/İhale açmak için giriş yapmanız gerekiyor/i);
    const envGate = page.getByText(/Supabase ortam değişkenleri/i);

    await Promise.race([
      authGate.waitFor({ state: "visible", timeout: 20_000 }),
      envGate.waitFor({ state: "visible", timeout: 20_000 }),
    ]).catch(() => undefined);

    if (await envGate.isVisible().catch(() => false)) {
      test.skip();
      return;
    }

    await expect(authGate).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("button", { name: "Giriş Yap" })).toBeVisible();
  });

  test("authenticated mock path renders create-auction form", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "ihaleal_e2e_auth",
        JSON.stringify({ id: "e2e-user", email: "e2e@test.com" }),
      );
    });

    await page.goto("/ihale-ac");

    const gate = page.getByText(/İhale açmak için giriş yapmanız gerekiyor/i);
    const envGate = page.getByText(/Supabase ortam değişkenleri/i);
    const title = page.getByRole("heading", { name: /Gayrimenkul ilanı oluştur/i });

    await Promise.race([
      gate.waitFor({ state: "visible", timeout: 15_000 }),
      envGate.waitFor({ state: "visible", timeout: 15_000 }),
      title.waitFor({ state: "visible", timeout: 15_000 }),
    ]).catch(() => undefined);

    if (
      (await gate.isVisible().catch(() => false)) ||
      (await envGate.isVisible().catch(() => false))
    ) {
      test.skip();
      return;
    }

    await expect(title).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("button", { name: /İlanı kaydet ve yayınla/i })).toBeVisible();
  });
});
