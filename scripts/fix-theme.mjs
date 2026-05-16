import fs from "fs";

const css = `/* ihaleal - Tasarim Sistemi v1 */
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap");

:root {
  --color-primary: #0f4c5c;
  --color-primary-hover: #0a3540;
  --color-primary-light: #1e6878;
  --color-accent: #c77f3a;
  --color-accent-hover: #a8682b;
  --color-accent-light: #e2a360;
  --color-success: #2d6a4f;
  --color-success-light: #40916c;
  --color-bg: #d9c49a;
  --color-bg-card: #ebe0cc;
  --color-bg-soft: #cbb892;
  --color-bg-elevated: #ebe0cc;
  --color-text: #1f2937;
  --color-text-muted: #64748b;
  --color-text-light: #94a3b8;
  --color-text-on-dark: #ebe0cc;
  --color-border: #e5dcc7;
  --color-border-strong: #c9bfa8;
  --gradient-warm: linear-gradient(160deg, #d9c49a 0%, #cbb892 50%, #bfa97a 100%);
  --gradient-hero: linear-gradient(180deg, #cbb892 0%, #d9c49a 45%, #c5ad82 100%);
  --gradient-cta: linear-gradient(135deg, #0f4c5c 0%, #1e6878 100%);
  --shadow-sm: 0 1px 2px rgba(15, 76, 92, 0.05);
  --shadow-md: 0 4px 12px rgba(15, 76, 92, 0.08);
  --shadow-lg: 0 12px 32px rgba(15, 76, 92, 0.12);
  --shadow-xl: 0 24px 48px rgba(15, 76, 92, 0.15);
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --font-display: "Plus Jakarta Sans", "Inter", system-ui, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;
}

html,
body,
#root {
  background: var(--color-bg) !important;
  background-image: var(--gradient-warm) !important;
  color: var(--color-text);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.btn-primary {
  background: var(--color-primary);
  color: var(--color-text-on-dark);
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
  display: inline-block;
  text-decoration: none;
}
.btn-primary:hover {
  background: var(--color-primary-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.btn-accent {
  background: var(--color-accent);
  color: white;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
  display: inline-block;
  text-decoration: none;
}
.btn-accent:hover {
  background: var(--color-accent-hover);
  box-shadow: var(--shadow-md);
}

.btn-ghost {
  background: transparent;
  color: var(--color-primary);
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-border-strong);
  transition: all 0.2s ease;
  display: inline-block;
  text-decoration: none;
}
.btn-ghost:hover {
  background: var(--color-bg-soft);
  border-color: var(--color-primary);
}

.card-warm {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}
.card-warm:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
  border-color: var(--color-accent-light);
}

.hero-warm {
  background: var(--gradient-hero);
  position: relative;
  overflow: hidden;
}
.hero-warm::before {
  content: "";
  position: absolute;
  top: -40%;
  right: -8%;
  width: 640px;
  height: 640px;
  background: radial-gradient(circle, rgba(199, 127, 58, 0.22) 0%, transparent 68%);
  pointer-events: none;
}
.hero-warm::after {
  content: "";
  position: absolute;
  bottom: -35%;
  left: -12%;
  width: 560px;
  height: 560px;
  background: radial-gradient(circle, rgba(15, 76, 92, 0.14) 0%, transparent 70%);
  pointer-events: none;
}

.page-shell,
.page-shell.page-shell-gradient,
[data-theme="light"] .page-shell {
  background: var(--gradient-warm) !important;
  background-color: var(--color-bg) !important;
}

.section-warm {
  background: var(--color-bg-soft);
}

.section-warm-alt {
  background: var(--color-bg);
}

.badge-corp {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-bg-soft);
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  border: 1px solid var(--color-border);
}
.badge-corp::before {
  content: "";
  width: 6px;
  height: 6px;
  background: var(--color-accent);
  border-radius: 50%;
}
`;

fs.writeFileSync("src/styles/theme.css", css, "utf8");
const b = fs.readFileSync("src/styles/theme.css");
console.log("theme.css utf8 ok, null bytes:", b.includes(0), "size:", b.length);
