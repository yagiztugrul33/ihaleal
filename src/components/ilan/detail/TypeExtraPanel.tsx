import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Building, Factory, Leaf, Store, Sun, UtensilsCrossed } from "lucide-react";
import type { PropertyRecord } from "@/types/property";
import type { TypeExtraTab } from "@/lib/property/kind";
import { DataTable, SectionTitle, StatCard, formatTry } from "./shared";
import { detailStr } from "./tabHelpers";

const PIE_COLORS = ["#0d9488", "#6366f1", "#f59e0b", "#f43f5e"];

export interface TypeExtraPanelProps {
  kind: TypeExtraTab;
  property: PropertyRecord;
}

export function TypeExtraPanel({ kind, property }: TypeExtraPanelProps) {
  const d = (property.details ?? {}) as Record<string, unknown>;
  switch (kind) {
    case "OTEL":
      return <OtelPanel d={d} property={property} />;
    case "FABRIKA":
      return <FabrikaPanel d={d} />;
    case "TARIM":
      return <TarimPanel d={d} property={property} />;
    case "GES":
      return <GesPanel d={d} />;
    case "AVM":
      return <AvmPanel d={d} />;
    case "DEVREN":
      return <DevrenPanel d={d} />;
    default:
      return null;
  }
}

function OtelPanel({ d, property }: { d: Record<string, unknown>; property: PropertyRecord }) {
  const occ = Number(d.occupancyRate ?? 68);
  const months = [
    { m: "Oca", v: occ - 8 },
    { m: "Şub", v: occ - 5 },
    { m: "Mar", v: occ },
    { m: "Nis", v: occ + 6 },
    { m: "May", v: occ + 12 },
    { m: "Haz", v: occ + 18 },
  ];
  const mix = [
    { name: "Standart", value: 55 },
    { name: "Deluxe", value: 30 },
    { name: "Suit", value: 15 },
  ];
  return (
    <section className="idr-panel idr-panel--otel">
      <div className="idr-banner">
        <StatCard title="Yıldız" value={String(d.starRating ?? "4")} icon={<Building size={18} />} />
        <StatCard title="Oda" value={String(d.roomCount ?? property.roomCount ?? "—")} />
        <StatCard title="Doluluk" value={`%${occ}`} tone="primary" />
        <StatCard title="Yıllık ciro" value={d.annualRevenueTry ? formatTry(Number(d.annualRevenueTry)) : "—"} />
      </div>
      <div className="idr-charts-row">
        <article className="idr-card">
          <SectionTitle title="Aylık doluluk" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={months}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="m" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="v" fill="#0d9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>
        <article className="idr-card">
          <SectionTitle title="Oda tipi dağılımı" />
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={mix} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label>
                {mix.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </article>
      </div>
      <DataTable
        rows={[
          { label: "Marka", value: detailStr(d, "brandName") ?? "—" },
          { label: "EBITDA", value: d.ebitdaTry ? formatTry(Number(d.ebitdaTry)) : "—" },
          { label: "Spa", value: d.spa ? "Var" : "Yok" },
          { label: "Restoran", value: d.restaurant ? "Var" : "Yok" },
        ]}
      />
    </section>
  );
}

function FabrikaPanel({ d }: { d: Record<string, unknown> }) {
  const areas = [
    { name: "Üretim", value: Number(d.productionSqm ?? 2400) },
    { name: "Ofis", value: Number(d.officeSqm ?? 320) },
    { name: "Depo", value: Number(d.storageSqm ?? 800) },
  ];
  return (
    <section className="idr-panel idr-panel--fabrika">
      <div className="idr-banner">
        <StatCard title="OSB" value={detailStr(d, "osbZone") ?? "—"} icon={<Factory size={18} />} />
        <StatCard title="Vinç" value={d.craneCapacityTon ? `${d.craneCapacityTon} ton` : "—"} />
        <StatCard title="Yıllık kira geliri" value={d.annualRentTry ? formatTry(Number(d.annualRentTry)) : "—"} />
      </div>
      <article className="idr-card">
        <SectionTitle title="Alan dağılımı (m²)" />
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={areas}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </article>
    </section>
  );
}

function TarimPanel({ d, property }: { d: Record<string, unknown>; property: PropertyRecord }) {
  const yieldData = [
    { y: "2022", kg: Number(d.harvestYieldKg ?? 4200) * 0.85 },
    { y: "2023", kg: Number(d.harvestYieldKg ?? 4200) * 0.92 },
    { y: "2024", kg: Number(d.harvestYieldKg ?? 4200) },
  ];
  return (
    <section className="idr-panel idr-panel--tarim">
      <div className="idr-banner">
        <StatCard title="Ürün" value={detailStr(d, "cropType") ?? "—"} icon={<Leaf size={18} />} />
        <StatCard title="Toprak" value={detailStr(d, "soilClass") ?? "—"} />
        <StatCard title="Arsa" value={property.landSqm ? `${property.landSqm} m²` : "—"} />
      </div>
      <article className="idr-card">
        <SectionTitle title="Hasat verimi (kg)" />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={yieldData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="y" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="kg" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </article>
      <DataTable
        rows={[
          { label: "Sulama", value: detailStr(d, "irrigation") ?? (d.irrigation ? "Var" : "Yok") },
          { label: "Su kaynağı", value: detailStr(d, "waterSource") ?? "—" },
          { label: "İmar notu", value: detailStr(d, "zoningNote") ?? detailStr(d, "imarDurumu") ?? "—" },
        ]}
      />
    </section>
  );
}

function GesPanel({ d }: { d: Record<string, unknown> }) {
  const prod = Number(d.annualProductionMwh ?? 1200);
  const chart = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"].map((m, i) => ({
    m,
    mwh: Math.round((prod / 12) * (0.6 + 0.4 * Math.sin((i / 12) * Math.PI * 2))),
  }));
  return (
    <section className="idr-panel idr-panel--ges">
      <div className="idr-banner">
        <StatCard title="Kurulu güç" value={d.installedCapacityMw ? `${d.installedCapacityMw} MW` : "—"} icon={<Sun size={18} />} />
        <StatCard title="Panel" value={String(d.panelCount ?? "—")} />
        <StatCard title="PPA" value={d.ppaSigned ? "İmzalı" : "Yok"} />
      </div>
      <article className="idr-card">
        <SectionTitle title="Aylık üretim (MWh)" />
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="m" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="mwh" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </article>
    </section>
  );
}

