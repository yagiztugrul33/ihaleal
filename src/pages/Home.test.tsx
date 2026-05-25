import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "@/pages/Home";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { LOCALE_STORAGE_KEY } from "@/i18n/messages";

describe("Home", () => {
  beforeEach(() => {
    localStorage.setItem(LOCALE_STORAGE_KEY, "tr");
  });

  it("renders premium cinematic homepage with deprem backbone", { timeout: 15000 }, () => {
    render(
      <MemoryRouter>
        <LocaleProvider>
          <Home />
        </LocaleProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId("premium-cinematic-home")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Gayrimenkul/i);
    expect(screen.getAllByRole("heading", { name: /Nasıl Çalışır/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: /Öne Çıkan İhaleler/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Canlı Güven Göstergeleri/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Stratejik Karar Odası/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/CANLI/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText("284").length).toBeGreaterThan(0);
    expect(document.querySelector(".premium-hero__video")).toBeNull();
    expect(document.querySelector(".premium-kicker")).toBeNull();
  });
});
