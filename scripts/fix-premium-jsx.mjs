import { readFileSync, writeFileSync } from "fs";

const path = "src/sections/PremiumCinematicHome.tsx";
let text = readFileSync(path, "utf8");

text = text.replace(
  '<motion.div className="premium-home__grid" aria-hidden="true" />',
  '<div className="premium-home__grid" aria-hidden="true" />',
);

// Simple global: wrong closes after div opens - fix known blocks
text = text.replace(
  `            ))}
            </motion.div>
            <Link to="/ilanlar">{home.live.view}</Link>`,
  `            ))}
            </motion.div>
            <Link to="/ilanlar">{home.live.view}</Link>`,
);

for (const [from, to] of [
  ["          </motion.div>\n          <article className=\"premium-live-card\"", "          </motion.div>\n          <article className=\"premium-live-card\""],
]) {
  text = text.split(from).join(to);
}

// Brute: replace </motion.div> with </motion.div> only where wrong - too risky

writeFileSync(path, text);
console.log("partial");
