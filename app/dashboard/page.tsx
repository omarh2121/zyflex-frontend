"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  getRecommendation, getHotspots, getEventSources, getSystemOverview,
  scoreColor, scoreBg,
  type Recommendation, type HotspotsResponse, type EventSourcesResponse, type SystemOverview,
} from "@/lib/api";

// ── SMALL COMPONENTS ─────────────────────────────────────────────────────────

function StatCard({ label, value, color, sub }: { label: string; value: string; color?: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-[#1e2d45] bg-[#0f1520] px-4 py-3">
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">{label}</div>
      <div className="text-2xl font-black" style={{ color: color || "#e2e8f0" }}>{value}</div>
      {sub && <div className="mt-0.5 text-[10px] text-slate-600">{sub}</div>}
    </div>
  );
}

function LoadingCard({ h = "h-32" }: { h?: string }) {
  return (
    <div className={`${h} animate-pulse rounded-xl border border-[#1e2d45] bg-[#0f1520]`} />
  );
}

function ErrorCard({ msg }: { msg: string }) {
  return (
    <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-4 text-sm text-red-400">
      ⚠️ {msg}
    </div>
  );
}

// ── SCORE BAR ─────────────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  const color = scoreColor(score);
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-slate-500">Efterspørgsel</span>
        <span className="font-black" style={{ color }}>{score}/100</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#1e2d45]">
        <div
          className="score-bar-fill h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: `linear-gradient(90deg, #dc2626, ${color})` }}
        />
      </div>
    </div>
  );
}

// ── GO NOW BANNER ─────────────────────────────────────────────────────────────

