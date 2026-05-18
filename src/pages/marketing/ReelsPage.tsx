import { PageShell } from "@/components/marketing/PageShell";

const REEL_COUNT = 10;

export default function ReelsPage() {
  return (
    <PageShell
      badge="Reels"
      title="Platform tanitim videolari"
      subtitle="Dikey kaydirmali kisa videolar ile ozellikleri kesfedin."
      className="!pb-0"
    >
      <section
        className="h-[calc(100vh-12rem)] overflow-y-auto snap-y snap-mandatory rounded-2xl border border-[var(--color-border)]"
        aria-label="Reels galerisi"
      >
        {Array.from({ length: REEL_COUNT }, (_, i) => {
          const num = String(i + 1).padStart(2, "0");
          return (
            <div
              key={num}
              className="snap-start snap-always min-h-full flex items-center justify-center bg-black"
            >
              <video
                className="w-full max-w-md h-full max-h-[85vh] object-contain"
                controls
                playsInline
                preload="metadata"
                poster="/og-image.png"
              >
                <source src={`/videos/reels-${num}.mp4`} type="video/mp4" />
              </video>
            </div>
          );
        })}
      </section>
    </PageShell>
  );
}
