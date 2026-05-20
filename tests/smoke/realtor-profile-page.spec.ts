import { expect, test } from "@playwright/test";

test.describe("RealtorProfile smoke", () => {
  test("renders realtor profile and primary interaction button", async ({ page }) => {
    await page.goto("/emlakci/panorama-gayrimenkul");

    await expect(page).toHaveURL(/\/emlakci\/panorama-gayrimenkul/);
    await expect(page.getByRole("heading", { name: /Panorama Gayrimenkul A\.Ş\./i })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByRole("button", { name: /Mesaj gönder/i })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByRole("heading", { name: /Satış geçmişi \(demo\)/i })).toBeVisible({
      timeout: 20_000,
    });
  });
});
