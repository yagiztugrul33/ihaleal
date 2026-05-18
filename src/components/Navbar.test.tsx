import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { ROUTES } from "@/constants/routes";

function renderNavbar(initialPath = "/") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <LocaleProvider>
        <Navbar />
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
