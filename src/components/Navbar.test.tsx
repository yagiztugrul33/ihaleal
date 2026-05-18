import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { ROUTES } from "@/constants/routes";

function renderNavbar(initialPath = "/") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Navbar />
    </MemoryRouter>,
  );
}

describe("Navbar", () => {
  it("GES Arazi linki masaustu menude gorunur ve /arastirma/ges'e gider", () => {
    renderNavbar();
    const desktopNav = document.querySelector(".nav-desktop-links");
    expect(desktopNav).toBeTruthy();
    const gesLink = desktopNav!.querySelector(`a[href="${ROUTES.ARASTIRMA_GES}"]`);
    expect(gesLink).toBeTruthy();
    expect(gesLink?.textContent).toMatch(/GES Arazi/i);
  });

  it("GES Arazi linki mobil menude gorunur ve /arastirma/ges'e gider", () => {
    renderNavbar();
    fireEvent.click(screen.getByRole("button", { name: "Menüyü aç" }));
    const mobileLinks = screen.getAllByRole("link", { name: "GES Arazi" });
    expect(mobileLinks.length).toBeGreaterThanOrEqual(1);
    mobileLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", ROUTES.ARASTIRMA_GES);
    });
  });
});