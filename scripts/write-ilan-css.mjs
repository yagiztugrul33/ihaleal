import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const out = path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/styles/ilan-detail-rich.css");

const css = `/* Rich ilan detail tab panels (Dalga 2) */

.ilan-tabs--rich .ilan-tabs__select-wrap {
  display: block;
  padding: 0.5rem 0;
}

.ilan-tabs--rich .ilan-tabs__select {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  font-size: 0.9rem;
  font-weight: 600;
  background: var(--color-bg, #fff);
  color: #0f172a;
}

@media (max-width: 767px) {
  .ilan-tabs--rich .ilan-tabs__nav {
    display: none;
  }
}

@media (min-width: 768px) {
  .ilan-tabs--rich .ilan-tabs__select-wrap {
    display: none;
  }
}

.idr-panel {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 0.25rem 0 1.5rem;
}

.idr-banner {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem;
}

.idr-split {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}

.idr-card {
  padding: 1rem 1.1rem;
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: var(--color-bg, #fff);
  box-shadow: 0 4px 24px rgba(15, 23, 42, 0.04);
}

.idr-card--center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.idr-flex-1 {
  flex: 1;
  min-width: 0;
}

.idr-muted {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.5;
}

.idr-section-title {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.idr-section-title h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.idr-section-title p {
  margin: 0.2rem 0 0;
  font-size: 0.8rem;
  color: #64748b;
}

.idr-stat {
  display: flex;
  gap: 0.65rem;
  padding: 0.85rem;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.06);
  background: rgba(15, 23, 42, 0.02);
}

.idr-stat--primary {
  border-color: rgba(13, 148, 136, 0.25);
  background: rgba(13, 148, 136, 0.06);
}

.idr-stat__icon {
  color: var(--color-primary, #0d9488);
}

.idr-stat__title {
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.idr-stat__value {
  display: block;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.idr-stat__hint {
  display: block;
  font-size: 0.72rem;
  color: #94a3b8;
  margin-top: 0.15rem;
}

.idr-score {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  color: var(--color-primary, #0d9488);
}

.idr-score--mid {
  color: #f59e0b;
}

.idr-score--low {
  color: #ef4444;
}

.idr-score svg {
  display: block;
}

.idr-score__inner {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.idr-score__value {
  font-size: 1.35rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
}

.idr-score__unit {
  font-size: 0.65rem;
  color: #64748b;
}

.idr-score__label {
  margin-top: 0.35rem;
  font-size: 0.75rem;
  color: #64748b;
}

.idr-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0;
}

.idr-badge {
  display: inline-flex;
  padding: 0.28rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(15, 23, 42, 0.06);
  color: #334155;
}

.idr-badges--good .idr-badge {
  background: rgba(13, 148, 136, 0.12);
  color: #0f766e;
}

.idr-badges--warn .idr-badge {
  background: rgba(245, 158, 11, 0.15);
  color: #b45309;
}

.idr-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.idr-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  font-size: 0.85rem;
  color: #334155;
}

.idr-list--good svg {
  color: #0d9488;
  flex-shrink: 0;
  margin-top: 0.15rem;
}

.idr-list--warn svg {
  color: #f59e0b;
  flex-shrink: 0;
  margin-top: 0.15rem;
}

.idr-persona-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.65rem;
}

.idr-persona-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.55rem;
  border-radius: 8px;
  font-size: 0.75rem;
  background: rgba(99, 102, 241, 0.1);
  color: #4338ca;
}

.idr-minimap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 120px;
  margin-top: 0.75rem;
  border: 1px dashed rgba(13, 148, 136, 0.35);
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(13, 148, 136, 0.08), rgba(99, 102, 241, 0.06));
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.idr-minimap__grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(15, 23, 42, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 23, 42, 0.06) 1px, transparent 1px);
  background-size: 16px 16px;
}

.idr-minimap__pin {
  position: relative;
  color: var(--color-primary, #0d9488);
}

.idr-minimap__label {
  position: relative;
  font-size: 0.85rem;
  font-weight: 700;
  color: #0f172a;
}

.idr-minimap__sub {
  position: relative;
  font-size: 0.75rem;
  color: #64748b;
}

.idr-table-wrap {
  width: 100%;
}

.idr-table-caption {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0 0 0.5rem;
}

.idr-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.idr-table th,
.idr-table td {
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  text-align: left;
  vertical-align: top;
}

.idr-table th {
  width: 38%;
  color: #64748b;
  font-weight: 600;
}

.idr-table-cards {
  list-style: none;
  margin: 0;
  padding: 0;
  display: none;
  flex-direction: column;
  gap: 0.5rem;
}

.idr-table-card {
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(15, 23, 42, 0.02);
}

.idr-table-card__label {
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  color: #64748b;
}

.idr-table-card__value {
  display: block;
  font-size: 0.88rem;
  color: #0f172a;
  word-break: break-word;
}

@media (max-width: 767px) {
  .idr-table--desktop {
    display: none;
  }
  .idr-table--mobile {
    display: flex;
  }
}

@media (min-width: 768px) {
  .idr-table--mobile {
    display: none;
  }
}

.idr-yapi-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 1rem;
  align-items: start;
}

@media (max-width: 900px) {
  .idr-yapi-grid {
    grid-template-columns: 1fr;
  }
}

.idr-yapi-cards {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.idr-feature-card {
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: linear-gradient(145deg, rgba(13, 148, 136, 0.06), transparent);
}

.idr-feature-card h4 {
  margin: 0.4rem 0 0.15rem;
  font-size: 0.9rem;
}

.idr-feature-card p {
  margin: 0;
  font-size: 0.82rem;
  color: #64748b;
}

.idr-afet-top {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1rem;
  align-items: stretch;
}

@media (max-width: 768px) {
  .idr-afet-top {
    grid-template-columns: 1fr;
  }
}

.idr-progress {
  height: 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.08);
  overflow: hidden;
  margin: 0.5rem 0;
}

.idr-progress__fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #0d9488, #6366f1);
}

.idr-dask {
  text-align: center;
  max-width: 200px;
}

.idr-dask h4 {
  margin: 0.35rem 0;
}

.idr-quake-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.idr-quake-list li {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 0.75rem;
  padding: 0.55rem 0;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  font-size: 0.85rem;
}

.idr-infra-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.65rem;
}

.idr-infra-card {
  padding: 0.85rem;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  opacity: 0.65;
}

.idr-infra-card.is-on {
  opacity: 1;
  border-color: rgba(13, 148, 136, 0.3);
  background: rgba(13, 148, 136, 0.05);
}

.idr-infra-card h4 {
  margin: 0.35rem 0 0.1rem;
  font-size: 0.85rem;
}

.idr-infra-card p {
  margin: 0;
  font-size: 0.75rem;
  color: #64748b;
}

.idr-map-wrap {
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.1);
  height: 320px;
}

.idr-leaflet {
  width: 100%;
  height: 100%;
  min-height: 320px;
}

.idr-poi-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.idr-poi-list li {
  display: grid;
  grid-template-columns: 80px 1fr auto auto;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  font-size: 0.82rem;
}

.idr-poi-type {
  text-transform: capitalize;
  color: #64748b;
  font-weight: 600;
}

.idr-charts-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.idr-range-label {
  display: block;
  font-size: 0.85rem;
  margin-bottom: 0.35rem;
}

.idr-range {
  width: 100%;
  accent-color: var(--color-primary, #0d9488);
}

.idr-yield {
  margin: 0.35rem 0 0;
  font-weight: 700;
  color: #0d9488;
}

.idr-deed-flags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.idr-flag {
  padding: 0.35rem 0.65rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  background: rgba(34, 197, 94, 0.12);
  color: #15803d;
}

.idr-flag.is-warn {
  background: rgba(245, 158, 11, 0.15);
  color: #b45309;
}

.idr-doc-links {
  list-style: none;
  margin: 0 0 1rem;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.idr-doc-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.75rem;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.05);
  color: var(--color-primary, #0d9488);
  font-weight: 600;
  font-size: 0.82rem;
  text-decoration: none;
}

.idr-ai-top {
  display: grid;
  grid-template-columns: minmax(200px, 280px) 1fr;
  gap: 1rem;
}

@media (max-width: 768px) {
  .idr-ai-top {
    grid-template-columns: 1fr;
  }
}

.idr-fair-value__price {
  margin: 0.25rem 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-primary, #0d9488);
}

.idr-comparables {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.65rem;
}

.idr-comp-card {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.75rem;
  border-radius: 10px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  text-decoration: none;
  color: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.idr-comp-card:hover {
  border-color: var(--color-primary, #0d9488);
  box-shadow: 0 4px 16px rgba(13, 148, 136, 0.12);
}

.idr-comp-title {
  font-size: 0.8rem;
  font-weight: 600;
}

.idr-gallery-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .idr-gallery-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.idr-gallery-item {
  padding: 0;
  border: none;
  border-radius: 10px;
  overflow: hidden;
  aspect-ratio: 4 / 3;
  cursor: zoom-in;
  background: #e2e8f0;
}

.idr-gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.idr-media-rows {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.65rem;
}

.idr-lightbox {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.88);
  padding: 2rem;
  cursor: zoom-out;
}

.idr-lightbox img {
  max-width: min(1100px, 100%);
  max-height: 90vh;
  border-radius: 12px;
  object-fit: contain;
}

.idr-report-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.idr-empty-expertise {
  text-align: center;
  padding: 2rem 1rem;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.03);
}

.idr-empty-expertise h4 {
  margin: 0.5rem 0 0.25rem;
}

.idr-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.55rem 1rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  text-decoration: none;
}

.idr-btn--primary {
  background: var(--color-primary, #0d9488);
  color: #fff;
}

.idr-btn--ghost {
  background: transparent;
  border: 1px solid rgba(15, 23, 42, 0.15);
  color: #0f172a;
}

.idr-modal {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 360px;
}

.idr-modal input {
  padding: 0.5rem 0.65rem;
  border-radius: 8px;
  border: 1px solid rgba(15, 23, 42, 0.15);
}

.idr-timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  font-size: 1.75rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: #0f172a;
}

.idr-cta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.idr-link {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-primary, #0d9488);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
`;

fs.writeFileSync(out, css, { encoding: "utf8" });
console.log("wrote css", fs.readFileSync(out)[0]);
