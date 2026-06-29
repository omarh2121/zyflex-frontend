import { buildGoogleMapsUrl, getLocationLabel, type MapDestination } from "@/lib/odense/maps";

export function NavigateSection({
  destination,
  areaFallback,
}: {
  destination: MapDestination;
  areaFallback?: string;
}) {
  const url = buildGoogleMapsUrl(destination);
  const { prefix, value } = getLocationLabel(destination, areaFallback);

  if (!url) return null;

  return (
    <div className="mt-3 flex flex-col gap-2 border-t border-[#1e2d45] pt-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="min-w-0 text-xs text-slate-300">
        <span className="text-slate-600">📍 {prefix}:</span> {value}
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-500 active:scale-[0.98]"
      >
        🚖 Kør dertil
      </a>
    </div>
  );
}
