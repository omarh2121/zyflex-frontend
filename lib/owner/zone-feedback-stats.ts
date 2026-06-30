import type { ZoneFeedbackEntry } from "@/lib/odense/types";
import type { ZoneFeedbackSnapshot, ZoneFeedbackSummary } from "@/lib/owner/types";

export function emptyZoneFeedback(): ZoneFeedbackSnapshot {
  return { totalResponses: 0, zones: [] };
}

export function aggregateZoneFeedback(entries: ZoneFeedbackEntry[]): ZoneFeedbackSnapshot {
  const byZone = new Map<string, ZoneFeedbackSummary>();

  for (const entry of entries) {
    const key = `${entry.city}::${entry.zoneId}`;
    const existing = byZone.get(key) ?? {
      city: entry.city,
      zoneId: entry.zoneId,
      zoneName: entry.zoneName,
      yesCount: 0,
      noCount: 0,
      total: 0,
      successRate: 0,
    };

    if (entry.answer === "yes") existing.yesCount += 1;
    else existing.noCount += 1;
    existing.total += 1;
    existing.zoneName = entry.zoneName;

    byZone.set(key, existing);
  }

  const zones = [...byZone.values()]
    .map((z) => ({
      ...z,
      successRate: z.total > 0 ? Math.round((z.yesCount / z.total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total || b.successRate - a.successRate);

  return {
    totalResponses: entries.length,
    zones,
  };
}
