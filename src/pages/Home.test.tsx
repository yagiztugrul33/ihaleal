import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "@/pages/Home";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { LOCALE_STORAGE_KEY } from "@/i18n/messages";
import { getFeaturedAuctions } from "@/lib/demo-data";

describe("Home", () => {
  beforeEach(() => {
    localStorage.setItem(LOCALE_STORAGE_KEY, "tr");
  });

  it("renders premium cinematic homepage sections", () => {
    render(
      <MemoryRouter>
        <LocaleProvider>
          <Home />
        </LocaleProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId("premium-cinematic-home")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /Gayrimenkul/i,
    );
    expect(screen.getByRole("heading", { name: /Nasıl Çalışır/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Öne Çıkan Canlı Müzayedeler/i })).toBeInTheDocument();
    expect(getFeaturedAuctions(1).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/LIVE/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: /Kurumsal Altyapısı/i })).toBeInTheDocument();
  });
});
