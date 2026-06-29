"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { DriverOpenLog } from "@/lib/odense/types";
import { clearOwnerSession, getOwnerName } from "@/lib/owner/auth";
import {
  aggregateDriverActivity,
  formatLoginDa,
  getDemoActivity,
} from "@/lib/owner/activity-stats";
import { getDemoAnalysis, analyzeTrips, formatKr } from "@/lib/owner/taxameter-analysis";
import { parseTaxameterFile } from "@/lib/owner/taxameter-parser";
import { downloadReportExcel, downloadReportPdf } from "@/lib/owner/report-export";
import type { OwnerActivitySnapshot, TaxameterAnalysis } from "@/lib/owner/types";
import { AI_REPORT_STORAGE_KEY, ANALYSIS_STORAGE_KEY } from "@/lib/owner/types";
import FleetOverview from "@/components/owner/FleetOverview";

function loadStoredAnalysis(): TaxameterAnalysis | null {
  try {
    const raw = localStorage.getItem(ANALYSIS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TaxameterAnalysis) : null;
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

export default function OwnerDashboard() {
  const router = useRouter();
  const [ownerName, setOwnerName] = useState("");
  const [activity, setActivity] = useState<OwnerActivitySnapshot>(getDemoActivity());
  const [analysis, setAnalysis] = useState<TaxameterAnalysis>(() => getDemoAnalysis());
  const [aiReport, setAiReport] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [usingDemo, setUsingDemo] = useState(true);

  const loadActivity = useCallback(async () => {
    try {
      const res = await fetch("/api/odense/activity");
      if (!res.ok) return;
      const data = (await res.json()) as { opens: DriverOpenLog[] };
      if (data.opens?.length > 0) {
        setActivity(aggregateDriverActivity(data.opens));
      }
    } catch {
      // Behold demo-aktivitet
    }
  }, []);

  useEffect(() => {
    setOwnerName(getOwnerName() || "Ejer");
    const stored = loadStoredAnalysis();
    if (stored) {
      setAnalysis(stored);
      setUsingDemo(stored.source === "demo");
    }
    const storedReport = localStorage.getItem(AI_REPORT_STORAGE_KEY);
    if (storedReport) setAiReport(storedReport);
    void loadActivity();
  }, [loadActivity]);

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
        companyName: `${ownerName || "Zyflex ApS"} · Horsens`,
      });
      setAnalysis(result);
      setUsingDemo(false);
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

        {/* Chauffør-aktivitet */}
        <section>
          <h2 className="mb-4 text-lg font-bold">Chauffør-aktivitet</h2>
          <div className="mb-4 grid gap-4 sm:grid-cols-3">
            <StatCard label="Chauffører logget ind" value={String(activity.totalDrivers)} />
            <StatCard
              label="Aktive i dag"
              value={String(activity.openedTodayCount)}
              sub={activity.openedTodayNames.join(", ") || "Ingen endnu"}
            />
            <StatCard label="Byer i brug" value={[...new Set(activity.drivers.map((d) => d.city))].join(", ") || "—"} />
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
                        <span className="rounded bg-green-900/40 px-2 py-0.5 text-xs text-green-400">Aktiv</span>
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Taxameter upload */}
        <section>
          <h2 className="mb-4 text-lg font-bold">Taxameter-analyse</h2>
          {usingDemo && (
            <p className="mb-3 text-sm text-amber-400/80">
              Viser demo-data fra Horsens — upload din egen fil for rigtig analyse.
            </p>
          )}

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

          {uploadError && (
            <div className="mb-4 rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
              {uploadError}
            </div>
          )}

          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <StatCard label="Samlet omsætning" value={formatKr(analysis.totalRevenue)} />
            <StatCard label="Antal ture" value={String(analysis.tripCount)} />
            <StatCard label="Gns. pris pr. tur" value={formatKr(analysis.avgTripPrice)} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
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

          <div className="mt-4 rounded-xl border border-[#1e2d45] bg-[#0f1520] p-4">
            <h3 className="mb-3 font-semibold text-blue-300">Forslag til mere indtjening</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-slate-400">
              {analysis.earningsTips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* AI + eksport */}
        <section>
          <div className="mb-4 flex flex-wrap gap-3">
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
            <div className="rounded-xl border border-purple-900/50 bg-[#0f1520] p-6">
              <h3 className="mb-4 text-lg font-bold text-purple-300">
                Taxameter-analyse for {analysis.companyName}
              </h3>
              <div className="prose prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                {aiReport}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
