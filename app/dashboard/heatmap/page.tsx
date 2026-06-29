"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getHeatmap, scoreColor, type HexData } from "@/lib/api";

// Leaflet loades dynamisk (SSR-safe)
import dynamic from "next/dynamic";
const HeatmapMap = dynamic(() => import("@/components/dashboard/HeatmapMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-slate-600">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-blue-700 border-t-transparent" />
    </div>
  ),
});

export default function HeatmapPage() {
  const [hexes,    setHexes]    = useState<HexData[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [city,     setCity]     = useState("Horsens");
  const [filter,   setFilter]   = useState<"all" | "hot" | "medium">("all");

  async function load(c = city) {
    setLoading(true); setError("");
    try {
      const data = await getHeatmap(c);
      setHexes(data.hexes || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Fejl ved hentning af heatmap");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = hexes.filter((h) => {
    if (filter === "hot")    return h.score >= 70;
    if (filter === "medium") return h.score >= 50 && h.score < 70;
    return true;
  });

  const hotCount    = hexes.filter((h) => h.score >= 70).length;
  const mediumCount = hexes.filter((h) => h.score >= 50 && h.score < 70).length;

  return (
    <div className="flex h-screen flex-col bg-[#080c14] text-slate-200">
      {/* Top bar */}
      <div className="flex shrink-0 items-center gap-3 border-b border-[#1e2d45] bg-[#080c14] px-5 py-3">
        <Link href="/dashboard" className="text-sm text-blue-400 hover:text-blue-300">← Kontrolrum</Link>
        <span className="text-slate-700">/</span>
        <span className="text-sm font-semibold text-white">H3 Heatmap</span>

        {/* City select */}
        <select
          value={city}
          onChange={(e) => { setCity(e.target.value); load(e.target.value); }}
          className="ml-auto rounded-lg border border-[#1e2d45] bg-[#0f1520] px-3 py-1.5 text-xs text-white outline-none focus:border-blue-600">
          {["Horsens", "Vejle", "Herning", "Ikast", "Aarhus"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Filter */}
        <div className="flex rounded-lg border border-[#1e2d45] bg-[#0f1520] p-0.5">
          {(["all", "hot", "medium"] as const).map((f) => (
            <button key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                filter === f ? "bg-blue-700 text-white" : "text-slate-500 hover:text-white"
              }`}>
              {f === "all" ? "Alle" : f === "hot" ? "🔴 Hot" : "🔵 Middel"}
            </button>
          ))}
        </div>

        <button onClick={() => load()}
          className="rounded-lg border border-[#1e2d45] px-3 py-1.5 text-xs text-slate-400 hover:text-white">
          🔄
        </button>
      </div>

      {/* Stats */}
      <div className="flex shrink-0 gap-4 border-b border-[#1e2d45] bg-[#0a0f1a] px-5 py-2">
        {[
          { label: "Totale hexes", value: hexes.length, color: "#e2e8f0" },
          { label: "🔴 Hotspots (70+)", value: hotCount, color: "#ef4444" },
          { label: "🔵 Middel (50-70)", value: mediumCount, color: "#3b82f6" },
          { label: "Vises nu", value: filtered.length, color: "#34d399" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-xs">
            <span className="font-black text-base" style={{ color: s.color }}>{s.value}</span>
            <span className="text-slate-600">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="relative flex-1">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#080c14]/80">
            <div className="text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-blue-700 border-t-transparent" />
              <div className="text-sm text-slate-500">Beregner {city} heatmap...</div>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="rounded-xl border border-red-900 bg-red-950/40 p-6 text-center">
              <div className="mb-2 text-2xl">⚠️</div>
              <div className="text-sm text-red-400">{error}</div>
              <button onClick={() => load()} className="mt-3 rounded-lg bg-red-800 px-4 py-2 text-xs text-white">
                Prøv igen
              </button>
            </div>
          </div>
        )}
        {!loading && !error && (
          <HeatmapMap hexes={filtered} city={city} />
        )}
      </div>

      {/* Legend */}
      <div className="flex shrink-0 items-center gap-4 border-t border-[#1e2d45] bg-[#080c14] px-5 py-2">
        <span className="text-xs text-slate-600">Score:</span>
        {[
          { label: "85+", color: "#ef4444" },
          { label: "70+", color: "#f59e0b" },
          { label: "50+", color: "#3b82f6" },
          { label: "<50", color: "#374151" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5 text-xs text-slate-500">
            <div className="h-3 w-3 rounded-sm" style={{ background: l.color }} />
            {l.label}
          </div>
        ))}
        <span className="ml-auto text-xs text-slate-700">H3 Resolution 8 · ~500m hexagons</span>
      </div>
    </div>
  );
}