function GoNowBanner({ rec }: { rec: Recommendation }) {
  if (!rec.go_now) return null;
  return (
    <div className="gonow-pulse mb-4 overflow-hidden rounded-2xl border-2 border-red-500 bg-gradient-to-r from-red-950 to-red-900 p-5 shadow-2xl shadow-red-900/40">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <div className="mb-1 text-xs font-bold uppercase tracking-widest text-red-300">🚨 GO NOW – Score {rec.score}/100</div>
          <div className="text-2xl font-black text-white">{rec.recommended_zone}</div>
          <div className="mt-1 text-sm text-red-300">{rec.reason}</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-3xl font-black text-white">{rec.earn_dkk_per_hour} kr/t</div>
          <div className="text-xs text-red-400">estimeret</div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// OWNER DASHBOARD
// =============================================================================

export default function DashboardPage() {
  const [rec,      setRec]      = useState<Recommendation | null>(null);
  const [hotspots, setHotspots] = useState<HotspotsResponse | null>(null);
  const [sources,  setSources]  = useState<EventSourcesResponse | null>(null);
  const [overview, setOverview] = useState<SystemOverview | null>(null);

  const [recErr,  setRecErr]  = useState("");
  const [hotErr,  setHotErr]  = useState("");
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const city = "Horsens";

  const load = useCallback(async (fresh = false) => {
    setLoading(true);
    setRecErr(""); setHotErr("");

    await Promise.allSettled([
      getRecommendation(city, fresh)
        .then(setRec)
        .catch((e) => setRecErr(e.message)),
      getHotspots(city)
        .then(setHotspots)
        .catch((e) => setHotErr(e.message)),
      getEventSources()
        .then(setSources)
        .catch(() => {}),
      getSystemOverview()
        .then(setOverview)
        .catch(() => {}),
    ]);

    setLastRefresh(new Date());
    setLoading(false);
  }, [city]);

  useEffect(() => {
    load();
    const timer = setInterval(() => load(), 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, [load]);

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-200">
      {/* ── TOP BAR ── */}
      <div className="sticky top-0 z-40 border-b border-[#1e2d45] bg-[#080c14]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🚕</span>
            <span className="font-black text-red-500">Byens Taxi</span>
          </Link>
          <span className="text-slate-700">/</span>
          <span className="text-sm font-semibold text-white">Kontrolrum</span>
          <div className="ml-auto flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-green-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
              Live · {city}
            </span>
            {lastRefresh && (
              <span className="hidden text-xs text-slate-600 sm:block">
                Opdateret {lastRefresh.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <button
              onClick={() => load(true)}
              className="rounded-lg border border-[#1e2d45] px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-red-700 hover:text-white">
              🔄 Opdater
            </button>
            <Link href="/dashboard/driver"
              className="rounded-lg bg-red-600/20 border border-red-900/40 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-600/30">
              📱 Chauffør
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-5">
        {/* ── GO NOW ── */}
        {rec && <GoNowBanner rec={rec} />}

        {/* ── STATS ROW ── */}
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {loading ? (
            [1,2,3,4].map(i => <LoadingCard key={i} h="h-20" />)
          ) : rec ? (
            <>
              <StatCard label="Top Zone"     value={rec.recommended_zone.split(" ").slice(0,2).join(" ")} color="#ef4444" />
              <StatCard label="Score"        value={`${rec.score}/100`} color={scoreColor(rec.score)} />
              <StatCard label="Est. kr/time" value={`${rec.earn_dkk_per_hour}`} color="#34d399" sub="DKK estimeret" />
              <StatCard label="Vejr"         value={`${rec.weather.temp_c}°C`} color="#f59e0b"
                sub={rec.weather.is_raining ? "Regn 🌧️" : "Tørt ☀️"} />
            </>
          ) : null}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* ── LEFT COLUMN: AI REC + HOTSPOTS ── */}
          <div className="space-y-4 lg:col-span-2">
            {/* AI Recommendation */}
            <div className="rounded-2xl border border-[#1e3a5f] bg-[#0f1520] p-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="text-xl">🤖</span>
                <span className="text-sm font-bold text-red-300">AI ANBEFALING – LANGGRAPH</span>
                {rec?.cached && (
                  <span className="ml-auto rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-500">cache</span>
                )}
              </div>

              {loading && <LoadingCard h="h-28" />}
              {!loading && recErr && <ErrorCard msg={recErr} />}
              {!loading && rec && !recErr && (
                <>
                  <div className="mb-3 text-2xl font-black text-white">{rec.recommended_zone}</div>
                  <ScoreBar score={rec.score} />
                  <p className="mt-3 text-sm text-slate-400">{rec.reason}</p>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {[
                      { k: "Karakter", v: rec.grade.replace(/^[\p{Emoji}\s]*/u, "").trim() },
                      { k: "Tjener",   v: `${rec.earn_dkk_per_hour} kr/t` },
                      { k: "Events",   v: `${rec.events_today.length} i dag` },
                    ].map((i) => (
                      <div key={i.k} className="rounded-lg border border-[#1e2d45] bg-[#080c14] p-2 text-center">
                        <div className="text-sm font-bold text-white">{i.v}</div>
                        <div className="text-[10px] text-slate-600">{i.k}</div>
                      </div>
                    ))}
                  </div>

                  {/* Events today */}
                  {rec.events_today.length > 0 && (
                    <div className="mt-4">
                      <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">Events i dag</div>
                      <div className="space-y-2">
                        {rec.events_today.map((ev, i) => (
                          <div key={i} className="flex items-start gap-2 rounded-lg border border-[#1e2d45] bg-[#080c14] p-3 text-xs">
                            <span className="text-base">🎵</span>
                            <div>
                              <div className="font-semibold text-white">{ev.name}</div>
                              <div className="text-slate-500">{ev.venue} · {ev.time}</div>
                              <div className="mt-0.5 text-red-400">{ev.taxi_note}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Top Zones */}
            <div className="rounded-2xl border border-[#1e2d45] bg-[#0f1520] p-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="text-xl">📍</span>
                <span className="text-sm font-bold text-slate-300">TOP ZONER</span>
                {hotspots && (
                  <span className="ml-auto text-xs text-slate-600">{hotspots.hotspots.length} zoner</span>
                )}
              </div>

              {loading && <LoadingCard h="h-40" />}
              {!loading && hotErr && <ErrorCard msg={hotErr} />}
              {!loading && hotspots && !hotErr && (
                <div className="space-y-2">
                  {hotspots.hotspots.map((z) => (
                    <div key={z.zone}
                      className="flex items-center gap-3 rounded-xl border border-[#1e2d45] p-3 transition hover:border-red-900"
                      style={{ background: scoreBg(z.score) }}>
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black"
                        style={{ background: `${scoreColor(z.score)}20`, color: scoreColor(z.score) }}>
                        #{z.rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-sm font-semibold text-white">{z.zone}</div>
                        <div className="truncate text-xs text-slate-500">{z.reason || z.grade}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black" style={{ color: scoreColor(z.score) }}>{z.score}</div>
                        <div className="text-[10px] text-slate-600">{z.earn_dkk_per_hour} kr/t</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-4">
            {/* Weather */}
            {rec && (
              <div className="rounded-2xl border border-[#1e2d45] bg-[#0f1520] p-5">
                <div className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">Vejr</div>
                <div className="mb-2 text-3xl font-black text-white">{rec.weather.temp_c}°C</div>
                <p className="mb-4 text-sm text-slate-400">{rec.weather.summary}</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { k: "Nedbør",  v: `${rec.weather.precip_mm} mm/t` },
                    { k: "Vind",    v: `${rec.weather.wind_kmh} km/t` },
                    { k: "Regn",    v: rec.weather.is_raining ? "Ja 🌧️" : "Nej ☀️" },
                    { k: "Bonus",   v: rec.weather.is_raining ? "+15pt" : "0pt" },
                  ].map((w) => (
                    <div key={w.k} className="rounded-lg border border-[#1e2d45] bg-[#080c14] p-2 text-center">
                      <div className="text-xs font-bold text-white">{w.v}</div>
                      <div className="text-[10px] text-slate-600">{w.k}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Event Sources */}
            <div className="rounded-2xl border border-[#1a2d1a] bg-[#0f1520] p-5">
              <div className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                📡 Event-kilder
              </div>
              {sources ? (
                <div className="space-y-2">
                  {sources.sources.map((s) => {
                    const ok     = s.status === "ok";
                    const noKey  = s.status === "no_key";
                    const dotClr = ok ? "#34d399" : noKey ? "#f59e0b" : "#f87171";
                    return (
                      <div key={s.name} className="flex items-center gap-2 text-sm">
                        <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: dotClr }} />
                        <span className="flex-1 text-slate-300">{s.name}</span>
                        <span className="text-xs" style={{ color: dotClr }}>
                          {ok ? `${s.event_count} events` : noKey ? "ingen nøgle" : s.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs text-slate-600">Indlæser...</div>
              )}
            </div>

            {/* Pipeline / System */}
            {overview && (
              <div className="rounded-2xl border border-[#1e2d45] bg-[#0f1520] p-5">
                <div className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                  ⚙️ Pipeline Status
                </div>
                <div className="space-y-1.5 text-xs">
                  {[
                    { k: "Version",   v: overview.version,                  c: "#ef4444" },
                    { k: "Status",    v: overview.status,                    c: "#34d399" },
                    { k: "Cache",     v: `${overview.cache.entries} entries`, c: "#e2e8f0" },
                    { k: "Logs",      v: `${overview.logging.recommendations_logged} anbefalinger`, c: "#e2e8f0" },
                    { k: "Billetto",  v: overview.event_sources.billetto_active ? "aktiv" : "ingen nøgle", c: overview.event_sources.billetto_active ? "#34d399" : "#f59e0b" },
                  ].map((r) => (
                    <div key={r.k} className="flex justify-between">
                      <span className="text-slate-600">{r.k}</span>
                      <span style={{ color: r.c }}>{r.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick links */}
            <div className="grid grid-cols-2 gap-2">
              <Link href="/dashboard/heatmap"
                className="rounded-xl border border-[#1e2d45] bg-[#0f1520] p-3 text-center text-xs font-semibold text-slate-300 transition hover:border-red-700 hover:text-white">
                🗺️ Heatmap
              </Link>
              <Link href="/dashboard/driver"
                className="rounded-xl border border-[#1e2d45] bg-[#0f1520] p-3 text-center text-xs font-semibold text-slate-300 transition hover:border-red-700 hover:text-white">
                📱 Driver View
              </Link>
            </div>
          </div>
        </div>

        {/* ── PIPELINE ERRORS ── */}
        {rec?.pipeline_errors && rec.pipeline_errors.length > 0 && (
          <div className="mt-4 rounded-xl border border-yellow-900/40 bg-yellow-950/20 p-4">
            <div className="mb-2 text-xs font-bold text-yellow-400">Pipeline advarsler</div>
            {rec.pipeline_errors.map((e, i) => (
              <div key={i} className="text-xs text-yellow-700">{e}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
