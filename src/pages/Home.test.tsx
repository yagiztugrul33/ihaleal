import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Home } from "@/pages/Home";
import { LocaleProvider } from "@/contexts/LocaleContext";

describe("Home", () => {
  it("renders premium cinematic homepage sections", () => {
    render(
      <MemoryRouter>
        <LocaleProvider>
          <Home />
        </LocaleProvider>
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Türkiye.*Gayrimenkul Borsası/i);
    expect(screen.getByRole("heading", { name: /Canlı Kategori Pazarı/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Borsa nasıl çalışır/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Canlı Güven Göstergeleri/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Investor Panel/i })).toBeInTheDocument();
  });
});
