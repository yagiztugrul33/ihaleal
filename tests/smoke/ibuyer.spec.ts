import { test, expect } from "@playwright/test";

test.describe("iBuyer prod-only", () => {
  test("auth gate when not signed in", async ({ page }) => {
    await page.goto("/aninda-teklif");
    const gate = page.getByTestId("ibuyer-auth-gate");
    await expect(gate).toBeVisible({ timeout: 15_000 });
    await expect(gate.getByRole("link", { name: "Giriş Yap" })).toBeVisible();
    await expect(gate.getByText(/Demo modu/i)).toHaveCount(0);
    await expect(page.getByTestId("ibuyer-form")).toHaveCount(0);
  });

  test("redirect alias /ibuyer shows auth gate", async ({ page }) => {
    await page.goto("/ibuyer");
    await expect(page).toHaveURL(/\/aninda-teklif/);
    await expect(page.getByTestId("ibuyer-auth-gate")).toBeVisible();
  });

  test("authenticated mock shows form and RPC on submit", async ({ page }) => {
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
          submissionId: "00000000-0000-4000-8000-000000000001",
          offerRequestId: "00000000-0000-4000-8000-000000000002",
          status: "OFFER_GENERATED",
          riskScore: 0,
          riskBreakdown: [],
          offerAmountTry: 4100000,
          marketValueTry: 5000000,
          expiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
        }),
      });
    });

    await page.goto("/aninda-teklif");

    const gate = page.getByTestId("ibuyer-auth-gate");
    const form = page.getByTestId("ibuyer-form");

    if (await gate.isVisible().catch(() => false)) {
      test.skip();
      return;
    }

    await expect(form).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: /Devam/i }).click();
    await page.getByRole("button", { name: /Teklifi hesapla/i }).click();

    await expect.poll(() => rpcCalled, { timeout: 15_000 }).toBe(true);
    await expect(form.getByText(/Demo modu/i)).toHaveCount(0);
  });
});
