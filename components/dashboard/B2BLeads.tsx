"use client";

export default function B2BLeads() {
  return (
    <section className="rounded-2xl border border-[#1e2d45] bg-[#0f1520] p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl">🏢</span>
        <h2 className="text-sm font-bold text-amber-300">B2B LEADS</h2>
      </div>

      <div className="rounded-xl border border-dashed border-[#1e2d45] bg-[#080c14] px-4 py-8 text-center">
        <p className="text-sm font-medium text-slate-400">Ingen B2B-leads endnu.</p>
        <p className="mt-1 text-xs text-slate-600">
          Leads genereres ud fra virkelige data — ikke opdigtede eksempler.
        </p>
      </div>
    </section>
  );
}
