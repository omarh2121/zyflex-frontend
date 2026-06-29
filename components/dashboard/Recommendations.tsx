"use client";

import {
  MOCK_RECOMMENDATIONS,
  MOCK_EVENTS,
  scoreColor,
  type Recommendation,
} from "@/lib/mock/byens-taxi";

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
          style={{
            width: `${score}%`,
            background: `linear-gradient(90deg, #3b82f6, ${color})`,
          }}
        />
      </div>
    </div>
  );
}

function RecommendationCard({ rec, featured }: { rec: Recommendation; featured?: boolean }) {
  const color = scoreColor(rec.score);
  return (
    <div
      className={`rounded-xl border p-4 transition ${
        featured ? "border-blue-900/50 bg-blue-950/20" : "border-[#1e2d45] bg-[#080c14]"
      }`}>
      <div className="mb-2 flex items-center gap-2">
        {featured && <span className="text-lg">🤖</span>}
        <span className="text-sm font-bold text-white">{rec.zone}</span>
        {rec.goNow && (
          <span className="ml-auto rounded-full bg-red-900/40 px-2 py-0.5 text-[10px] font-bold text-red-400">
            GO NOW
          </span>
        )}
        {!featured && (
          <span
            className="ml-auto text-sm font-black"
            style={{ color }}>
            {rec.score}
          </span>
        )}
      </div>
      {featured && (
        <>
          <ScoreBar score={rec.score} />
          <p className="mt-3 text-sm text-slate-400">{rec.reason}</p>
          <div className="mt-3 flex gap-4 text-xs">
            <span className="text-green-400">{rec.earnDkkPerHour} kr/t estimeret</span>
            <span className="text-slate-600 capitalize">{rec.priority} prioritet</span>
          </div>
        </>
      )}
      {!featured && (
        <>
          <p className="mb-2 text-xs text-slate-500">{rec.reason}</p>
          <div className="text-xs text-green-400">{rec.earnDkkPerHour} kr/t</div>
        </>
      )}
    </div>
  );
}

export default function Recommendations() {
  const [primary, ...rest] = MOCK_RECOMMENDATIONS;

  return (
    <section className="rounded-2xl border border-[#1e2d45] bg-[#0f1520] p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl">🤖</span>
        <h2 className="text-sm font-bold text-blue-300">DAGENS ANBEFALINGER</h2>
        <span className="ml-auto rounded-full bg-green-900/30 px-2 py-0.5 text-[10px] font-semibold text-green-400">
          AI · Mock
        </span>
      </div>

      {primary && <RecommendationCard rec={primary} featured />}

      <div className="mt-4 space-y-2">
        <div className="text-xs font-semibold uppercase tracking-widest text-slate-600">
          Yderligere anbefalinger
        </div>
        {rest.map((rec) => (
          <RecommendationCard key={rec.id} rec={rec} />
        ))}
      </div>

      <div className="mt-5 border-t border-[#1e2d45] pt-4">
        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Events i dag
        </div>
        <div className="space-y-2">
          {MOCK_EVENTS.map((ev) => (
            <div
              key={ev.name}
              className="flex items-start gap-2 rounded-lg border border-[#1e2d45] bg-[#080c14] p-3 text-xs">
              <span className="text-base">🎵</span>
              <div>
                <div className="font-semibold text-white">{ev.name}</div>
                <div className="text-slate-500">{ev.venue} · {ev.time}</div>
                <div className="mt-0.5 text-blue-400">{ev.taxiNote}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
