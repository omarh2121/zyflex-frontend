import type { ScoredZone } from "@/lib/odense/types";
import { scoreColor } from "@/lib/odense/zone-logic";
import { NavigateSection } from "@/components/odense/NavigateButton";

export default function HotZoneList({
  zones,
  selectedZoneId,
  onSelectZone,
}: {
  zones: ScoredZone[];
  selectedZoneId?: string | null;
  onSelectZone?: (zoneId: string) => void;
}) {
  const hotCount = zones.filter((z) => z.isHot).length;
  const displayZones = selectedZoneId
    ? zones.filter((z) => z.id === selectedZoneId)
    : zones;

  return (
    <section className="px-4 pb-4">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 className="text-base font-bold text-white">
            {selectedZoneId ? "Din valgte zone" : "Hvor er der gang i den nu"}
          </h2>
          <p className="text-xs text-slate-500">
            {selectedZoneId
              ? "Tryk på en zone på kortet eller listen for at skifte"
              : hotCount > 0
                ? `${hotCount} zone${hotCount === 1 ? "" : "r"} er hotte lige nu · tryk for at vælge`
                : "Ingen zoner i peak — tryk for at vælge din zone"}
          </p>
        </div>
      </div>

      <ol className="space-y-2">
        {displayZones.map((zone) => {
          const color = scoreColor(zone.score);
          const selected = zone.id === selectedZoneId;
          const rankIndex = zones.findIndex((z) => z.id === zone.id);

          return (
            <li
              key={zone.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectZone?.(zone.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onSelectZone?.(zone.id);
              }}
              className={`cursor-pointer rounded-2xl border p-4 transition ${
                selected
                  ? "border-blue-500/50 bg-blue-950/25 ring-1 ring-blue-500/30"
                  : zone.isHot
                    ? "border-amber-500/40 bg-amber-950/20 hover:border-amber-400/60"
                    : "border-[#1e2d45] bg-[#0f1520] hover:border-[#2a3f5f]"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-black"
                  style={{
                    background: `${color}22`,
                    color,
                    border: `1px solid ${color}44`,
                  }}
                >
                  {rankIndex + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold text-white">{zone.name}</span>
                    {zone.isHot && (
                      <span className="shrink-0 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-300">
                        Hot
                      </span>
                    )}
                    {selected && (
                      <span className="shrink-0 rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-300">
                        Valgt
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm leading-snug text-slate-400">{zone.activeReason}</p>
                  <NavigateSection
                    destination={{
                      address: zone.address,
                      lat: zone.lat,
                      lng: zone.lng,
                      googleMapsUrl: zone.googleMapsUrl,
                    }}
                    areaFallback={zone.name}
                  />
                </div>

                <div className="shrink-0 text-right">
                  <div className="text-xl font-black leading-none" style={{ color }}>
                    {zone.score}
                  </div>
                  <div className="text-[10px] text-slate-600">/100</div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
