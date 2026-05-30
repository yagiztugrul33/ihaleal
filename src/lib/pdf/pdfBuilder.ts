/** Ortak jsPDF şablonu — logo, başlık, tarih, sayfa numarası. */

export type PdfSection = { heading: string; lines: string[] };

export type StructuredPdfInput = {
  title: string;
  subtitle?: string;
  sections: PdfSection[];
  filename: string;
  disclaimer?: string;
};

async function loadJsPdf() {
  const { jsPDF } = await import("jspdf");
  return jsPDF;
}

export async function downloadStructuredPdf(input: StructuredPdfInput): Promise<void> {
  const jsPDF = await loadJsPdf();
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const margin = 18;
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const maxW = pageW - margin * 2;
  let y = margin;

  const addHeader = () => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.setTextColor(15, 118, 110);
    pdf.text("İhaleal", margin, y);
    pdf.setFontSize(9);
    pdf.setTextColor(100, 116, 139);
    pdf.text(new Date().toLocaleDateString("tr-TR"), pageW - margin, y, { align: "right" });
    y += 8;
    pdf.setDrawColor(203, 213, 225);
    pdf.line(margin, y, pageW - margin, y);
    y += 10;
  };

  const ensureSpace = (need: number) => {
    if (y + need > pageH - margin) {
      pdf.addPage();
      y = margin;
      addHeader();
    }
  };

  addHeader();

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(15, 23, 42);
  const titleLines = pdf.splitTextToSize(input.title, maxW);
  ensureSpace(titleLines.length * 7 + 4);
  pdf.text(titleLines, margin, y);
  y += titleLines.length * 7 + 2;

  if (input.subtitle) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(71, 85, 105);
    const subLines = pdf.splitTextToSize(input.subtitle, maxW);
    ensureSpace(subLines.length * 5 + 4);
    pdf.text(subLines, margin, y);
    y += subLines.length * 5 + 6;
  }

  for (const section of input.sections) {
    ensureSpace(12);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(30, 41, 59);
    pdf.text(section.heading, margin, y);
    y += 6;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(51, 65, 85);
    for (const line of section.lines) {
      const wrapped = pdf.splitTextToSize(line, maxW);
      ensureSpace(wrapped.length * 5 + 2);
      pdf.text(wrapped, margin, y);
      y += wrapped.length * 5 + 2;
    }
    y += 4;
  }

  if (input.disclaimer) {
    ensureSpace(20);
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    const disc = pdf.splitTextToSize(input.disclaimer, maxW);
    pdf.text(disc, margin, y);
  }

  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text(`Sayfa ${i} / ${totalPages}`, pageW / 2, pageH - 10, { align: "center" });
  }

  pdf.save(input.filename);
}

export async function downloadListingPdf(input: {
  title: string;
  city: string;
  district: string;
  price: number;
  category: string;
  avmNote?: string;
  regionNote?: string;
  mapUrl?: string;
}): Promise<void> {
  await downloadStructuredPdf({
    title: "İlan Özet Raporu",
    subtitle: input.title,
    filename: `ihaleal-ilan-${Date.now()}.pdf`,
    disclaimer: "Bu belge bilgilendirme amaçlıdır; resmi ekspertiz veya tapu kaydı yerine geçmez.",
    sections: [
      {
        heading: "Konum",
        lines: [`${input.district}, ${input.city}`, input.mapUrl ? `Harita: ${input.mapUrl}` : ""].filter(Boolean),
      },
      {
        heading: "Fiyat",
        lines: [`Başlangıç / liste: ₺${Math.round(input.price).toLocaleString("tr-TR")}`, `Kategori: ${input.category}`],
      },
      ...(input.avmNote
        ? [{ heading: "AVM / Değerleme Notu", lines: [input.avmNote] }]
        : []),
      ...(input.regionNote
        ? [{ heading: "Bölge Analizi", lines: [input.regionNote] }]
        : []),
    ],
  });
}

export async function downloadKkaResultPdf(input: {
  address: string;
  landM2: number;
  ownerSharePct: number;
  summaryLines: string[];
}): Promise<void> {
  await downloadStructuredPdf({
    title: "KKA Hesaplama Özeti",
    subtitle: input.address,
    filename: `ihaleal-kka-${Date.now()}.pdf`,
    disclaimer: "Hukuki bağlayıcılık taşımaz; sözleşme taslağı için avukat onayı gereklidir.",
    sections: [
      {
        heading: "Girdiler",
        lines: [
          `Arsa: ${input.landM2.toLocaleString("tr-TR")} m²`,
          `Arsa sahibi payı: %${input.ownerSharePct}`,
        ],
      },
      { heading: "Sonuç", lines: input.summaryLines },
    ],
  });
}

export async function downloadContractDraftPdf(input: {
  parties: string;
  subject: string;
  clauses: string[];
}): Promise<void> {
  await downloadStructuredPdf({
    title: "Teklif / Sözleşme Taslağı",
    subtitle: input.subject,
    filename: `ihaleal-sozlesme-taslak-${Date.now()}.pdf`,
    disclaimer: "Taslak belgedir; nitelikli e-imza veya noter onayı olmadan bağlayıcı değildir.",
    sections: [
      { heading: "Taraflar", lines: [input.parties] },
      { heading: "Hükümler", lines: input.clauses },
    ],
  });
}

export async function downloadProjectReportPdf(input: {
  projectName: string;
  location: string;
  metrics: string[];
}): Promise<void> {
  await downloadStructuredPdf({
    title: "Müteahhit Proje Raporu",
    subtitle: input.projectName,
    filename: `ihaleal-proje-${Date.now()}.pdf`,
    sections: [
      { heading: "Konum", lines: [input.location] },
      { heading: "Metrikler", lines: input.metrics },
    ],
    disclaimer: "Yatırım tavsiyesi değildir.",
  });
}
