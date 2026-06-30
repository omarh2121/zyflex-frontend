// =============================================================================
// lib/api.ts – Zyflex AI API Service Layer
//
// Alt kommunikation med Zyflex backend samlet her.
// Skift NEXT_PUBLIC_API_URL i .env.local for at pege på din backend.
// =============================================================================

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Zone {
  rank:             number;
  zone:             string;
  score:            number;
  grade:            string;
  reason:           string;
  earn_dkk_per_hour: number;
  lat:              number;
  lon:              number;
  is_hotspot?:      boolean;
  confidence?:      string;
  events_near?:     number;
}

export interface WeatherData {
  temp_c:     number;
  precip_mm:  number;
  wind_kmh:   number;
  is_raining: boolean;
  summary:    string;
}

export interface EventItem {
  name:       string;
  venue:      string;
  time:       string;
  attendance: number;
  demand:     string;
  taxi_note:  string;
}

export interface Recommendation {
  recommended_zone:  string;
  score:             number;
  reason:            string;
  grade:             string;
  earn_dkk_per_hour: number;
  go_now:            boolean;
  h3_hex:            string | null;
  top_zones:         Zone[];
  weather:           WeatherData;
  events_today:      EventItem[];
  pipeline_errors:   string[];
  timestamp:         string;
  cached:            boolean;
}

export interface HotspotsResponse {
  hotspots:       Zone[];
  total_hotspots: number;
  h3_top_hexes:   HexData[];
  avoid_zones:    { zone: string; score: number }[];
  zone_chain:     string[];
  cached:         boolean;
  timestamp:      string;
}

export interface HexData {
  hex_id: string;
  lat:    number;
  lon:    number;
  score:  number;
  grade:  string;
  is_hot: boolean;
}

export interface HeatmapResponse {
  hexes:     HexData[];
  total:     number;
  hot_count: number;
  city:      string;
  timestamp: string;
}

export interface EventSource {
  name:        string;
  role:        string;
  status:      "ok" | "no_key" | "missing" | "error" | "not_loaded";
  event_count?: number;
  last_update?: string;
  has_key?:    boolean;
  note?:       string;
}

export interface EventSourcesResponse {
  sources:   EventSource[];
  primary:   string;
  timestamp: string;
}

export interface SystemOverview {
  system:   string;
  version:  string;
  status:   string;
  pipeline: { version: string; nodes: string[]; health: string };
  cache:    { entries: number; cities: string[]; ttl_sec: number; status: string };
  event_sources: {
    primary:         string;
    billetto_active: boolean;
    billetto_events: number;
    ticketmaster:    boolean;
    local_json:      boolean;
  };
  logging: {
    recommendations_logged: number;
    last_log:               string | null;
    file:                   string;
  };
  api_keys:   Record<string, boolean>;
  data_files: Record<string, { exists: boolean; size_kb: number }>;
  endpoints:  Record<string, string>;
  dashboard:  Record<string, string>;
  timestamp:  string;
}

// ---------------------------------------------------------------------------
// Core fetch helper
// ---------------------------------------------------------------------------

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
    next: { revalidate: 0 }, // Ingen Next.js cache – altid frisk data
  });

  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText} – ${url}`);
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/** AI dispatch-anbefaling til chaufføren */
export async function getRecommendation(
  city = "Horsens",
  fresh = false
): Promise<Recommendation> {
  return apiFetch<Recommendation>(
    `/ai/recommendation?city=${encodeURIComponent(city)}&fresh=${fresh}`
  );
}

/** Top N hotspot-zoner */
export async function getHotspots(
  city = "Horsens",
  limit = 5
): Promise<HotspotsResponse> {
  return apiFetch<HotspotsResponse>(
    `/ai/hotspots?city=${encodeURIComponent(city)}&limit=${limit}`
  );
}

/** H3 hex heatmap data til kortvisning */
export async function getHeatmap(city = "Horsens"): Promise<HeatmapResponse> {
  return apiFetch<HeatmapResponse>(
    `/ai/heatmap?city=${encodeURIComponent(city)}`
  );
}

/** Event-kilde status */
export async function getEventSources(): Promise<EventSourcesResponse> {
  return apiFetch<EventSourcesResponse>("/ai/events/sources");
}

/** Samlet system-overview */
export async function getSystemOverview(): Promise<SystemOverview> {
  return apiFetch<SystemOverview>("/ai/system-overview");
}

/** Pipeline health */
export async function getPipelineStatus(): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>("/ai/pipeline/status");
}

// ---------------------------------------------------------------------------
// Score helpers
// ---------------------------------------------------------------------------

export function scoreColor(score: number): string {
  if (score >= 85) return "#ef4444"; // rød – GO NOW
  if (score >= 70) return "#f59e0b"; // amber – høj
  if (score >= 50) return "#ef4444"; // rød – middel
  return "#6b7280";                  // grå – lav
}

export function scoreBg(score: number): string {
  if (score >= 85) return "rgba(239,68,68,0.12)";
  if (score >= 70) return "rgba(245,158,11,0.12)";
  if (score >= 50) return "rgba(59,130,246,0.12)";
  return "rgba(107,114,128,0.08)";
}

export function gradeEmoji(score: number): string {
  if (score >= 85) return "🔴";
  if (score >= 70) return "🟠";
  if (score >= 50) return "🔵";
  return "⚪";
}
