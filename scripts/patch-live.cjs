const fs = require("fs");
const p = "src/sections/LiveAuctionsShowcase.tsx";
let s = fs.readFileSync(p, "utf8");
const refCards = `const REF_PROPERTY_CARDS = [
  { id: "ref-villa", title: "L\u00fcks Villa", city: "Bodrum", district: "Yal\u0131kavak", currentBid: 24_500_000, estimatedValue: 22_000_000, bidderCount: 18, hoursLeft: 14, image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80" },
  { id: "ref-office", title: "Modern Ofis", city: "\u0130stanbul", district: "Maslak", currentBid: 18_200_000, estimatedValue: 16_500_000, bidderCount: 12, hoursLeft: 8, image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80" },
  { id: "ref-apartment", title: "Premium Daire", city: "\u0130zmir", district: "Alsancak", currentBid: 6_850_000, estimatedValue: 6_200_000, bidderCount: 9, hoursLeft: 22, image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80" },
  { id: "ref-commercial", title: "Ticari Kompleks", city: "Ankara", district: "\u00c7ankaya", currentBid: 42_000_000, estimatedValue: 38_000_000, bidderCount: 24, hoursLeft: 5, image: "https://images.unsplash.com/photo-1545324417-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80" },
] as const;

`;
if (!s.includes("REF_PROPERTY_CARDS")) {
  s = s.replace("const TRUST_FEATURES", refCards + "const TRUST_FEATURES");
}
s = s.replace("Banka duzeyi sifreleme.", "Banka d\u00fczeyi \u015fifreleme ve \u00e7ok fakt\u00f6rl\u00fc kimlik do\u011frulama.");
s = s.replace("Degerleme motoru ve yatirim skoru.", "De\u011ferleme motoru, yat\u0131r\u0131m skoru ve risk raporlar\u0131.");
s = s.replace("Her adim denetlenebilir.", "Her teklif ve s\u00fcre\u00e7 ad\u0131m\u0131 denetlenebilir kay\u0131t alt\u0131nda.");
s = s.replace("Turkiye ve global ag.", "T\u00fcrkiye ve uluslararas\u0131 kurumsal yat\u0131r\u0131mc\u0131 a\u011f\u0131.");
s = s.replace("Seffaflik", "\u015eeffafl\u0131k");
s = s.replace("Kuresel Erisim", "K\u00fcrel Eri\u015fim");
s = s.replace("AI degerleme dahil", "AI de\u011ferleme dahil");
s = s.replace("const live = getLocalAndStaticAuctions()", "const liveAuctions = getLocalAndStaticAuctions()");
const oldBlock = 'const liveAuctions = getLocalAndStaticAuctions().filter((a) => a.status === "live").slice(0, 4);';
const newBlock = oldBlock + `
  const displayCards =
    liveAuctions.length >= 4
      ? liveAuctions.map((a) => ({
          id: a.id,
          title: a.title,
          city: a.city,
          district: a.district,
          currentBid: a.currentBid,
          estimatedValue: a.estimatedValue,
          bidderCount: a.bidderCount,
          hoursLeft: Math.max(1, Math.floor((new Date(a.endDate).getTime() - Date.now()) / 3600000)),
          image: a.images[0],
          navigateTo: \`/ilan/\${a.id}\`,
        }))
      : REF_PROPERTY_CARDS.map((c) => ({ ...c, navigateTo: "/ilanlar" }));`;
s = s.replace(oldBlock, newBlock);
s = s.replace("{live.map", "{displayCards.map");
s = s.replace("ref-property-card group", "ref-property-card ref-glass-panel group");
s = s.replace("navigate(`/ilan/${auction.id}`)", "navigate(auction.navigateTo)");
s = s.replace("auction.images[0]", "auction.image");
s = s.replace(/const hoursLeft = [^;]+;\r?\n\s+/, "");
s = s.replace("{hoursLeft}s kald", "{auction.hoursLeft}s kald");
s = s.replace('<aside className="ref-trust-sidebar">', '<aside className="ref-trust-sidebar ref-glass-panel">');
s = s.replace("<span>KVKK</span>", '<span>KVKK / GDPR</span>\n              <span>Siber G\u00fcvenlik</span>');
s = s.replace(
  '<p className="text-xl font-bold text-white">{formatPrice(auction.currentBid)}</p>',
  '<p className="text-xs text-slate-500">G\u00fcncel teklif</p>\n                          <p className="text-xl font-bold text-white">{formatPrice(auction.currentBid)}</p>'
);
fs.writeFileSync(p, s, "utf8");
const b = fs.readFileSync(p);
console.log("ok", b[0], b[1], b.length);