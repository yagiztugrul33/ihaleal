import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { SubmissionForm } from "@/components/ibuyer/SubmissionForm";

vi.mock("@/lib/ibuyer", async () => {
  const actual = await vi.importActual<typeof import("@/lib/ibuyer")>("@/lib/ibuyer");
  return {
    ...actual,
    submitInstantOffer: vi.fn(),
  };
});

import { submitInstantOffer } from "@/lib/ibuyer";

describe("SubmissionForm", () => {
  it("does not render demo mode copy", () => {
    render(<SubmissionForm />);
    expect(screen.queryByText(/Demo modu/i)).not.toBeInTheDocument();
  });

  it("shows retry button on submit error", async () => {
    vi.mocked(submitInstantOffer)
      .mockRejectedValueOnce(new Error("Sunucu hatası"))
      .mockResolvedValueOnce({
        status: "LEGAL_REVIEW",
        riskScore: 0,
        breakdown: [],
        offerAmountTry: null,
        marketValueTry: 5_000_000,
        expiresAt: null,
      });

    render(<SubmissionForm />);
    fireEvent.click(screen.getByRole("button", { name: /Devam/i }));
    fireEvent.click(screen.getByRole("button", { name: /Teklifi hesapla/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Sunucu hatası");
    expect(screen.getByRole("button", { name: /Tekrar dene/i })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: /Tekrar dene/i }));
    await waitFor(() => expect(submitInstantOffer).toHaveBeenCalledTimes(2));
  });

  it("disables submit while loading", async () => {
    let resolveSubmit!: (value: unknown) => void;
    vi.mocked(submitInstantOffer).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSubmit = resolve;
        }),
    );

    render(<SubmissionForm />);
    fireEvent.click(screen.getByRole("button", { name: /Devam/i }));
    const submitBtn = screen.getByRole("button", { name: /Teklifi hesapla/i });
    fireEvent.click(submitBtn);

    await waitFor(() => expect(submitBtn).toBeDisabled());

    resolveSubmit({
      status: "OFFER_GENERATED",
      riskScore: 0,
      breakdown: [],
      offerAmountTry: 1,
      marketValueTry: 5_000_000,
      expiresAt: null,
    });

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Yeni başvuru/i })).toBeVisible(),
    );
  });
});
