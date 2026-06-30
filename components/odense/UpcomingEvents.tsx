import type { SpecialEvent, Zone } from "@/lib/odense/types";
import { formatEventDateDa } from "@/lib/odense/zone-logic";
import { buildEventRecommendation, formatVisitors } from "@/lib/odense/event-recommendations";
import { NavigateSection } from "@/components/odense/NavigateButton";

function zoneName(zones: Zone[], zoneId: string): string {
  return zones.find((z) => z.id === zoneId)?.name ?? zoneId;
}

export default function UpcomingEvents({
  events,
  zones,
}: {
  events: SpecialEvent[];
  zones: Zone[];
}) {
  return (
    <section className="border-t border-[#1e2d45] px-4 pb-10 pt-6">
      <div className="mb-4">
        <h2 className="text-base font-bold text-white">🎉 Kommende begivenheder</h2>
        <p className="text-xs text-slate-500">Næste 90 dage · konkrete anbefalinger til dig</p>
      </div>

      {events.length === 0 ? (
        <p className="rounded-2xl border border-[#1e2d45] bg-[#0f1520] p-4 text-sm text-slate-500">
          Ingen større begivenheder de næste 90 dage.
        </p>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} zones={zones} />
          ))}
        </ul>
      )}
    </section>
  );
}

function EventCard({ event, zones }: { event: SpecialEvent; zones: Zone[] }) {
  const nearestZone = zoneName(zones, event.zoneId);
  const rec = buildEventRecommendation(event, nearestZone);
  const guests = formatVisitors(event.visitors);

  return (
    <li className="rounded-2xl border border-[#1e2d45] bg-[#0f1520] p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-950/50 text-base ring-1 ring-red-500/30">
          🎉
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-white">{event.title}</span>
            <DemandBadge emoji={rec.demandEmoji} label={rec.demandLabel} />
          </div>

          <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
            <MetaItem label="Dato" value={formatEventDateDa(event)} />
            <MetaItem label="By" value={event.place} />
            <MetaItem label="Nærmeste zone" value={nearestZone} />
            <MetaItem
              label="Forventet antal gæster"
              value={guests ?? "Ikke oplyst"}
              muted={!guests}
            />
            <MetaItem
              label="Forventet efterspørgsel"
              value={`${rec.demandEmoji} ${rec.demandLabel}`}
              className="sm:col-span-2"
            />
          </dl>

          <div className="mt-4 rounded-xl border border-red-900/40 bg-red-950/20 p-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-red-400">
              🚖 AI-anbefaling
            </h3>
            <p className="mt-2 text-sm leading-snug text-slate-300">{rec.aiAdvice}</p>

            <div className="mt-3 space-y-2 border-t border-red-900/30 pt-3">
              <RecRow icon="⏰" label="Bedste tidspunkt" value={rec.bestTime} />
              <RecRow icon="📍" label="Anbefalet placering" value={rec.recommendedPlacement} />
              <RecRow icon="🚕" label="Forventet aktivitet" value={rec.expectedActivity} />
            </div>
          </div>

          <NavigateSection
            destination={{
              address: event.address,
              lat: event.lat,
              lng: event.lng,
              googleMapsUrl: event.googleMapsUrl,
            }}
            areaFallback={nearestZone}
          />
        </div>
      </div>
    </li>
  );
}

function MetaItem({
  label,
  value,
  muted = false,
  className = "",
}: {
  label: string;
  value: string;
  muted?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-slate-600">{label}</dt>
      <dd className={muted ? "text-slate-500" : "text-slate-300"}>{value}</dd>
    </div>
  );
}

function DemandBadge({ emoji, label }: { emoji: string; label: string }) {
  return (
    <span className="rounded-full bg-[#1e2d45] px-2 py-0.5 text-[10px] font-bold text-slate-300">
      {emoji} {label}
    </span>
  );
}

function RecRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex gap-2 text-xs">
      <span className="shrink-0">{icon}</span>
      <div>
        <div className="font-semibold text-slate-400">{label}</div>
        <div className="text-slate-200">{value}</div>
      </div>
    </div>
  );
}
