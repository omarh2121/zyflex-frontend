"use client";
import { useEffect, useState, useCallback } from "react";
import { getRecommendation, scoreColor, type Recommendation } from "@/lib/api";

// =============================================================================
// DRIVER VIEW – Mobil-first, simpel, handlingsorienteret
// =============================================================================

export default function DriverPage() {
  const [rec,     setRec]     = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [city,    setCity]    = useState("Horsens");
  const [tick,    setTick]    = useState(0);

  const load = useCallback(async (fresh = false) => {
    setLoading(true); setError("");
    try {
      const data = await getRecommendation(city, fresh);
      setRec(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Kunne ikke hente anbefaling");
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => {
    load();
    const timer = setInterval(() => {
      load();
      setTick((t) => t + 1);
    }, 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, [load]);

  // ── Countdown til næste refresh ──
  const [countdown, setCountdown] = useState(300);
  useEffect(() => {
    const t = setInterval(() => setCountdown((c) => (c <= 1 ? 300 : c - 1)), 1000);
    return () => clearInterval(t);
  }, [tick]);

  const isGoNow = rec?.go_now ?? false;
  const score   = rec?.score ?? 0;
  const color   = scoreColor(score);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-4 transition-colors duration-500"
      style={{
        background: isGoNow
          ? "linear-gradient(135deg, #1a0000 0%, #2d0000 100%)"
          : "#080c14",
      }}>

      {/* City selector – top left */}
      <div className="fixed left-4 top-4 z-50">
        <select
          value={city}
          onChange={(e) => { setCity(e.target.value); }}
          className="rounded-xl border border-[#1e2d45] bg-[#0f1520] px-3 py-2 text-sm text-white outline-none">
          {["Horsens", "Vejle", "Herning", "Ikast", "Aarhus"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Countdown – top right */}
      <div className="fixed right-4 top-4 z-50 text-xs text-slate-700">
        Opdater om {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")}
      </div>

      {/* ── LOADING ── */}
      {loading && (
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-900 border-t-blue-500" />
          <p className="text-slate-500">Henter anbefaling...</p>
        </div>
      )}

      {/* ── ERROR ── */}
      {!loading && error && (
        <div className="w-full max-w-sm rounded-2xl border border-red-900 bg-red-950/40 p-6 text-center">
          <div className="mb-3 text-4xl">⚠️</div>
          <p className="mb-4 text-sm text-red-400">{error}</p>
          <button onClick={() => load(true)}
            className="rounded-xl bg-blue-700 px-6 py-3 font-bold text-white">
            Prøv igen
          </button>
        </div>
      )}

      {/* ── MAIN CARD ── */}
      {!loading && rec && !error && (
        <div className="w-full max-w-sm space-y-4">
          {/* GO NOW banner */}
          {isGoNow && (
            <div className="gonow-pulse rounded-2xl border-2 border-red-500 bg-red-950/60 p-4 text-center">
              <div className="text-lg font-black tracking-widest text-red-300">🚨 GO NOW</div>
              <div className="text-xs text-red-500">Score {score}/100 – kør NU</div>
            </div>
          )}

          {/* Main recommendation */}
          <div
            className="overflow-hidden rounded-3xl border-2 p-6 text-center shadow-2xl transition-all"
            style={{
              borderColor: color,
              background:  `radial-gradient(ellipse at top, ${color}12, transparent 70%), #0f1520`,
              boxShadow:   `0 0 60px ${color}20`,
            }}>
            {/* Score ring */}
            <div className="relative mx-auto mb-4 flex h-32 w-32 items-center justify-center">
              <svg className="absolute inset-0" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#1e2d45" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="54"
                  fill="none"
                  stroke={color}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(score / 100) * 339} 339`}
                  transform="rotate(-90 60 60)"
                  style={{ transition: "stroke-dasharray 1s ease" }}
                />
              </svg>
              <div className="text-center">
                <div className="text-3xl font-black leading-none" style={{ color }}>{score}</div>
                <div className="text-xs text-slate-600">/100</div>
              </div>
            </div>

            {/* Zone */}
            <div className="mb-1 text-2xl font-black leading-tight text-white">
              {rec.recommended_zone}
            </div>
            <div className="mb-4 text-sm text-slate-400">{rec.grade}</div>

            {/* Reason */}
            <div className="mb-4 rounded-xl bg-[#080c14] p-3 text-sm text-slate-300">
              {rec.reason}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Tjener",  value: `${rec.earn_dkk_per_hour}`, unit: "kr/t" },
                { label: "Vejr",    value: `${rec.weather.temp_c}°`,   unit: rec.weather.is_raining ? "Regn" : "Tørt" },
                { label: "Events",  value: `${rec.events_today.length}`, unit: "i dag" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-[#080c14] p-2 text-center">
                  <div className="text-lg font-black text-white">{s.value}</div>
                  <div className="text-[9px] text-slate-600">{s.unit}</div>
                  <div className="text-[9px] text-slate-700">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top 3 alternative zones */}
          {rec.top_zones.length > 1 && (
            <div className="rounded-2xl border border-[#1e2d45] bg-[#0f1520] p-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-600">
                Alternativer
              </div>
              <div className="space-y-2">
                {rec.top_zones.slice(1, 4).map((z) => (
                  <div key={z.zone} className="flex items-center gap-3 text-sm">
                    <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: scoreColor(z.score) }} />
                    <span className="flex-1 text-slate-300">{z.zone}</span>
                    <span className="font-bold" style={{ color: scoreColor(z.score) }}>{z.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events */}
          {rec.events_today.length > 0 && (
            <div className="rounded-2xl border border-[#1e2d45] bg-[#0f1520] p-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-600">
                Events
              </div>
              {rec.events_today.map((ev, i) => (
                <div key={i} className="mb-2 text-xs">
                  <div className="font-semibold text-white">{ev.name}</div>
                  <div className="text-blue-400">{ev.taxi_note}</div>
                </div>
              ))}
            </div>
          )}

          {/* Refresh button */}
          <button
            onClick={() => load(true)}
            className="w-full rounded-2xl border border-[#1e2d45] py-4 text-sm font-bold text-slate-400 transition active:scale-95 hover:border-blue-700 hover:text-white">
            🔄 Opdater nu
          </button>

          <p className="text-center text-xs text-slate-700">
            Auto-opdatering om {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")}
          </p>
        </div>
      )}
    </div>
  );
}
