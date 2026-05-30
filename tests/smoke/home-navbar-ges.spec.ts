import { test, expect } from "@playwright/test";
import { LOCALE_STORAGE_KEY } from "../../src/i18n/messages";

async function setLocale(page: import("@playwright/test").Page, locale: "en" | "tr") {
  await page.addInitScript(
    ({ key, value }) => {
      localStorage.setItem(key, value);
    },
    { key: LOCALE_STORAGE_KEY, value: locale },
  );
}

test.describe("home + navbar GES regression", () => {
  test("homepage shows cinematic hero and live auctions", async ({ page }) => {
    await setLocale(page, "en");
    await page.goto("/?fresh=1");
    await expect(page.getByTestId("terminal-hero")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("premium-cinematic-home")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/What are you looking for/i, {
      timeout: 15_000,
    });
    await expect(page.getByTestId("cinematic-stats")).toBeVisible();
    await expect(page.getByRole("heading", { name: /En Aktif İhaleler/i })).toBeVisible();
    await expect(page.getByText(/Levent|KADIKÖY/i).first()).toBeVisible();
  });

  test("navbar GES via Services dropdown — desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await page.getByTestId("nav-services-trigger").click();
    const ges = page.getByTestId("nav-services-ges");
    await expect(ges).toBeVisible({ timeout: 15_000 });
    await expect(ges).toHaveText(/GES Land|GES Arazi/i);
    await ges.click();
    await expect(page).toHaveURL(/\/arastirma\/ges/, { timeout: 15_000 });
  });

  test("navbar GES via Services — mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: /Open menu|Menüyü aç/i }).click();
    await page.getByTestId("nav-mobile-services-yatırımcı").click();
    const ges = page.getByTestId("nav-services-ges-mobile");
    await expect(ges).toBeVisible({ timeout: 15_000 });
    await ges.click();
    await expect(page).toHaveURL(/\/arastirma\/ges/, { timeout: 15_000 });
  });

  test("homepage hero English by default", async ({ page }) => {
    await setLocale(page, "en");
    await page.goto("/");
    await expect(page.getByTestId("terminal-hero")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/What are you looking for/i, {
      timeout: 15_000,
    });
    await expect(page.getByText(/FOR RENT|FOR SALE/i).first()).toBeVisible();
  });

  test("homepage switches to Turkish", async ({ page }) => {
    await setLocale(page, "tr");
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Ne arıyorsunuz/i, {
      timeout: 15_000,
    });
    await expect(page.getByText(/Kadıköy|Levent/i).first()).toBeVisible();
    await expect(page.getByText(/KVKK/i).first()).toBeVisible();
  });
});
