import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Logo } from "@/components/Logo";

describe("Logo", () => {
  it("renders png logo image", () => {
    render(<Logo size="md" />);
    const logoImage = screen.getByTestId("logo-image");
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute("src", "/ihaleal-logo.png");
    expect(screen.getByAltText("ihaleal")).toBeInTheDocument();
  });

  it("icon variant still renders logo image", () => {
    render(<Logo variant="icon" />);
    expect(screen.getByTestId("logo-image")).toBeInTheDocument();
  });
});
