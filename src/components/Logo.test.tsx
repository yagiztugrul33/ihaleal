import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Logo } from "@/components/Logo";

describe("Logo", () => {
  it("renders badge, ihaleal wordmark and .com", () => {
    render(<Logo size="md" textClassName="text-white" dotComClassName="text-blue-400" />);
    expect(screen.getByTestId("logo-badge")).toBeInTheDocument();
    expect(screen.getByTestId("logo-wordmark")).toHaveTextContent("ihaleal");
    expect(screen.getByTestId("logo-dot-com")).toHaveTextContent(".com");
    expect(screen.getByLabelText("ihaleal.com")).toBeInTheDocument();
  });

  it("icon variant hides wordmark", () => {
    render(<Logo variant="icon" />);
    expect(screen.getByTestId("logo-badge")).toBeInTheDocument();
    expect(screen.queryByTestId("logo-wordmark")).not.toBeInTheDocument();
  });
});
