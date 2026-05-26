import os from "node:os";

const port = Number(process.env.VITE_DEV_PORT || process.env.PORT || 5185);
const addrs = [];
for (const nets of Object.values(os.networkInterfaces())) {
  if (!nets) continue;
  for (const net of nets) {
    if (net.family !== "IPv4" || net.internal) continue;
    addrs.push(net.address);
  }
}

console.log("");
console.log("  ihaleal - phone (same Wi-Fi)");
console.log("  -----------------------------");
if (addrs.length === 0) {
  console.log("  No IPv4 address found.");
} else {
  for (const ip of addrs) {
    console.log(`  http://${ip}:${port}/#/`);
    console.log(`  http://${ip}:${port}/#/borsa`);
  }
}
console.log("");
console.log("  Start: npm run dev:mobile:follow");
console.log("  Open one URL on your phone (HashRouter needs /#/).");
console.log("");