function AvmPanel({ d }: { d: Record<string, unknown> }) {
  const traffic = [
    { g: "Hafta içi", v: 4200 },
    { g: "Hafta sonu", v: 7800 },
    { g: "Kampanya", v: 9500 },
  ];
  return (
    <section className="idr-panel idr-panel--avm">
      <div className="idr-banner">
        <StatCard title="AVM" value={detailStr(d, "mallName") ?? "—"} icon={<Store size={18} />} />
        <StatCard title="Kira" value={d.monthlyRentTry ? formatTry(Number(d.monthlyRentTry)) : "—"} />
        <StatCard title="Cephe" value={d.frontageM ? `${d.frontageM} m` : "—"} />
      </div>
      <article className="idr-card">
        <SectionTitle title="Günlük ziyaretçi (demo)" />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={traffic}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="g" tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="v" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </article>
    </section>
  );
}

function DevrenPanel({ d }: { d: Record<string, unknown> }) {
  const pl = [
    { k: "Gelir", v: Number(d.monthlyRevenueTry ?? 180000) },
    { k: "Gider", v: Number(d.monthlyRevenueTry ?? 180000) * 0.62 },
    { k: "Kâr", v: Number(d.monthlyProfitTry ?? 68000) },
  ];
  return (
    <section className="idr-panel idr-panel--devren">
      <div className="idr-banner">
        <StatCard title="İşletme" value={detailStr(d, "businessName") ?? "—"} icon={<UtensilsCrossed size={18} />} />
        <StatCard title="Sektör" value={detailStr(d, "sector") ?? "—"} />
        <StatCard title="Personel" value={String(d.employeeCount ?? "—")} />
        <StatCard title="Devir bedeli" value={d.transferPriceTry ? formatTry(Number(d.transferPriceTry)) : "—"} tone="primary" />
      </div>
      <article className="idr-card">
        <SectionTitle title="Aylık P&L (TRY)" />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={pl}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="k" />
            <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}K`} />
            <Tooltip formatter={(v: number) => formatTry(v)} />
            <Bar dataKey="v" fill="#0d9488" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </article>
      <DataTable
        rows={[
          { label: "Aylık kira", value: d.monthlyRentTry ? formatTry(Number(d.monthlyRentTry)) : "—" },
          { label: "Kalan kira süresi", value: d.leaseRemainingMonths ? `${d.leaseRemainingMonths} ay` : "—" },
          { label: "Sözleşme", value: detailStr(d, "contractType") ?? "—" },
          { label: "Ekipman özeti", value: detailStr(d, "equipmentSummary") ?? "—" },
          { label: "Ekipman dahil", value: d.equipmentIncluded ? "Evet" : "Hayır" },
          { label: "Marka hakkı", value: d.brandRights ? "Evet" : "Hayır" },
        ]}
      />
      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-300">
        Devren koruma notu (mock): devreden/devralan için devir sözleşmesi, ciro-kira-devir bedeli teyidi, çalışan/ekipman listesi ve sözleşme devri uygunluğu birlikte kontrol edilir.
      </div>
    </section>
  );
}
