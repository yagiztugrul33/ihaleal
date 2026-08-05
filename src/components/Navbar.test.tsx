import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { ROUTES } from "@/constants/routes";

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
  it("GES Land link in Services dropdown points to /arastirma/ges", () => {
    renderNavbar();
    fireEvent.click(screen.getByTestId("nav-services-trigger"));
    const gesLink = screen.getByTestId("nav-services-ges");
    expect(gesLink).toHaveAttribute("href", ROUTES.ARASTIRMA_GES);
    expect(gesLink.textContent).toMatch(/GES Land|GES Arazi/i);
  });

  it("GES link in mobile Services section", () => {
    renderNavbar();
    fireEvent.click(screen.getByRole("button", { name: /Open menu|Menüyü aç/i }));
    // Bölüm başlığının testid'i dile göre değişiyor (nav-mobile-services-${title}):
    // TR'de "yatırımcı", EN'de "investor". Test edilen şey GES linkinin hedefi,
    // arayüz dili değil — bu yüzden ilk bölüm önekle bulunur.
    const yatirimciBolumu = document.querySelector('[data-testid^="nav-mobile-services-"]');
    expect(yatirimciBolumu).not.toBeNull();
    fireEvent.click(yatirimciBolumu as Element);
    const gesLink = screen.getByTestId("nav-services-ges-mobile");
    expect(gesLink).toHaveAttribute("href", ROUTES.ARASTIRMA_GES);
  });

  it("switches locale to Turkish", () => {
    renderNavbar();
    fireEvent.click(screen.getByTestId("nav-lang-trigger"));
    fireEvent.click(screen.getByText("Türkçe"));
    expect(document.documentElement.lang).toBe("tr");
    expect(screen.getByText("İhaleler")).toBeInTheDocument();
  });
});
