import { expect, test } from "@playwright/test";

test.describe("AuctionListPage smoke", () => {
  test("renders /auctions list with primary listing actions", async ({ page }) => {
    await page.goto("/auctions");

    await expect(page).toHaveURL(/\/auctions/);
    await expect(page.getByRole("heading", { name: /Canlı İhaleler/i })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.locator("#auctions")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("button", { name: /Detaylar/i }).first()).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByRole("button", { name: /Teklif Ver/i }).first()).toBeVisible({
      timeout: 20_000,
    });
  });
});
