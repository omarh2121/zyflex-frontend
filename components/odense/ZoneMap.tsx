"use client";

import type { MutableRefObject } from "react";
import { useEffect, useRef } from "react";
import type { CircleMarker as LeafletCircleMarker, Map as LeafletMap } from "leaflet";
import type { ScoredZone } from "@/lib/odense/types";
import { scoreColor } from "@/lib/odense/zone-logic";

type LeafletApi = typeof import("leaflet");

async function loadLeaflet(): Promise<LeafletApi> {
  const mod = await import("leaflet");
  await import("leaflet/dist/leaflet.css");
  return mod.default ?? mod;
}

function markerRadius(score: number, isHot: boolean): number {
  if (isHot) return 16 + Math.round(score / 20);
  return score > 0 ? 10 : 7;
}

function tooltipHtml(zone: ScoredZone, color: string): string {
  const scoreLabel = zone.score > 0 ? `${zone.score}/100` : "Rolig lige nu";
  return `
    <div style="font-size:12px">
      <div style="font-weight:700;color:${color}">${zone.name}</div>
      <div style="color:#94a3b8">${scoreLabel}</div>
    </div>
  `;
}

export default function ZoneMap({
  zones,
  center,
}: {
  zones: ScoredZone[];
  center: [number, number];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const leafletRef = useRef<LeafletApi | null>(null);
  const markersRef = useRef<LeafletCircleMarker[]>([]);

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
      drawMarkers(L, map, zones, markersRef);

      requestAnimationFrame(() => {
        map.invalidateSize();
        drawMarkers(L, map, zones, markersRef);
      });
    }

    void initMap();

    return () => {
      cancelled = true;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
      leafletRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L) return;

    drawMarkers(L, map, zones, markersRef);
    map.invalidateSize();
  }, [zones, center]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full min-h-[240px]"
      style={{ background: "#080c14" }}
    />
  );
}

function drawMarkers(
  L: LeafletApi,
  map: LeafletMap,
  zones: ScoredZone[],
  markersRef: MutableRefObject<LeafletCircleMarker[]>,
) {
  markersRef.current.forEach((marker) => marker.remove());
  markersRef.current = [];

  zones.forEach((zone) => {
    const color = scoreColor(zone.score);
    const marker = L.circleMarker([zone.lat, zone.lng], {
      radius: markerRadius(zone.score, zone.isHot),
      fillColor: color,
      fillOpacity: zone.isHot ? 0.85 : zone.score > 0 ? 0.45 : 0.2,
      color: zone.isHot ? "#fff" : color,
      weight: zone.isHot ? 2.5 : 1,
      opacity: zone.isHot ? 1 : 0.6,
      className: zone.isHot ? "zone-marker-hot" : undefined,
    }).addTo(map);

    marker.bindTooltip(tooltipHtml(zone, color), {
      direction: "top",
      offset: [0, -8],
      opacity: 1,
    });

    markersRef.current.push(marker);
  });

  if (zones.length > 0) {
    const bounds = L.latLngBounds(zones.map((zone) => [zone.lat, zone.lng]));
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 14 });
  }
}
