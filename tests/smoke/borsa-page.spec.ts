import { expect, test } from "@playwright/test";

test.describe("Borsa page smoke", () => {
  test("renders /borsa market terminal and running ticker", async ({ page }) => {
    await page.goto("/borsa");
    await expect(page.getByText("GAYRİMENKUL BORSASI")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("button", { name: "Piyasa" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Portföy" })).toBeDisabled();

    const playState = await page.evaluate(() => {
      const track = document.querySelector("[data-testid='borsa-ticker-track']");
      if (!track) return "missing";
      return getComputedStyle(track).animationPlayState;
    });
    expect(playState).toBe("running");
  });

  test("live updates and row flash appear", async ({ page }) => {
    await page.addInitScript(() => {
      Math.random = () => 0.9;
    });
    await page.goto("/borsa");

    const firstRowPrice = page.locator("tbody tr").first().locator("td").nth(2);
    const before = await firstRowPrice.textContent();

    await page.waitForTimeout(3200);
    const after = await firstRowPrice.textContent();
    expect(after).not.toEqual(before);

    await expect
      .poll(
        async () =>
          page
            .locator("tbody tr.borsa-flash-up, tbody tr.borsa-flash-down")
            .count()
            .then((c) => c > 0),
        { timeout: 6000 },
      )
      .toBeTruthy();
  });
});
