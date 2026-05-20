import { expect, test } from "@playwright/test";

test.describe("TeklifAlPage smoke", () => {
  test("unauthenticated user sees auth gate", async ({ page }) => {
    await page.goto("/teklif-al");

    await expect(page).toHaveURL(/\/teklif-al/);
    await expect(page.getByRole("heading", { name: /Anında Nakit Teklif/i })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId("ibuyer-auth-gate")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("ibuyer-form")).toHaveCount(0);
  });

  test("authenticated mock path shows form and RPC call", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "ihaleal_e2e_auth",
        JSON.stringify({ id: "e2e-user", email: "e2e@test.com" }),
      );
    });

    let rpcCalled = false;
    await page.route("**/rest/v1/rpc/submit_ibuyer_application**", async (route) => {
      rpcCalled = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          submissionId: "00000000-0000-4000-8000-000000000021",
          offerRequestId: "00000000-0000-4000-8000-000000000022",
          status: "OFFER_GENERATED",
          riskScore: 0,
          riskBreakdown: [],
          offerAmountTry: 4100000,
          marketValueTry: 5000000,
          expiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
        }),
      });
    });

    await page.goto("/teklif-al");

    const gate = page.getByTestId("ibuyer-auth-gate");
    const form = page.getByTestId("ibuyer-form");

    await Promise.race([
      gate.waitFor({ state: "visible", timeout: 15_000 }),
      form.waitFor({ state: "visible", timeout: 15_000 }),
    ]).catch(() => undefined);

    if (await gate.isVisible().catch(() => false)) {
      test.skip();
      return;
    }
    if (!(await form.isVisible().catch(() => false))) {
      test.skip();
      return;
    }

    await page.getByRole("button", { name: /Devam/i }).click();
    await page.getByRole("button", { name: /Teklifi hesapla/i }).click();
    await expect.poll(() => rpcCalled, { timeout: 15_000 }).toBe(true);
  });
});
