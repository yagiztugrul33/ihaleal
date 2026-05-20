import { expect, test } from "@playwright/test";

test.describe("LiveAuctions smoke", () => {
  test("renders /ihaleler hero and auction list section", async ({ page }) => {
    await page.goto("/ihaleler");

    await expect(page).toHaveURL(/\/ihaleler/);
    await expect(page.getByRole("heading", { name: /Gerçek piyasa,\s*gerçek fiyat/i })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByRole("link", { name: /Canlı İhaleleri Gör/i })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.locator("#auctions")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("button", { name: /Detaylar/i }).first()).toBeVisible({
      timeout: 20_000,
    });
  });
});
