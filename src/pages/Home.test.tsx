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
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Real Estate Auctions/i);
    expect(screen.getByRole("heading", { name: /How It Works\?/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Live Auctions/i })).toBeInTheDocument();
    expect(screen.getByText(/Dubai, UAE/i)).toBeInTheDocument();
    expect(screen.getByText(/Why Investors Trust iHaleal/i)).toBeInTheDocument();
  });
});
