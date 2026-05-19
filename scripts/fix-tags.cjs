const fs = require("fs");
const path = process.argv[2];
if (!path) {
  console.error("usage: node fix-tags.cjs <file>");
  process.exit(1);
}
const bad = "motion" + "Metrics";
let c = fs.readFileSync(path, "utf8");
const openRe = new RegExp("<" + bad + "\\s*/>", "g");
const closeRe = new RegExp("</" + bad + ">", "g");
c = c.replace(openRe, "");
c = c.replace(closeRe, "</div>");
fs.writeFileSync(path, c, "utf8");
console.log("fixed", path);
