const fs = require("fs");
const p = "src/pages/intelligence/GesAnalysisPage.tsx";
let t = fs.readFileSync(p, "utf8");
const needle = 'setLandM2(e.target.value)} className="mt-1" />';
const wrong = needle + "</" + "motion.div" + ">";
const right = needle + "</" + "div" + ">";
if (!t.includes(wrong)) {
  console.error("wrong pattern not found");
  process.exit(1);
}
t = t.replace(wrong, right);
fs.writeFileSync(p, t, "utf8");
console.log("OK");
