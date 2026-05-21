import { expect, test } from "@playwright/test";

test.describe("AuctionListPage smoke", () => {
  test("renders /auctions list with primary listing actions", async ({ page }) => {
    await page.goto("/auctions");

    await expect(page).toHaveURL(/\/auctions/);
    await expect(page.getByRole("heading", { name: /Canlı İhaleler/i })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.locator("#auctions")).toBeVisible({ timeout: 20_000 });
    const detailAction = page.getByRole("button", { name: /Detaylar|İncele|Incele/i }).first();
    const detailLink = page.getByRole("link", { name: /Detaylar|İncele|Incele/i }).first();
    const bidAction = page.getByRole("button", { name: /Teklif Ver/i }).first();
    const emptyState = page.getByText(/ilan bulunamadı|Arama kriterinizle eşleşen ilan bulunamadı/i).first();

    await Promise.race([
      detailAction.waitFor({ state: "visible", timeout: 20_000 }),
      detailLink.waitFor({ state: "visible", timeout: 20_000 }),
      bidAction.waitFor({ state: "visible", timeout: 20_000 }),
      emptyState.waitFor({ state: "visible", timeout: 20_000 }),
    ]).catch(() => undefined);

    const hasPrimaryAction =
      (await detailAction.isVisible().catch(() => false)) ||
      (await detailLink.isVisible().catch(() => false)) ||
      (await bidAction.isVisible().catch(() => false));
    if (!hasPrimaryAction) {
      await expect(emptyState).toBeVisible({ timeout: 20_000 });
    }
  });
});
