import { Fragment, type ReactNode } from "react";

function formatInline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      out.push(<Fragment key={`${keyPrefix}-t-${i++}`}>{text.slice(last, m.index)}</Fragment>);
    }
    const token = m[1];
    if (token.startsWith("**")) {
      out.push(
        <strong key={`${keyPrefix}-b-${i++}`} className="font-semibold text-slate-100">
          {token.slice(2, -2)}
        </strong>
      );
    } else {
      out.push(
        <code
          key={`${keyPrefix}-c-${i++}`}
          className="rounded bg-white/10 px-1.5 py-0.5 text-[0.85em] text-cyan-200"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    last = m.index + token.length;
  }
  if (last < text.length) {
    out.push(<Fragment key={`${keyPrefix}-e-${i++}`}>{text.slice(last)}</Fragment>);
  }
  return out;
}

function renderBodyBlock(lines: string[], baseKey: string): ReactNode {
  const nodes: ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
      continue;
    }
    if (line.startsWith("### ")) {
      nodes.push(
        <h3
          key={`${baseKey}-h3-${i}`}
          className="mt-4 text-sm font-semibold uppercase tracking-wide text-teal-300/90"
        >
          {formatInline(line.slice(4).trim(), `${baseKey}-h3-${i}`)}
        </h3>
      );
      i += 1;
      continue;
    }
    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2).trim());
        i += 1;
      }
      nodes.push(
        <ul key={`${baseKey}-ul-${i}`} className="my-2 list-disc space-y-1 pl-5 text-slate-300">
          {items.map((t, j) => (
            <li key={j} className="leading-relaxed">
              {formatInline(t, `${baseKey}-li-${i}-${j}`)}
            </li>
          ))}
        </ul>
      );
      continue;
    }
    const para: string[] = [line];
    i += 1;
    while (i < lines.length && lines[i].trim() && !lines[i].startsWith("### ") && !lines[i].startsWith("- ")) {
      para.push(lines[i]);
      i += 1;
    }
    nodes.push(
      <p key={`${baseKey}-p-${i}`} className="my-2 text-sm leading-relaxed text-slate-300">
        {formatInline(para.join(" "), `${baseKey}-p-${i}`)}
      </p>
    );
  }
  return <div className="space-y-1">{nodes}</div>;
}

type Props = {
  markdown: string;
  className?: string;
};

export function LegalMarkdownRenderer({ markdown, className }: Props) {
  const normalized = markdown.replace(/\r\n/g, "\n").trim();
  const parts = normalized.split(/\n(?=## )/);
  const first = parts[0]?.trim() ?? "";
  const rest = parts.slice(1);

  let intro = first;
  if (first.startsWith("# ")) {
    const nl = first.indexOf("\n");
    intro = nl === -1 ? "" : first.slice(nl + 1).trim();
  }

  return (
    <div className={className}>
      {intro ? (
        <div className="mb-8 rounded-2xl border border-white/10 bg-slate-900/40 p-5">
          {renderBodyBlock(intro.split("\n"), "intro")}
        </div>
      ) : null}
      <div className="space-y-4">
        {rest.map((chunk, idx) => {
          const lines = chunk.split("\n");
          const head = lines[0]?.replace(/^##\s+/, "").trim() ?? "";
          const body = lines.slice(1).join("\n").trim();
          return (
            <section
              key={idx}
              className="legal-doc-section scroll-mt-24 rounded-2xl border border-white/10 bg-slate-950/50 p-5 shadow-lg shadow-black/20"
            >
              <h2 className="text-lg font-bold text-white">{formatInline(head, `sec-${idx}-h2`)}</h2>
              <div className="mt-3 border-t border-white/5 pt-3">{renderBodyBlock(body.split("\n"), `sec-${idx}`)}</div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
