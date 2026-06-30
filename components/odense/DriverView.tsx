"use client";

import { useEffect, useMemo, useState } from "react";
import {
  formatDateDa,
  formatTimeDa,
  getUpcomingWithinDays,
  rankZones,
} from "@/lib/odense/zone-logic";
import {
  getCityCenter,
  getCityName,
  getVisibleEvents,
  getZones,
} from "@/lib/cities/data";
import { DEFAULT_CITY, type CityId } from "@/lib/cities/config";
import { getStoredCity, storeCity } from "@/lib/cities/storage";
import { getStoredZone, storeZone } from "@/lib/cities/zone-storage";
import { findNearestZone, formatDistanceKm } from "@/lib/cities/zone-utils";
import { clearAuthSession, getDriverName } from "@/lib/odense/auth";
import { useLocation } from "@/lib/location/location-context";
import HotZoneList from "@/components/odense/HotZoneList";
import UpcomingEvents from "@/components/odense/UpcomingEvents";
import ZoneMap from "@/components/odense/ZoneMap";
import CitySwitcher from "@/components/odense/CitySwitcher";
import ZonePicker from "@/components/odense/ZonePicker";
import { useRouter } from "next/navigation";

const DRIVER_ID_KEY = "odense_driver_id";

function createDriverId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `driver-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `driver-${Date.now().toString(36)}`;
}

function getOrCreateDriverId(): string {
  let id = localStorage.getItem(DRIVER_ID_KEY);
  if (!id) {
    id = createDriverId();
    localStorage.setItem(DRIVER_ID_KEY, id);
  }
  return id;
}

async function logAppOpen(
  driverId: string,
  driverName: string,
  city: string,
  zone: string,
) {
  try {
    await fetch("/api/odense/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        driverId,
        driverName,
        city,
        zone,
      }),
    });
  } catch {
    // Stille fejl — chauffør-visningen skal ikke blokere
  }
}

interface DriverViewProps {
  initialNowIso: string;
}

export default function DriverView({ initialNowIso }: DriverViewProps) {
  const router = useRouter();
  const [cityId, setCityId] = useState<CityId>(() => getStoredCity() ?? DEFAULT_CITY);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(() =>
    getStoredZone(getStoredCity() ?? DEFAULT_CITY),
  );
  const [focusUserLocation, setFocusUserLocation] = useState(false);
  const [now, setNow] = useState(() => new Date(initialNowIso));
  const [driverName, setDriverName] = useState("");
  const [driverId, setDriverId] = useState("");

  const {
    location: userLocation,
    isActive: gpsActive,
  } = useLocation();

  const zones = useMemo(() => getZones(cityId), [cityId]);
  const events = useMemo(() => getVisibleEvents(cityId, now), [cityId, now]);
  const mapCenter = useMemo(() => getCityCenter(cityId), [cityId]);
  const cityName = getCityName(cityId);

  const ranked = useMemo(() => rankZones(zones, now, events), [zones, now, events]);
  const upcomingEvents = useMemo(() => getUpcomingWithinDays(events, now, 90), [events, now]);
  const hotCount = ranked.filter((z) => z.isHot).length;

  const selectedZone = selectedZoneId
    ? zones.find((z) => z.id === selectedZoneId) ?? null
    : null;

  const nearestZone = useMemo(() => {
    if (!userLocation) return null;
    return findNearestZone(zones, userLocation.lat, userLocation.lng);
  }, [userLocation, zones]);

  useEffect(() => {
    storeCity(cityId);
  }, [cityId]);

  useEffect(() => {
    storeZone(cityId, selectedZoneId);
  }, [cityId, selectedZoneId]);

  useEffect(() => {
    setSelectedZoneId(getStoredZone(cityId));
    setFocusUserLocation(false);
  }, [cityId]);

  useEffect(() => {
    setNow(new Date());
    setDriverName(getDriverName() || "Chauffør");
    setDriverId(getOrCreateDriverId());

    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const driverId = getOrCreateDriverId();
    const name = getDriverName() || "Chauffør";
    const zoneLabel =
      selectedZone?.name ||
      nearestZone?.zone.name ||
      rankZones(getZones(cityId), new Date(), getVisibleEvents(cityId))[0]?.name ||
      cityName;
    void logAppOpen(driverId, name, cityName, zoneLabel);
  }, [cityId, cityName, selectedZone, nearestZone]);

  function handleCityChange(nextCity: CityId) {
    setCityId(nextCity);
  }

  function handleZoneSelect(zoneId: string | null) {
    setSelectedZoneId(zoneId);
    setFocusUserLocation(false);
  }

  function handleLogout() {
    clearAuthSession();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-200">
      <header className="sticky top-0 z-40 border-b border-[#1e2d45] bg-[#080c14]/95 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">🚕</span>
              <span className="text-sm font-black tracking-wide text-red-500">Byens Taxi</span>
            </div>
            <h1 className="text-lg font-bold text-white">{cityName}</h1>
            {driverName && (
              <p className="truncate text-xs text-slate-400">Velkommen, {driverName}</p>
            )}
            {selectedZone && (
              <p className="truncate text-xs text-red-400">Zone: {selectedZone.name}</p>
            )}
            {gpsActive && nearestZone && !selectedZone && (
              <p className="truncate text-xs text-red-400">
                Nærmest: {nearestZone.zone.name} ({formatDistanceKm(nearestZone.distanceKm)})
              </p>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <div className="text-right" suppressHydrationWarning>
              <div className="text-lg font-bold tabular-nums text-white">{formatTimeDa(now)}</div>
              <div className="text-[11px] capitalize text-slate-500">{formatDateDa(now)}</div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-[#1e2d45] px-3 py-1 text-[11px] font-semibold text-slate-400 transition hover:border-red-900/60 hover:text-red-300"
            >
              Log ud
            </button>
          </div>
        </div>

        <div className="mt-3 space-y-3">
          <CitySwitcher value={cityId} onChange={handleCityChange} />
          <ZonePicker
            zones={zones}
            selectedZoneId={selectedZoneId}
            onSelect={handleZoneSelect}
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <StatusPill
            label={hotCount > 0 ? `${hotCount} hot${hotCount === 1 ? "" : "te"} zoner` : "Rolig periode"}
            active={hotCount > 0}
          />
          <StatusPill label={`${zones.length} zoner`} active={false} />
          {gpsActive && <StatusPill label="GPS aktiv" active />}
        </div>
      </header>

      <div className="relative h-[42vh] min-h-[240px] border-b border-[#1e2d45]">
        <ZoneMap
          zones={ranked}
          center={mapCenter}
          selectedZoneId={selectedZoneId}
          userLocation={userLocation}
          onZoneSelect={(id) => handleZoneSelect(id)}
          focusUserLocation={focusUserLocation}
        />

        <div className="absolute left-3 top-3 z-[500]">
          {gpsActive && (
            <button
              type="button"
              onClick={() => setFocusUserLocation(true)}
              className="rounded-lg border border-[#1e2d45] bg-[#080c14]/95 px-3 py-2 text-xs font-semibold text-red-300 transition hover:border-red-600"
            >
              Centrer på mig
            </button>
          )}
        </div>

        <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg border border-[#1e2d45] bg-[#080c14]/90 px-2 py-1 text-[10px] text-slate-500">
          Opdateres hvert minut · {formatTimeDa(now)}
        </div>
      </div>

      <HotZoneList
        zones={ranked}
        selectedZoneId={selectedZoneId}
        onSelectZone={(id) => handleZoneSelect(id)}
        cityName={cityName}
        driverId={driverId}
        driverName={driverName}
        userLat={userLocation?.lat}
        userLng={userLocation?.lng}
      />
      <UpcomingEvents events={upcomingEvents} zones={zones} />
    </div>
  );
}

function StatusPill({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        active
          ? "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30"
          : "bg-[#0f1520] text-slate-500 ring-1 ring-[#1e2d45]"
      }`}
    >
      {active && <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />}
      {label}
    </span>
  );
}
