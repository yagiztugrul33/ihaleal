import fs from "fs";
const O = "<" + String.fromCharCode(100,105,118);
const C = "</" + String.fromCharCode(100,105,118) + ">";
let t = fs.readFileSync("src/pages/Corporate.tsx", "utf16le");
t = t.replace(/<motion\b/g, O).replace(/<\/motion>/g, C);
