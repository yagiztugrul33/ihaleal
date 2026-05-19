import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, "../src/components/ilan/IlanDetailTabs.tsx");

const content = `import { useState } from "react";
import type { PropertyRecord } from "@/types/property";
import { getTypeExtraTab, type TypeExtraTab } from "@/lib/property/kind";
import { useIsMobile } from "@/hooks/use-mobile";
import { RichTabPanel, type RichTabKey } from "@/components/ilan/detail/RichTabPanels";
import { TypeExtraPanel } from "@/components/ilan/detail/TypeExtraPanel";
import type { IlanTypeExtras } from "@/components/ilan/detail/types";
import "@/styles/ilan-detail-rich.css";

export type { IlanTypeExtras };

export interface IlanDetailTabsProps {
  property: PropertyRecord;
  typeExtras: IlanTypeExtras;
}

const BASE_TABS: RichTabKey[] = [
  "GENEL",
  "YAPI",
  "AFET",
  "ALTYAPI",
  "CEVRE",
  "SOSYAL",
  "MALI",
  "HUKUKI",
  "AI",
  "GALERI",
  "EKSPERTIZ",
  "TEKLIFLER",
];

const TAB_LABELS: Record<string, string> = {
  GENEL: "Genel",
  YAPI: "Yapı",
  AFET: "Afet",
  ALTYAPI: "Altyapı",
  CEVRE: "Çevre",
  SOSYAL: "Sosyal",
  MALI: "Mali",
  HUKUKI: "Hukuki",
  AI: "AI",
  GALERI: "Galeri",
  EKSPERTIZ: "Ekspertiz",
  TEKLIFLER: "Teklifler",
  OTEL: "Otel",
  FABRIKA: "Fabrika",
  TARIM: "Tarım",
  GES: "GES",
  AVM: "AVM / Mağaza",
  DEVREN: "Devren",
};

type TabId = RichTabKey | TypeExtraTab;

function labelFor(tab: TabId): string {
  return TAB_LABELS[tab] ?? tab;
}

export function IlanDetailTabs({ property, typeExtras }: IlanDetailTabsProps) {
  const isMobile = useIsMobile();
  const extraTab = getTypeExtraTab(property);
  const tabs: TabId[] = extraTab ? [...BASE_TABS, extraTab] : [...BASE_TABS];
  const [active, setActive] = useState<TabId>("GENEL");

  const goTab = (tab: string) => {
    if (tabs.includes(tab as TabId)) setActive(tab as TabId);
  };

  return (
    <section className="ilan-tabs ilan-tabs--rich" aria-label="İlan detay sekmeleri">
      <div className="ilan-tabs__nav-wrap">
        {isMobile ? (
          <label className="ilan-tabs__select-wrap">
            <span className="sr-only">Sekme seçin</span>
            <select
              className="ilan-tabs__select"
              value={active}
              onChange={(e) => setActive(e.target.value as TabId)}
              aria-label="Detay sekmesi"
            >
              {tabs.map((tab) => (
                <option key={tab} value={tab}>
                  {labelFor(tab)}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <motionless className="ilan-tabs__nav" role="tablist" aria-label="Detay sekmeleri">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                id={\`ilan-tab-\${tab}\`}
                aria-selected={active === tab}
                aria-controls={\`ilan-panel-\${tab}\`}
                className={active === tab ? "ilan-tabs__tab is-active" : "ilan-tabs__tab"}
                onClick={() => setActive(tab)}
              >
                {labelFor(tab)}
              </button>
            ))}
          </motionless>
        )}
      </motionless>

      {tabs.map((tab) => (
        <motionless
          key={tab}
          id={\`ilan-panel-\${tab}\`}
          role="tabpanel"
          aria-labelledby={\`ilan-tab-\${tab}\`}
          hidden={active !== tab}
          className="ilan-tabs__content"
        >
          {active === tab ? (
            BASE_TABS.includes(tab as RichTabKey) ? (
              <RichTabPanel
                tab={tab as RichTabKey}
                property={property}
                typeExtras={typeExtras}
                onGoTab={goTab}
              />
            ) : (
              <TypeExtraPanel kind={tab as TypeExtraTab} property={property} />
            )
          ) : null}
        </motionless>
      ))}
    </section>
  );
}

export default IlanDetailTabs;
`;

const fixed = content.split("motionless").join("div");
fs.writeFileSync(out, fixed, { encoding: "utf8" });
console.log("wrote tabs", fs.readFileSync(out)[0]);
