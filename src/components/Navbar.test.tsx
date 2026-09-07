import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";

// Navbar zamanla useAuth ve useCurrency kullanmaya başladı; test harness'ı yalnızca
// LocaleProvider sarıyordu ve üç senaryo "must be used within ...Provider" ile
// düşüyordu. Kırık olan üretim kodu değil, testin kurduğu bağlamdı.
// Sıra App.tsx ile AYNI tutulur (Locale > Currency > Auth) — provider'lar
// birbirini okuyorsa farklı sıra sessiz farklara yol açar.
function renderNavbar(initialPath = "/") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <LocaleProvider>
        <CurrencyProvider>
          <AuthProvider>
            <Navbar />
          </AuthProvider>
        </CurrencyProvider>
      </LocaleProvider>
    </MemoryRouter>,
  );
}

describe("Navbar", () => {
  // İhale odağı (emlak+arsa): Hizmetler dropdown'ı artık sadece çekirdek
  // özellikleri (Değerleme, Yatırımcı Paneli) listeler. GES gibi talebe-göre
  // özellikler nav'dan çıkarıldı — route hâlâ var, sadece nav'da değil.
  it("Services dropdown lists only core items (valuation, investor panel)", () => {
    renderNavbar();
    fireEvent.click(screen.getByTestId("nav-services-trigger"));
    const valuationLink = screen.getByText(/Değerleme|Valuation/i);
    expect(valuationLink).toBeInTheDocument();
    expect(screen.queryByTestId("nav-services-ges")).not.toBeInTheDocument();
  });

  it("mobile Services section lists only core items", () => {
    renderNavbar();
    fireEvent.click(screen.getByRole("button", { name: /Open menu|Menüyü aç/i }));
    expect(screen.queryByTestId("nav-services-ges-mobile")).not.toBeInTheDocument();
    expect(document.querySelector('[data-testid^="nav-mobile-services-"]')).toBeNull();
  });

  it("switches locale to Turkish", () => {
    renderNavbar();
    fireEvent.click(screen.getByTestId("nav-lang-trigger"));
    fireEvent.click(screen.getByText("Türkçe"));
    expect(document.documentElement.lang).toBe("tr");
    expect(screen.getByText("İhaleler")).toBeInTheDocument();
  });
});
