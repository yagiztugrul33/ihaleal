import { expect, test } from "@playwright/test";

test.describe("Profile smoke", () => {
  test("unauthenticated user sees profile auth gate", async ({ page }) => {
    await page.goto("/profil");

    await expect(page).toHaveURL(/\/profil/);
    await expect(page.getByText(/Giriş yapmanız gerekiyor/i)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("button", { name: "Giriş Yap" })).toBeVisible();
  });

  test("local session renders profile details", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "ihaleal_user",
        JSON.stringify({
          id: "local-user-1",
          name: "E2E Kullanici",
          email: "e2e@test.com",
          phone: "05551234567",
          memberSince: "2025",
          auctionsCreated: 2,
          auctionsWon: 1,
          rating: 4.7,
          verified: true,
          authBackend: "local",
        }),
      );
    });

    await page.goto("/profil");

    await expect(page.getByRole("heading", { name: /Profil Bilgileri/i })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByRole("button", { name: /Çıkış Yap/i })).toBeVisible();
  });
});
