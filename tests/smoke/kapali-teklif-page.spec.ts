import { expect, test } from "@playwright/test";

test.describe("KapaliTeklifPage smoke", () => {
  test("renders sealed-offer marketing content and cards", async ({ page }) => {
    await page.goto("/kapali-teklif");

    await expect(page).toHaveURL(/\/kapali-teklif/);
    await expect(page.getByRole("heading", { name: /Şeffaf kapalı ihale süreci/i })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByRole("heading", { name: /Demo ihale kartları/i })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByText(/Teklif A/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /İhalelere git/i })).toBeVisible();
  });
});
