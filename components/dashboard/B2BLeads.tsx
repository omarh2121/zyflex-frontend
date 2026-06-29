"use client";

import {
  MOCK_B2B_LEADS,
  leadStatusColor,
  leadStatusLabel,
  scoreColor,
} from "@/lib/mock/byens-taxi";

export default function B2BLeads() {
  const totalPotential = MOCK_B2B_LEADS.reduce((sum, l) => sum + l.monthlyPotentialDkk, 0);
  const hotLeads = MOCK_B2B_LEADS.filter((l) => l.score >= 75).length;

  return (
    <section className="rounded-2xl border border-[#1e2d45] bg-[#0f1520] p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl">🏢</span>
        <h2 className="text-sm font-bold text-amber-300">B2B LEADS</h2>
        <span className="ml-auto text-xs text-slate-600">{MOCK_B2B_LEADS.length} leads</span>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-[#1e2d45] bg-[#080c14] p-3 text-center">
          <div className="text-lg font-black text-green-400">
            {totalPotential.toLocaleString("da-DK")} kr
          </div>
          <div className="text-[10px] text-slate-600">Månedligt potentiale</div>
        </div>
        <div className="rounded-lg border border-[#1e2d45] bg-[#080c14] p-3 text-center">
          <div className="text-lg font-black text-amber-400">{hotLeads}</div>
          <div className="text-[10px] text-slate-600">Hot leads (75+)</div>
        </div>
      </div>

      <div className="space-y-2">
        {MOCK_B2B_LEADS.map((lead) => (
          <div
            key={lead.id}
            className="rounded-xl border border-[#1e2d45] bg-[#080c14] p-4 transition hover:border-amber-900/50">
            <div className="mb-2 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white">{lead.company}</div>
                <div className="text-xs text-slate-500">{lead.type} · {lead.contact}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black" style={{ color: scoreColor(lead.score) }}>
                  {lead.score}
                </div>
                <div
                  className="text-[10px] font-semibold"
                  style={{ color: leadStatusColor(lead.status) }}>
                  {leadStatusLabel(lead.status)}
                </div>
              </div>
            </div>
            <p className="mb-2 text-xs text-slate-400">{lead.note}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="text-green-400">
                {lead.monthlyPotentialDkk.toLocaleString("da-DK")} kr/md
              </span>
              <span className="text-slate-600">{lead.phone}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
