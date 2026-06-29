"use client";

import type { Zone } from "@/lib/odense/types";

interface ZonePickerProps {
  zones: Zone[];
  selectedZoneId: string | null;
  onSelect: (zoneId: string | null) => void;
}

export default function ZonePicker({ zones, selectedZoneId, onSelect }: ZonePickerProps) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Vælg zone
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ZoneChip
          label="Alle zoner"
          active={selectedZoneId == null}
          onClick={() => onSelect(null)}
        />
        {zones.map((zone) => (
          <ZoneChip
            key={zone.id}
            label={zone.name}
            active={selectedZoneId === zone.id}
            onClick={() => onSelect(zone.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ZoneChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "bg-blue-600 text-white"
          : "border border-[#1e2d45] bg-[#0f1520] text-slate-400 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
