"use client";

import { MOCK_HOTSPOTS, scoreBg, scoreColor } from "@/lib/mock/byens-taxi";

export default function Hotspots() {
  return (
    <section className="rounded-2xl border border-[#1e2d45] bg-[#0f1520] p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl">📍</span>
        <h2 className="text-sm font-bold text-slate-300">HOTSPOTS I HORSENS</h2>
        <span className="ml-auto text-xs text-slate-600">{MOCK_HOTSPOTS.length} zoner</span>
      </div>

      <div className="space-y-2">
        {MOCK_HOTSPOTS.map((z) => (
          <div
            key={z.zone}
            className="flex items-center gap-3 rounded-xl border border-[#1e2d45] p-3 transition hover:border-blue-900"
            style={{ background: scoreBg(z.score) }}>
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black"
              style={{
                background: `${scoreColor(z.score)}20`,
                color: scoreColor(z.score),
              }}>
              #{z.rank}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-white">{z.zone}</div>
              <div className="truncate text-xs text-slate-500">{z.reason}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-black" style={{ color: scoreColor(z.score) }}>
                {z.score}
              </div>
              <div className="text-[10px] text-slate-600">{z.earnDkkPerHour} kr/t</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-[#1e2d45] bg-[#080c14] p-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-600">
          Zone-kæde (anbefalet rækkefølge)
        </div>
        <div className="flex flex-wrap items-center gap-1 text-xs text-slate-400">
          {MOCK_HOTSPOTS.map((z, i) => (
            <span key={z.zone} className="flex items-center gap-1">
              {i > 0 && <span className="text-slate-700">→</span>}
              <span className="rounded-md bg-[#1e2d45] px-2 py-0.5 text-slate-300">{z.zone}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
