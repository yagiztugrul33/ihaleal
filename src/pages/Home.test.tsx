import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Home } from "@/pages/Home";

describe("Home", () => {
  it("PlatformModulesShowcase render edilir (GES, Degerleme, Arastirma)", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: /GES & Arazi Analizi/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^AI Değerleme$/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Araştırma Intelligence/i })).toBeInTheDocument();
    expect(screen.getByText(/3 intelligence modülü/i)).toBeInTheDocument();
  });
});