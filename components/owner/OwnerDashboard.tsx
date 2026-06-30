"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { DriverOpenLog, ZoneFeedbackEntry } from "@/lib/odense/types";
import { clearOwnerSession, getOwnerName } from "@/lib/owner/auth";
import {
  aggregateDriverActivity,
  emptyActivity,
  formatLoginDa,
} from "@/lib/owner/activity-stats";
import {
  aggregateZoneFeedback,
  emptyZoneFeedback,
} from "@/lib/owner/zone-feedback-stats";
import { analyzeTrips, formatKr } from "@/lib/owner/taxameter-analysis";
import { parseTaxameterFile } from "@/lib/owner/taxameter-parser";
import { downloadReportExcel, downloadReportPdf } from "@/lib/owner/report-export";
import type { OwnerActivitySnapshot, TaxameterAnalysis, ZoneFeedbackSnapshot } from "@/lib/owner/types";
import { AI_REPORT_STORAGE_KEY, ANALYSIS_STORAGE_KEY } from "@/lib/owner/types";
import FleetOverview from "@/components/owner/FleetOverview";

function loadStoredAnalysis(): TaxameterAnalysis | null {
  try {
    const raw = localStorage.getItem(ANALYSIS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "source" in parsed &&
      (parsed as { source?: string }).source === "demo"
    ) {
      localStorage.removeItem(ANALYSIS_STORAGE_KEY);
      return null;
    }
    return parsed as TaxameterAnalysis;
  } catch {
    return null;
  }
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-[#1e2d45] bg-[#0f1520] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-[#1e2d45] bg-[#0f1520] px-6 py-10 text-center text-sm text-slate-500">
      {children}
    </div>
  );
}

