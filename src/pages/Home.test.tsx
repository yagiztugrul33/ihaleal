import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Home } from "@/pages/Home";
import { LocaleProvider } from "@/contexts/LocaleContext";

describe("Home", () => {
  it("renders simplified module-card homepage", () => {
    render(
      <MemoryRouter>
        <LocaleProvider>
          <Home />
        </LocaleProvider>
      </MemoryRouter>,
    );
    // Cinematic hero korunur
    expect(screen.getByTestId("terminal-hero")).toBeInTheDocument();
    // 4-6 modül kartı (Ö2 sadeleştirme hedefi)
    const cards = screen.getAllByTestId("home-module-card");
    expect(cards.length).toBeGreaterThanOrEqual(4);
    expect(cards.length).toBeLessThanOrEqual(6);
    expect(screen.getByRole("link", { name: /İhale Arama/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Gayrimenkul Borsası/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Risk Merkezi/i })).toBeInTheDocument();
    // Yoğun dashboard blokları ana sayfadan kalktı
    expect(screen.queryByText(/Canlı Kategori Pazarı/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Borsa nasıl çalışır/i)).not.toBeInTheDocument();
  });
});
