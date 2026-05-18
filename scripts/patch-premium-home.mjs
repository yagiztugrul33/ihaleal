import { readFileSync, writeFileSync } from "fs";

const path = "src/sections/PremiumCinematicHome.tsx";
let s = readFileSync(path, "utf8");

if (!s.includes('from "react-router-dom"')) {
  s = s.replace(
    'import { useMemo, useRef, type CSSProperties } from "react";',
    'import { useMemo, type CSSProperties } from "react";\nimport { Link } from "react-router-dom";',
  );
  s = s.replace(
    /import \{ motion, useScroll, useTransform \} from "framer-motion";/,
    'import { motion } from "framer-motion";',
  );
  s = s.replace(
    /const heroVisualRef = useRef<HTMLDivElement>\(null\);\s*const \{ scrollYProgress \} = useScroll\(\{[\s\S]*?\}\);\s*const parallaxY = useTransform\(scrollYProgress, \[0, 1\], \[0, -80\]\);\s*/,
    "",
  );
  s = s.replace(/ref=\{heroVisualRef\}\s*/, "");
  s = s.replace(
    /style=\{reduced \? undefined : \{ y: parallaxY \}\}/,
    "",
  );
}

const trustStrip = `
      <section className="premium-trust-strip" aria-label={home.aria.trustRow}>
        <Link to="/yasal/guvenlik" className="premium-trust-strip__item">
          <strong>{home.trust[0]?.title}</strong>
          <span>{home.trust[0]?.sub}</span>
        </Link>
        <Link to="/hakkimizda#topluluk" className="premium-trust-strip__item">
          <strong>{home.trust[1]?.title}</strong>
          <span>{home.trust[1]?.sub}</span>
        </Link>
        <Link to="/yorumlar" className="premium-trust-strip__item">
          <strong>{home.trust[2]?.title}</strong>
          <span>{home.trust[2]?.sub}</span>
        </Link>
        <Link to="/destek" className="premium-trust-strip__item">
          <strong>{home.trust[3]?.title}</strong>
          <span>{home.trust[3]?.sub}</span>
        </Link>
      </section>
`;

if (!s.includes("premium-trust-strip")) {
  s = s.replace(
    /          <motion\.motion className="premium-trust-row"[\s\S]*?          <\/motion\.motion>\n        <\/motion\.motion>/,
    "        </motion.div>",
  );
  s = s.replace(
    /<motion\.motion className="premium-trust-row"[\s\S]*?<\/motion\.motion>\s*<\/motion\.motion>\s*\n\s*<div/,
    "</motion.div>\n\n        <div",
  );
  // fallback: remove trust row block between ctas and closing copy
  s = s.replace(
    /\n          <motion\.div\n            className="premium-trust-row"[\s\S]*?\n          <\/motion\.motion>\n/,
    "\n",
  );
  s = s.replace("</section>\n\n      <section className=\"premium-categories\"", `${trustStrip}\n      <section className="premium-categories"`);
}

const institutions = `
      <section className="premium-institutions" aria-label="Kurumsal güven">
        <p>{home.institutions?.heading ?? "Dünyanın önde gelen kurumları güveniyor"}</p>
        <motion.div className="premium-institutions__logos">
          {["JLL", "CBRE", "Colliers", "Knight Frank", "Cushman & Wakefield", "Savills", "EY"].map((name) => (
            <span key={name} className="premium-institutions__logo">{name}</span>
          ))}
        </motion.div>
      </section>
`;

if (!s.includes("premium-institutions")) {
  s = s.replace(
    '<section className="premium-testimonials"',
    `${institutions}\n      <section className="premium-testimonials"`,
  );
}

const auctionIds = ['"1"', '"2"', '"3"', '"4"'];
let ai = 0;
s = s.replace(/home\.auctions\.items\.map\(\(item, i\) => \(\{[\s\S]*?tone: AUCTION_TONES\[i\]/, (m) => {
  return m + `,\n        id: FEATURED_IDS[i] ?? "1"`;
});
if (!s.includes("FEATURED_IDS")) {
  s = s.replace(
    "const AUCTION_TONES",
    'const FEATURED_IDS = ["1", "2", "3", "4"] as const;\nconst AUCTION_TONES',
  );
}

s = s.replace(
  /<article key=\{auction\.title\} className="premium-auction-card">/g,
  '<Link to={`/ilanlar/${FEATURED_IDS[i] ?? "1"}`} className="premium-auction-card premium-auction-card--linked">',
);
// fix map to use index - need different approach
writeFileSync(path, s);
console.log("patched partial - manual review needed");
