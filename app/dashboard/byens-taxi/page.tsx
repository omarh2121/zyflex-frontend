"use client";

import Link from "next/link";
import { MOCK_KPIS } from "@/lib/mock/byens-taxi";
import Recommendations from "@/components/dashboard/Recommendations";
import Hotspots from "@/components/dashboard/Hotspots";
import B2BLeads from "@/components/dashboard/B2BLeads";
import DriverInput from "@/components/dashboard/DriverInput";

function StatCard({
  label,
  value,
  color,
  sub,
}: {
  label: string;
  value: string;
  color?: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-[#1e2d45] bg-[#0f1520] px-4 py-3">
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
        {label}
      </div>
      <div className="text-2xl font-black" style={{ color: color || "#e2e8f0" }}>
        {value}
      </div>
      {sub && <div className="mt-0.5 text-[10px] text-slate-600">{sub}</div>}
    </div>
  );
}

export default function ByensTaxiDashboardPage() {
  const kpis = MOCK_KPIS;
  const today = new Date().toLocaleDateString("da-DK", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-200">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-[#1e2d45] bg-[#080c14]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🚕</span>
            <span className="font-black text-blue-400">BYENS TAXI</span>
          </Link>
          <span className="text-slate-700">/</span>
          <span className="text-sm font-semibold text-white">AI Dashboard</span>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-xs text-slate-500 sm:block">{today}</span>
            <span className="flex items-center gap-1.5 text-xs text-green-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
              Horsens · Demo
            </span>
            <Link
              href="/dashboard/driver"
              className="rounded-lg border border-blue-900/40 bg-blue-600/20 px-3 py-1.5 text-xs font-semibold text-blue-400 transition hover:bg-blue-600/30">
              📱 Chauffør
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-5">
        {/* Intro */}
        <div className="mb-5">
          <h1 className="text-2xl font-black text-white md:text-3xl">
            Byens Taxi AI Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Overblik over disponering, efterspørgsel, B2B-muligheder og feltinput fra chauffører.
          </p>
        </div>

        {/* KPI row */}
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Aktive biler" value={`${kpis.activeCars}`} color="#60a5fa" />
          <StatCard label="Top score" value={`${kpis.topScore}/100`} color="#f59e0b" />
          <StatCard
            label="Est. kr/time"
            value={`${kpis.avgEarnPerHour}`}
            color="#34d399"
            sub="Gennemsnit top-zoner"
          />
          <StatCard
            label="Events i dag"
            value={`${kpis.eventsToday}`}
            color="#a78bfa"
            sub={`${kpis.tempC}°C · ${kpis.weatherSummary.split("–")[0].trim()}`}
          />
        </div>

        {/* Main grid */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Recommendations />
          <Hotspots />
          <B2BLeads />
          <DriverInput />
        </div>

        {/* Footer note */}
        <p className="mt-8 text-center text-xs text-slate-700">
          MVP-demo med mock-data · Powered by Zyflex AI · Byens Taxi Horsens
        </p>
      </main>
    </div>
  );
}
