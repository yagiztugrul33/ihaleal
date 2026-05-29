import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, MapPin, Search, ShieldCheck, TrendingUp } from "lucide-react";

const STATS = [
  { label: "Türkiye genelinde denetlenen demo ilan segmenti", value: "12.400+", hint: "Deprem skoru etiketli kayıt" },
  { label: "Günlük risk sorgusu (senaryo)", value: "3.100", hint: "Bina risk sihirbazı oturumları" },
  { label: "Harita oturumu ortalaması", value: "18 dk", hint: "Leaflet modülü — demo analitik" },
  { label: "Acil plan tamamlama oranı", value: "%64", hint: "Aile acil planı adımlarını kilitleyen kullanıcı" },
] as const;

export function DepremTransparencyBand() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  return (
    <section className="deprem-band" aria-labelledby="deprem-band-title">
      <div className="deprem-band__inner">
        <div className="deprem-band__head">
          <ShieldCheck className="deprem-band__icon" aria-hidden />
          <div>
            <h2 id="deprem-band-title">Deprem şeffaflığı — taşınmaz kararını bilgiyle destekle</h2>
            <p>
              İhaleal modülleri tapu ve ekspertiz yerine geçmez; fakat alıcı ve satıcıyı aynı veri dilinde buluşturarak
              riskli bölgelerde sürtünmeyi azaltır. Aşağıdaki arama kutusu bina risk sihirbazına taşır.
            </p>
          </div>
        </div>

        <div className="deprem-band__stats">
          {STATS.map((s) => (
            <article key={s.label} className="deprem-band__stat">
              <TrendingUp className="deprem-band__stat-icon" aria-hidden />
              <div>
                <p className="deprem-band__stat-label">{s.label}</p>
                <p className="deprem-band__stat-value">{s.value}</p>
                <p className="deprem-band__stat-hint">{s.hint}</p>
              </div>
            </article>
          ))}
        </div>

        <form
          className="deprem-band__search"
          onSubmit={(e) => {
            e.preventDefault();
            const suffix = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
            navigate(`/modul/bina-risk-sorgu${suffix}`);
          }}
        >
          <label className="sr-only" htmlFor="deprem-band-q">
            Mahalle veya il içeren kısa not
          </label>
          <Search className="deprem-band__search-icon" aria-hidden />
          <input
            id="deprem-band-q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Örn: Kadıköy Moda, Bayraklı, Çayyolu…"
          />
          <button type="submit">Bina risk sorgusuna git</button>
        </form>

        <div className="deprem-band__links">
          <Link to="/modul/deprem-risk-haritasi" className="deprem-band__link">
            <MapPin className="h-4 w-4" aria-hidden /> Deprem risk haritası
          </Link>
          <Link to="/modul/canli-deprem-takip" className="deprem-band__link">
            <Building2 className="h-4 w-4" aria-hidden /> Canlı deprem takibi
          </Link>
          <Link to="/modul/guclendirme-rehberi" className="deprem-band__link">
            <ShieldCheck className="h-4 w-4" aria-hidden /> Güçlendirme rehberi
          </Link>
        </div>
      </div>
    </section>
  );
}
