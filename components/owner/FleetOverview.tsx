"use client";

import { useEffect, useState } from "react";
import FleetMap from "@/components/owner/FleetMap";
import {
  countByStatus,
  fleetListLine,
  FLEET_STATUS,
  formatFleetActivity,
  loadFleetVehicles,
} from "@/lib/owner/fleet";
import type { FleetVehicle } from "@/lib/owner/types";

function StatPill({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-[#1e2d45] bg-[#080c14] px-3 py-2">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-xs text-slate-400">{label}</span>
      <span className="ml-auto text-sm font-bold text-white">{count}</span>
    </div>
  );
}

export default function FleetOverview() {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);

  useEffect(() => {
    setVehicles(loadFleetVehicles());
  }, []);

  const counts = countByStatus(vehicles);

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Vogn-overblik</h2>
          <p className="mt-1 text-sm text-slate-500">
            Horsens · {vehicles.length} vogne · demo-positioner
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatPill color={FLEET_STATUS.ledig.color} label="Ledig" count={counts.ledig} />
          <StatPill color={FLEET_STATUS.paa_vej.color} label="På vej" count={counts.paa_vej} />
          <StatPill color={FLEET_STATUS.optaget.color} label="Optaget" count={counts.optaget} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-xl border border-[#1e2d45] bg-[#0f1520]">
          {vehicles.length > 0 ? (
            <FleetMap vehicles={vehicles} />
          ) : (
            <div className="flex min-h-[320px] items-center justify-center text-sm text-slate-500">
              Indlæser flåde…
            </div>
          )}
          <div className="flex flex-wrap gap-4 border-t border-[#1e2d45] px-4 py-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500" /> Ledig
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-yellow-500" /> På vej
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500" /> Optaget
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-[#1e2d45] bg-[#0f1520]">
          <div className="border-b border-[#1e2d45] px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-300">Flåde-liste</h3>
          </div>
          <ul className="divide-y divide-[#1e2d45]/50">
            {vehicles.map((vehicle) => {
              const cfg = FLEET_STATUS[vehicle.status];
              return (
                <li key={vehicle.id} className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: cfg.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">{fleetListLine(vehicle)}</p>
                      <p className="mt-1 truncate text-xs text-slate-500">{vehicle.locationLabel}</p>
                      <p className="mt-0.5 text-xs text-slate-600">
                        {formatFleetActivity(vehicle.lastActivityAt)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${cfg.bgClass} ${cfg.textClass}`}
                    >
                      {cfg.label}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