export default function OwnerDashboard() {
  const router = useRouter();
  const [ownerName, setOwnerName] = useState("");
  const [activity, setActivity] = useState<OwnerActivitySnapshot>(emptyActivity());
  const [zoneFeedback, setZoneFeedback] = useState<ZoneFeedbackSnapshot>(emptyZoneFeedback());
  const [analysis, setAnalysis] = useState<TaxameterAnalysis | null>(null);
  const [aiReport, setAiReport] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const loadActivity = useCallback(async () => {
    try {
      const res = await fetch("/api/odense/activity");
      if (!res.ok) return;
      const data = (await res.json()) as { opens: DriverOpenLog[] };
      setActivity(data.opens?.length ? aggregateDriverActivity(data.opens) : emptyActivity());
    } catch {
      setActivity(emptyActivity());
    }
  }, []);

  const loadZoneFeedback = useCallback(async () => {
    try {
      const res = await fetch("/api/odense/zone-feedback");
      if (!res.ok) return;
      const data = (await res.json()) as { entries: ZoneFeedbackEntry[] };
      setZoneFeedback(
        data.entries?.length ? aggregateZoneFeedback(data.entries) : emptyZoneFeedback(),
      );
    } catch {
      setZoneFeedback(emptyZoneFeedback());
    }
  }, []);

  useEffect(() => {
    setOwnerName(getOwnerName() || "Ejer");
    setAnalysis(loadStoredAnalysis());
    const storedReport = localStorage.getItem(AI_REPORT_STORAGE_KEY);
    if (storedReport) setAiReport(storedReport);
    void loadActivity();
    void loadZoneFeedback();
  }, [loadActivity, loadZoneFeedback]);

  function handleLogout() {
    clearOwnerSession();
    router.push("/login");
    router.refresh();
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setUploading(true);

    try {
      const trips = await parseTaxameterFile(file);
      const result = analyzeTrips(trips, {
        source: "upload",
        fileName: file.name,
        companyName: `${ownerName || "Din vognmandsforretning"}`,
      });
      setAnalysis(result);
      localStorage.setItem(ANALYSIS_STORAGE_KEY, JSON.stringify(result));
      setAiReport("");
      localStorage.removeItem(AI_REPORT_STORAGE_KEY);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Kunne ikke læse filen.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleAiAnalysis() {
    if (!analysis) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/owner/analyze-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis }),
      });
      const data = (await res.json()) as { report?: string };
      if (data.report) {
        setAiReport(data.report);
        localStorage.setItem(AI_REPORT_STORAGE_KEY, data.report);
      }
    } catch {
      setUploadError("AI-analyse fejlede. Prøv igen.");
    } finally {
      setAiLoading(false);
    }
  }

  const hasActivity = activity.drivers.length > 0;
  const hasZoneFeedback = zoneFeedback.zones.length > 0;
  const hasAnalysis = analysis != null;

  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      <div className="pointer-events-none fixed inset-0 flex items-start justify-center">
        <div className="mt-[-100px] h-[400px] w-[600px] rounded-full bg-blue-600/5 blur-[150px]" />
      </div>

      <header className="relative border-b border-[#1e2d45] bg-[#0f1520]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚕</span>
              <span className="text-lg font-black tracking-wide text-blue-400">ZYFLEX</span>
              <span className="rounded bg-blue-600/20 px-2 py-0.5 text-xs font-semibold text-blue-300">
                Ejer
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">Velkommen, {ownerName}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-[#1e2d45] px-4 py-2 text-sm text-slate-400 transition hover:border-red-800 hover:text-red-400"
          >
            Log ud
          </button>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl space-y-8 px-4 py-8">
        <FleetOverview />

        <section>
          <h2 className="mb-4 text-lg font-bold">Chauffør-aktivitet</h2>

          {hasActivity ? (
            <>
              <div className="mb-4 grid gap-4 sm:grid-cols-3">
                <StatCard label="Chauffører logget ind" value={String(activity.totalDrivers)} />
                <StatCard
                  label="Aktive i dag"
                  value={String(activity.openedTodayCount)}
                  sub={activity.openedTodayNames.join(", ") || "Ingen endnu"}
                />
                <StatCard
                  label="Byer i brug"
                  value={[...new Set(activity.drivers.map((d) => d.city))].join(", ") || "—"}
                />
              </div>

              <div className="overflow-hidden rounded-xl border border-[#1e2d45] bg-[#0f1520]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1e2d45] text-left text-xs uppercase text-slate-500">
                      <th className="px-4 py-3">Chauffør</th>
                      <th className="px-4 py-3">Seneste login</th>
                      <th className="px-4 py-3">By</th>
                      <th className="px-4 py-3">Zone</th>
                      <th className="px-4 py-3">I dag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activity.drivers.map((d) => (
                      <tr key={d.driverId} className="border-b border-[#1e2d45]/50 last:border-0">
                        <td className="px-4 py-3 font-medium">{d.driverName}</td>
                        <td className="px-4 py-3 text-slate-400">{formatLoginDa(d.lastLogin)}</td>
                        <td className="px-4 py-3 text-slate-400">{d.city}</td>
                        <td className="px-4 py-3 text-slate-400">{d.zone}</td>
                        <td className="px-4 py-3">
                          {d.openedToday ? (
                            <span className="rounded bg-green-900/40 px-2 py-0.5 text-xs text-green-400">
                              Aktiv
                            </span>
                          ) : (
                            <span className="text-xs text-slate-600">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <EmptyState>
              <p className="font-medium text-slate-300">Ingen chauffør-aktivitet endnu.</p>
              <p className="mt-2 text-xs">
                Når chauffører logger ind og bruger appen, vises de her med seneste login og by.
              </p>
            </EmptyState>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold">Zone-feedback</h2>
          <p className="mb-4 text-sm text-slate-500">
            Chaufførernes svar på &quot;Fik du en tur her?&quot; — bruges til at lære hvilke zoner der faktisk giver ture.
          </p>

          {hasZoneFeedback ? (
            <div className="overflow-hidden rounded-xl border border-[#1e2d45] bg-[#0f1520]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1e2d45] text-left text-xs uppercase text-slate-500">
                    <th className="px-4 py-3">By</th>
                    <th className="px-4 py-3">Zone</th>
                    <th className="px-4 py-3">Ja</th>
                    <th className="px-4 py-3">Nej</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Succesrate</th>
                  </tr>
                </thead>
                <tbody>
                  {zoneFeedback.zones.map((z) => (
                    <tr
                      key={`${z.city}-${z.zoneId}`}
                      className="border-b border-[#1e2d45]/50 last:border-0"
                    >
                      <td className="px-4 py-3 text-slate-400">{z.city}</td>
                      <td className="px-4 py-3 font-medium">{z.zoneName}</td>
                      <td className="px-4 py-3 text-green-400">{z.yesCount}</td>
                      <td className="px-4 py-3 text-slate-400">{z.noCount}</td>
                      <td className="px-4 py-3 text-slate-300">{z.total}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            z.successRate >= 50
                              ? "text-green-400"
                              : z.successRate > 0
                                ? "text-amber-400"
                                : "text-slate-500"
                          }>
                          {z.successRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="border-t border-[#1e2d45] px-4 py-2 text-xs text-slate-600">
                {zoneFeedback.totalResponses} svar i alt
              </p>
            </div>
          ) : (
            <EmptyState>
              <p className="font-medium text-slate-300">Ingen feedback endnu.</p>
              <p className="mt-2 text-xs">
                Når chauffører trykker Ja eller Nej ved en zone, vises det her med succesrate pr. zone.
              </p>
            </EmptyState>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold">Taxameter-analyse</h2>

          <div className="mb-4 flex flex-wrap items-center gap-3">
            <label className="cursor-pointer rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold transition hover:bg-blue-500">
              {uploading ? "Analyserer…" : "Upload taxameter-data"}
              <input
                type="file"
                accept=".csv,.xlsx,.xls,.pdf"
                className="hidden"
                disabled={uploading}
                onChange={handleFileUpload}
              />
            </label>
            <span className="text-xs text-slate-500">CSV · Excel · PDF</span>
          </div>

          {!hasAnalysis && (
            <EmptyState>
              <p className="font-medium text-slate-300">
                Upload din taxameter-fil (CSV/Excel/PDF) for at se din analyse.
              </p>
              <p className="mt-2 text-xs">
                Omsætning, ture, bedste dage og zoner beregnes ud fra din fil — ikke demo-tal.
              </p>
            </EmptyState>
          )}

          {uploadError && (
            <div className="mt-4 rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
              {uploadError}
            </div>
          )}

          {hasAnalysis && analysis && (
            <>
              <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <StatCard label="Samlet omsætning" value={formatKr(analysis.totalRevenue)} />
                <StatCard label="Antal ture" value={String(analysis.tripCount)} />
                <StatCard label="Gns. pris pr. tur" value={formatKr(analysis.avgTripPrice)} />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {analysis.bestDays.length > 0 && (
                  <div className="rounded-xl border border-[#1e2d45] bg-[#0f1520] p-4">
                    <h3 className="mb-3 font-semibold text-blue-300">Bedste dage</h3>
                    <ul className="space-y-2 text-sm">
                      {analysis.bestDays.map((d) => (
                        <li key={d.label} className="flex justify-between text-slate-300">
                          <span>{d.label}</span>
                          <span className="text-slate-500">
                            {formatKr(d.revenue)} · {d.trips} ture
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.bestTimes.length > 0 && (
                  <div className="rounded-xl border border-[#1e2d45] bg-[#0f1520] p-4">
                    <h3 className="mb-3 font-semibold text-blue-300">Bedste tidspunkter</h3>
                    <ul className="space-y-2 text-sm">
                      {analysis.bestTimes.map((t) => (
                        <li key={t.label} className="flex justify-between text-slate-300">
                          <span>Kl. {t.label}</span>
                          <span className="text-slate-500">
                            {formatKr(t.revenue)} · {t.trips} ture
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.topZones.length > 0 && (
                  <div className="rounded-xl border border-[#1e2d45] bg-[#0f1520] p-4">
                    <h3 className="mb-3 font-semibold text-blue-300">Mest aktive zoner</h3>
                    <ul className="space-y-2 text-sm">
                      {analysis.topZones.map((z) => (
                        <li key={z.label} className="flex justify-between text-slate-300">
                          <span>{z.label}</span>
                          <span className="text-slate-500">
                            {formatKr(z.revenue)} · {z.trips} ture
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.driverPerformance.length > 0 && (
                  <div className="rounded-xl border border-[#1e2d45] bg-[#0f1520] p-4">
                    <h3 className="mb-3 font-semibold text-blue-300">Chauffør-performance</h3>
                    <ul className="space-y-2 text-sm">
                      {analysis.driverPerformance.map((d) => (
                        <li key={d.name} className="flex justify-between text-slate-300">
                          <span>{d.name}</span>
                          <span className="text-slate-500">
                            {d.trips} ture · {formatKr(d.revenue)} · gns. {formatKr(d.avgPrice)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {analysis.repeatAddresses.length > 0 && (
                <div className="mt-4 rounded-xl border border-[#1e2d45] bg-[#0f1520] p-4">
                  <h3 className="mb-3 font-semibold text-blue-300">Gentagne adresser / faste kunder</h3>
                  <ul className="space-y-2 text-sm">
                    {analysis.repeatAddresses.map((a) => (
                      <li key={a.address} className="flex justify-between text-slate-300">
                        <span>{a.address}</span>
                        <span className="text-slate-500">
                          {a.count}× · {formatKr(a.totalRevenue)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.earningsTips.length > 0 && (
                <div className="mt-4 rounded-xl border border-[#1e2d45] bg-[#0f1520] p-4">
                  <h3 className="mb-3 font-semibold text-blue-300">Forslag til mere indtjening</h3>
                  <ul className="list-inside list-disc space-y-1 text-sm text-slate-400">
                    {analysis.earningsTips.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleAiAnalysis}
                  disabled={aiLoading}
                  className="rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold transition hover:bg-purple-500 disabled:opacity-60"
                >
                  {aiLoading ? "Analyserer med AI…" : "Analyser med AI"}
                </button>
                <button
                  type="button"
                  onClick={() => downloadReportPdf(analysis, aiReport || undefined)}
                  className="rounded-xl border border-[#1e2d45] px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-blue-600 hover:text-white"
                >
                  Download rapport som PDF
                </button>
                <button
                  type="button"
                  onClick={() => downloadReportExcel(analysis, aiReport || undefined)}
                  className="rounded-xl border border-[#1e2d45] px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-blue-600 hover:text-white"
                >
                  Download rapport som Excel
                </button>
              </div>

              {aiReport && (
                <div className="mt-4 rounded-xl border border-purple-900/50 bg-[#0f1520] p-6">
                  <h3 className="mb-4 text-lg font-bold text-purple-300">
                    Taxameter-analyse for {analysis.companyName}
                  </h3>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                    {aiReport}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
