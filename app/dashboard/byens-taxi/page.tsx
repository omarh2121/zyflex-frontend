"use client";

import Link from "next/link";
import Recommendations from "@/components/dashboard/Recommendations";
import Hotspots from "@/components/dashboard/Hotspots";
import B2BLeads from "@/components/dashboard/B2BLeads";
import DriverInput from "@/components/dashboard/DriverInput";

export default function ByensTaxiDashboardPage() {
  const today = new Date().toLocaleDateString("da-DK", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-200">
      <header className="sticky top-0 z-40 border-b border-[#1e2d45] bg-[#080c14]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🚕</span>
            <span className="font-black text-red-500">Byens Taxi</span>
          </Link>
          <span className="text-slate-700">/</span>
          <span className="text-sm font-semibold text-white">AI Dashboard</span>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-xs text-slate-500 sm:block">{today}</span>
            <span className="text-xs text-slate-500">Horsens</span>
            <Link
              href="/dashboard/driver"
              className="rounded-lg border border-red-900/40 bg-red-600/20 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-600/30">
              📱 Chauffør
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-5">
        <div className="mb-5">
          <h1 className="text-2xl font-black text-white md:text-3xl">
            Byens Taxi AI Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Overblik over disponering, efterspørgsel, B2B-muligheder og feltinput fra chauffører.
          </p>
        </div>

        <div className="mb-5 rounded-xl border border-dashed border-[#1e2d45] bg-[#0f1520] px-4 py-6 text-center">
          <p className="text-sm font-medium text-slate-400">Ingen live KPI-data endnu.</p>
          <p className="mt-1 text-xs text-slate-600">
            Tal for biler, scores og indtjening vises først når der er rigtige data at vise.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Recommendations />
          <Hotspots />
          <B2BLeads />
          <DriverInput />
        </div>

        <p className="mt-8 text-center text-xs text-slate-700">
          Byens Taxi · Horsens
        </p>
      </main>
    </div>
  );
}
