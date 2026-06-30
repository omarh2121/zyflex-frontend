"use client";

import type { MutableRefObject } from "react";
import { useEffect, useRef } from "react";
import type { CircleMarker as LeafletCircleMarker, Map as LeafletMap } from "leaflet";
import type { ScoredZone } from "@/lib/odense/types";
import { scoreColor } from "@/lib/odense/zone-logic";
import type { DriverLocation } from "@/lib/location/use-driver-location";

type LeafletApi = typeof import("leaflet");

async function loadLeaflet(): Promise<LeafletApi> {
  const mod = await import("leaflet");
  await import("leaflet/dist/leaflet.css");
  return mod.default ?? mod;
}

function markerRadius(score: number, isHot: boolean, selected: boolean): number {
  if (selected) return isHot ? 18 : 14;
  if (isHot) return 16 + Math.round(score / 20);
  return score > 0 ? 10 : 7;
}

function tooltipHtml(zone: ScoredZone, color: string, selected: boolean): string {
  const scoreLabel = zone.score > 0 ? `${zone.score}/100` : "Rolig lige nu";
  return `
    <div style="font-size:12px">
      <div style="font-weight:700;color:${color}">${zone.name}${selected ? " · Valgt" : ""}</div>
      <div style="color:#94a3b8">${scoreLabel}</div>
    </div>
  `;
}

export default function ZoneMap({
  zones,
  center,
  selectedZoneId,
  userLocation,
  onZoneSelect,
  focusUserLocation,
}: {
  zones: ScoredZone[];
  center: [number, number];
  selectedZoneId?: string | null;
  userLocation?: DriverLocation | null;
  onZoneSelect?: (zoneId: string) => void;
  focusUserLocation?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const leafletRef = useRef<LeafletApi | null>(null);
  const markersRef = useRef<LeafletCircleMarker[]>([]);
  const userMarkerRef = useRef<LeafletCircleMarker | null>(null);
  const onZoneSelectRef = useRef(onZoneSelect);
  onZoneSelectRef.current = onZoneSelect;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    async function initMap() {
      const L = await loadLeaflet();
      if (cancelled || !containerRef.current || mapRef.current) return;

      leafletRef.current = L;
      const map = L.map(containerRef.current, {
        center,
        zoom: 13,
        zoomControl: false,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> · OSM',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
      redraw(L, map);

      requestAnimationFrame(() => {
        map.invalidateSize();
        redraw(L, map);
      });
    }

    function redraw(L: LeafletApi, map: LeafletMap) {
      drawZoneMarkers(L, map, zones, selectedZoneId ?? null, markersRef, (id) =>
        onZoneSelectRef.current?.(id),
      );
      drawUserMarker(L, map, userLocation ?? null, userMarkerRef);
      fitMap(L, map, zones, userLocation ?? null, focusUserLocation ?? false, selectedZoneId ?? null);
    }

    void initMap();

    return () => {
      cancelled = true;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      leafletRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L) return;

    drawZoneMarkers(L, map, zones, selectedZoneId ?? null, markersRef, (id) =>
      onZoneSelectRef.current?.(id),
    );
    drawUserMarker(L, map, userLocation ?? null, userMarkerRef);
    fitMap(L, map, zones, userLocation ?? null, focusUserLocation ?? false, selectedZoneId ?? null);
    map.invalidateSize();
  }, [zones, center, selectedZoneId, userLocation, focusUserLocation]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full min-h-[240px]"
      style={{ background: "#080c14" }}
    />
  );
}

function drawZoneMarkers(
  L: LeafletApi,
  map: LeafletMap,
  zones: ScoredZone[],
  selectedZoneId: string | null,
  markersRef: MutableRefObject<LeafletCircleMarker[]>,
  onSelect: (zoneId: string) => void,
) {
  markersRef.current.forEach((marker) => marker.remove());
  markersRef.current = [];

  zones.forEach((zone) => {
    const selected = zone.id === selectedZoneId;
    const color = scoreColor(zone.score);
    const marker = L.circleMarker([zone.lat, zone.lng], {
      radius: markerRadius(zone.score, zone.isHot, selected),
      fillColor: color,
      fillOpacity: selected ? 1 : zone.isHot ? 0.85 : zone.score > 0 ? 0.45 : 0.2,
      color: selected ? "#ef4444" : zone.isHot ? "#fff" : color,
      weight: selected ? 3 : zone.isHot ? 2.5 : 1,
      opacity: 1,
      className: zone.isHot ? "zone-marker-hot" : undefined,
    }).addTo(map);

    marker.bindTooltip(tooltipHtml(zone, color, selected), {
      direction: "top",
      offset: [0, -8],
      opacity: 1,
    });

    marker.on("click", () => onSelect(zone.id));
    markersRef.current.push(marker);
  });
}

function drawUserMarker(
  L: LeafletApi,
  map: LeafletMap,
  userLocation: DriverLocation | null,
  userMarkerRef: MutableRefObject<LeafletCircleMarker | null>,
) {
  userMarkerRef.current?.remove();
  userMarkerRef.current = null;

  if (!userLocation) return;

  const marker = L.circleMarker([userLocation.lat, userLocation.lng], {
    radius: 9,
    fillColor: "#dc2626",
    fillOpacity: 1,
    color: "#fff",
    weight: 3,
    opacity: 1,
  }).addTo(map);

  marker.bindTooltip(
    `<div style="font-size:12px;font-weight:700;color:#ef4444">Du er her</div>`,
    { direction: "top", offset: [0, -10], opacity: 1 },
  );

  userMarkerRef.current = marker;
}

function fitMap(
  L: LeafletApi,
  map: LeafletMap,
  zones: ScoredZone[],
  userLocation: DriverLocation | null,
  focusUser: boolean,
  selectedZoneId: string | null,
) {
  const points: [number, number][] = zones.map((z) => [z.lat, z.lng]);

  if (userLocation) {
    points.push([userLocation.lat, userLocation.lng]);
  }

  if (selectedZoneId) {
    const selected = zones.find((z) => z.id === selectedZoneId);
    if (selected) {
      map.setView([selected.lat, selected.lng], 14, { animate: true });
      return;
    }
  }

  if (focusUser && userLocation) {
    map.setView([userLocation.lat, userLocation.lng], 14, { animate: true });
    return;
  }

  if (points.length > 0) {
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 14 });
  }
}
