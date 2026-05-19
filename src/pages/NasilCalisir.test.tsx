import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import NasilCalisir from "@/pages/NasilCalisir";
import NasilCalisirJourneyPage from "@/pages/NasilCalisirJourneyPage";
import NasilCalisirStepPage from "@/pages/NasilCalisirStepPage";
import { LocaleProvider } from "@/contexts/LocaleContext";

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.resolve({ ok: false } as Response)),
  );
});

function wrapHub() {
  return render(
    <MemoryRouter initialEntries={["/how-it-works"]}>
      <LocaleProvider>
        <Routes>
          <Route path="/how-it-works" element={<NasilCalisir />} />
        </Routes>
      </LocaleProvider>
    </MemoryRouter>,
  );
}

function wrapJourney(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <LocaleProvider>
        <Routes>
          <Route path="/how-it-works/yol/:slug" element={<NasilCalisirJourneyPage />} />
        </Routes>
      </LocaleProvider>
    </MemoryRouter>,
  );
}

function wrapStep(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <LocaleProvider>
        <Routes>
          <Route path="/how-it-works/adim/:slug" element={<NasilCalisirStepPage />} />
        </Routes>
      </LocaleProvider>
    </MemoryRouter>,
  );
}

describe("NasilCalisir hub", () => {
  it("shows four step detail links and journey section", () => {
    wrapHub();
    expect(screen.getByRole("heading", { name: /Nasıl çalışır/i })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Detaylı rehber/i })).toHaveLength(4);
    expect(screen.getByRole("link", { name: /Tam yolculuk rehberi/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Platform tanıtımı/i })).toBeInTheDocument();
  });
});

describe("NasilCalisir journey detail", () => {
  it("renders alici journey with four steps", () => {
    wrapJourney("/how-it-works/yol/alici");
    expect(screen.getByRole("heading", { name: /Alıcı ve yatırımcı/i })).toBeInTheDocument();
    expect(screen.getByText(/Keşif ve filtreleme/i)).toBeInTheDocument();
    expect(screen.getByText(/Kapanış ve tapu hazırlığı/i)).toBeInTheDocument();
  });
});

describe("NasilCalisir step detail", () => {
  it("renders kesfet step with related links", () => {
    wrapStep("/how-it-works/adim/kesfet");
    expect(screen.getByRole("heading", { name: /^Keşfet$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /İhale listesi/i })).toHaveAttribute("href", "/ihaleler");
  });
});
