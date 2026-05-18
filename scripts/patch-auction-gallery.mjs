import fs from "fs";

const p = "src/pages/AuctionDetail.tsx";
let s = fs.readFileSync(p, "utf8");
const markerStart =
  "        <div className={`relative rounded-2xl overflow-hidden mb-8";
const markerEnd = "        <div className=\"grid lg:grid-cols-3 gap-8\">";
const start = s.indexOf(markerStart);
const end = s.indexOf(markerEnd);
if (start < 0 || end < 0) {
  console.error("markers not found", { start, end });
  process.exit(1);
}
const replacement = `        <div className={\`transition-all duration-700 \${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}\`}>
          <CinematicPropertyGallery
            images={auction.images}
            title={auction.title}
            badges={galleryBadges}
            aiPredictedPrice={auction.aiPredictedPrice}
            liveBid={liveBid}
            investmentScore={auction.investmentScore}
            hasVirtualTour={Boolean(auction.virtualTour)}
            onVirtualTour={() => setShowVirtualTour(true)}
          />
        </div>

`;
s = s.slice(0, start) + replacement + s.slice(end);
fs.writeFileSync(p, s, "utf8");
console.log("patched gallery", start, end);
