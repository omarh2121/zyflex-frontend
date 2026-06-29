"use client";

export default function Recommendations() {
  return (
    <section className="rounded-2xl border border-[#1e2d45] bg-[#0f1520] p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl">🤖</span>
        <h2 className="text-sm font-bold text-blue-300">DAGENS ANBEFALINGER</h2>
      </div>

      <div className="rounded-xl border border-dashed border-[#1e2d45] bg-[#080c14] px-4 py-8 text-center">
        <p className="text-sm font-medium text-slate-400">Ingen anbefalinger endnu.</p>
        <p className="mt-1 text-xs text-slate-600">
          Anbefalinger genereres når der er live data fra zoner og events.
        </p>
      </div>
    </section>
  );
}
