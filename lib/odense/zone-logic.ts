import type { BusyHourRange, DayOfWeek, ScoredZone, SpecialEvent, Zone } from "./types";

const DAY_NAMES: DayOfWeek[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: "mandag",
  tuesday: "tirsdag",
  wednesday: "onsdag",
  thursday: "torsdag",
  friday: "fredag",
  saturday: "lørdag",
  sunday: "søndag",
};

export const HOT_THRESHOLD = 50;

export function getDayOfWeek(date: Date): DayOfWeek {
  return DAY_NAMES[date.getDay()];
}

export function formatTimeDa(date: Date): string {
  return date.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" });
}

export function formatDateDa(date: Date): string {
  return date.toLocaleDateString("da-DK", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function isHourInRange(hour: number, range: BusyHourRange): boolean {
  const { start, end } = range;
  if (start === end) return hour === start;
  if (start < end) return hour >= start && hour < end;
  return hour >= start || hour < end;
}

function isDayActive(zone: Zone, day: DayOfWeek): boolean {
  return zone.busyDays === "daily" || zone.busyDays.includes(day);
}

function peakScoreForRange(range: BusyHourRange): number {
  return range.peakScore ?? 70;
}

function buildActiveReason(zone: Zone, day: DayOfWeek, hour: number, score: number): string {
  if (score <= 0) return zone.reason;

  const dayLabel = DAY_LABELS[day];
  const matching = zone.busyHours.filter((r) => isHourInRange(hour, r));

  if (matching.length > 0) {
    const ranges = matching
      .map((r) => `${String(r.start).padStart(2, "0")}–${String(r.end).padStart(2, "0")}`)
      .join(" og ");
    return `${zone.reason} · Travlt ${dayLabel} kl. ${ranges}`;
  }

  if (zone.baselineScore && score === zone.baselineScore) {
    return `${zone.reason} · Lavt men jævnt flow uden for peak`;
  }

  return zone.reason;
}

export function scoreZone(
  zone: Zone,
  now: Date = new Date(),
  todayEvents: SpecialEvent[] = [],
): ScoredZone {
  const day = getDayOfWeek(now);
  const hour = now.getHours();
  const zoneEventsToday = todayEvents.filter((e) => e.zoneId === zone.id);

  if (zone.eventDriven) {
    if (zoneEventsToday.length === 0) {
      return {
        ...zone,
        score: 0,
        isHot: false,
        activeReason: `Ingen event i dag — ${zone.reason}`,
      };
    }

    let score = 0;
    for (const range of zone.busyHours) {
      if (isHourInRange(hour, range)) {
        score = Math.max(score, peakScoreForRange(range));
      }
    }

    if (score === 0) {
      score = 45;
    }

    if (zoneEventsToday.some((e) => e.major)) {
      score = Math.min(100, score + 12);
    }

    const eventTitles = zoneEventsToday.map((e) => e.title).join(", ");
    return {
      ...zone,
      score,
      isHot: score >= HOT_THRESHOLD,
      activeReason: `${zone.reason} · Event i dag: ${eventTitles}`,
    };
  }

  if (!isDayActive(zone, day)) {
    return {
      ...zone,
      score: 0,
      isHot: false,
      activeReason: `Ikke travlt ${DAY_LABELS[day]} — ${zone.reason}`,
    };
  }

  let score = 0;
  for (const range of zone.busyHours) {
    if (isHourInRange(hour, range)) {
      score = Math.max(score, peakScoreForRange(range));
    }
  }

  if (score === 0 && zone.baselineScore) {
    score = zone.baselineScore;
  }

  if (score > 0 && zone.weekendBoost && (day === "saturday" || day === "sunday")) {
    score = Math.min(100, score + zone.weekendBoost);
  }

  return {
    ...zone,
    score,
    isHot: score >= HOT_THRESHOLD,
    activeReason: buildActiveReason(zone, day, hour, score),
  };
}

export function rankZones(
  zones: Zone[],
  now: Date = new Date(),
  events: SpecialEvent[] = [],
): ScoredZone[] {
  const todayEvents = events.filter((e) => isEventToday(e, now));

  return zones
    .map((z) => scoreZone(z, now, todayEvents))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.priority - a.priority;
    });
}

export function scoreColor(score: number): string {
  if (score >= 85) return "#ef4444";
  if (score >= 70) return "#f59e0b";
  if (score >= HOT_THRESHOLD) return "#34d399";
  if (score > 0) return "#60a5fa";
  return "#475569";
}

export function isEventToday(event: SpecialEvent, now: Date = new Date()): boolean {
  const today = now.toISOString().slice(0, 10);
  if (event.endDate) {
    return today >= event.date && today <= event.endDate;
  }
  return event.date === today;
}

export function isEventUpcoming(event: SpecialEvent, now: Date = new Date(), withinDays = 14): boolean {
  const today = now.toISOString().slice(0, 10);

  if (event.endDate) {
    if (today >= event.date && today <= event.endDate) return false;
    if (today > event.endDate) return false;
  } else if (event.date <= today) {
    return false;
  }

  const eventStart = new Date(`${event.date}T12:00:00`);
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + withinDays);

  return eventStart >= start && eventStart <= end;
}

export function getUpcomingWithinDays(
  events: SpecialEvent[],
  now: Date = new Date(),
  withinDays = 90,
): SpecialEvent[] {
  const today = now.toISOString().slice(0, 10);
  const limit = new Date(now);
  limit.setDate(limit.getDate() + withinDays);
  const limitKey = limit.toISOString().slice(0, 10);

  return events
    .filter((event) => {
      const eventEnd = event.endDate ?? event.date;
      if (eventEnd < today) return false;
      if (event.date > limitKey) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.zoneDistanceKm ?? a.distanceKm ?? 999) - (b.zoneDistanceKm ?? b.distanceKm ?? 999);
    });
}

export function formatEventDateDa(event: SpecialEvent): string {
  const start = new Date(`${event.date}T12:00:00`);
  const startLabel = start.toLocaleDateString("da-DK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (!event.endDate || event.endDate === event.date) return startLabel;

  const end = new Date(`${event.endDate}T12:00:00`);
  const sameYear = start.getFullYear() === end.getFullYear();
  const endLabel = end.toLocaleDateString("da-DK", {
    day: "numeric",
    month: "short",
    year: sameYear ? undefined : "numeric",
  });

  return `${startLabel} – ${endLabel}`;
}

export function partitionEvents(events: SpecialEvent[], now: Date = new Date()) {
  const today = events.filter((e) => isEventToday(e, now));
  const upcoming = events
    .filter((e) => {
      if (isEventToday(e, now)) return false;
      const withinDays = e.source === "festival" ? 90 : 14;
      return isEventUpcoming(e, now, withinDays);
    })
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
    });
  return { today, upcoming };
}
