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
    const detailAction = page.getByRole("button", { name: /Detaylar|İncele|Incele/i }).first();
    const detailLink = page.getByRole("link", { name: /Detaylar|İncele|Incele/i }).first();
    const emptyState = page.getByText(/ilan bulunamadı|Arama kriterinizle eşleşen ilan bulunamadı/i).first();
    await Promise.race([
      detailAction.waitFor({ state: "visible", timeout: 20_000 }),
      detailLink.waitFor({ state: "visible", timeout: 20_000 }),
      emptyState.waitFor({ state: "visible", timeout: 20_000 }),
    ]).catch(() => undefined);
    if (
      !(await detailAction.isVisible().catch(() => false)) &&
      !(await detailLink.isVisible().catch(() => false))
    ) {
      await expect(emptyState).toBeVisible({ timeout: 20_000 });
    }
  });
});
