export type OpenMeteoClimate = {
  source: string;
  lat: number;
  lon: number;
  annualTempMeanC: number;
  annualPrecipMm: number;
  maxWindSpeedMs: number;
  monthlyTempC: number[];
  monthlyPrecipMm: number[];
};

export async function fetchOpenMeteoClimate(lat: number, lon: number): Promise<OpenMeteoClimate | null> {
  const end = new Date();
  const start = new Date();
  start.setFullYear(end.getFullYear() - 1);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const url = new URL("https://archive-api.open-meteo.com/v1/archive");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("start_date", fmt(start));
  url.searchParams.set("end_date", fmt(end));
  url.searchParams.set("daily", "temperature_2m_mean,precipitation_sum,wind_speed_10m_max");
  url.searchParams.set("timezone", "auto");

  try {
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const json = await res.json();
    const daily = json?.daily;
    if (!daily?.temperature_2m_mean?.length) return null;

    const temps: number[] = daily.temperature_2m_mean.filter((v: number | null) => v != null);
    const precip: number[] = (daily.precipitation_sum ?? []).map((v: number | null) => v ?? 0);
    const wind: number[] = (daily.wind_speed_10m_max ?? []).filter((v: number | null) => v != null);

    const monthlyTempC = Array(12).fill(0);
    const monthlyPrecipMm = Array(12).fill(0);
    const counts = Array(12).fill(0);

    const times: string[] = daily.time ?? [];
    for (let i = 0; i < times.length; i++) {
      const m = new Date(times[i]).getMonth();
      if (daily.temperature_2m_mean[i] != null) {
        monthlyTempC[m] += daily.temperature_2m_mean[i];
        counts[m] += 1;
      }
      monthlyPrecipMm[m] += precip[i] ?? 0;
    }
    for (let m = 0; m < 12; m++) {
      if (counts[m] > 0) monthlyTempC[m] /= counts[m];
    }

    return {
      source: "Open-Meteo Archive API",
      lat,
      lon,
      annualTempMeanC: temps.reduce((a, b) => a + b, 0) / Math.max(1, temps.length),
      annualPrecipMm: precip.reduce((a, b) => a + b, 0),
      maxWindSpeedMs: wind.length ? Math.max(...wind) : 0,
      monthlyTempC,
      monthlyPrecipMm,
    };
  } catch {
    return null;
  }
}
