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
    expect(screen.getByRole("heading", { name: /Sistem Nas/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Canlı Müzayedeler/i })).toBeInTheDocument();
    expect(screen.getByText(/Bodrum, Muğla/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /ihaleal Kurumsal/i })).toBeInTheDocument();
  });
});
