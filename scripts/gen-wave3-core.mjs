import fs from "fs";
import path from "path";
const root = path.resolve(".");
function w(rel, content) {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, { encoding: "utf8" });
  console.log("wrote", rel);
}
const faults = { type: "FeatureCollection", features: [
  { type: "Feature", properties: { name: "Kuzey Anadolu (Adalar)", code: "NAF-ADL" }, geometry: { type: "LineString", coordinates: [[28.9,40.8],[29.3,40.4]] } },
  { type: "Feature", properties: { name: "Kuzey Anadolu (Sapanca)", code: "NAF-SAP" }, geometry: { type: "LineString", coordinates: [[30.2,40.7],[30.8,40.3]] } },
  { type: "Feature", properties: { name: "Dogu Anadolu", code: "DAF-ERZ" }, geometry: { type: "LineString", coordinates: [[39.4,39.7],[39.8,39.3]] } },
]};
const cities = [{city:"Istanbul",lat:41.01,lng:28.97},{city:"Ankara",lat:39.93,lng:32.85},{city:"Izmir",lat:38.42,lng:27.14},{city:"Antalya",lat:36.89,lng:30.71},{city:"Bursa",lat:40.19,lng:29.06},{city:"Hatay",lat:36.2,lng:36.16},{city:"Kahramanmaras",lat:37.58,lng:36.93}];
const assembly = [];
let aid = 1;
for (const c of cities) for (let i = 0; i < 30; i++) assembly.push({ id:`asm-${aid++}`, name:`${c.city} Toplanma ${i+1}`, city:c.city, lat:c.lat+(i%10)*0.008-0.04, lng:c.lng+(i%7)*0.01-0.03, capacity:500+(i%20)*200, areaSqm:1200+i*80, water:true, toilet:true });
const quakes = [];
const now = Date.now();
for (let i = 0; i < 50; i++) quakes.push({ id:`eq-${i+1}`, time:new Date(now-i*0.6*86400000).toISOString(), magnitude:+(2.5+(i%15)*0.3).toFixed(1), depthKm:5+(i%20), lat:36+(i%8)*0.5, lng:27+(i%10)*0.4, place:["Canakkale","Duzce","Van","Izmir","Elazig","Malatya","Antalya"][i%7], affectedProvinces:["Canakkale"] });
const dask = {};
for (let n = 1; n <= 60; n++) { const id = `prop-${String(n).padStart(3,"0")}`; dask[id] = { status: n%7===0?"gecersiz":"gecerli", policyNo:`DASK-${100000+n}`, amountTry:800000+n*15000, lastPayment:"2026-01-15", adequate:n%5!==0 }; }
w("public/geo/mta-faults-mock.geojson", JSON.stringify(faults,null,2));
w("public/data/afad-assembly-mock.json", JSON.stringify(assembly,null,2));
w("public/data/kandilli-feed-mock.json", JSON.stringify({updated:new Date().toISOString(),events:quakes},null,2));
w("public/data/dask-policy-mock.json", JSON.stringify(dask,null,2));