"use client";

import type { MutableRefObject } from "react";
import { useEffect, useRef } from "react";
import type { CircleMarker as LeafletCircleMarker, Map as LeafletMap } from "leaflet";
import { HORSENS_CENTER } from "@/lib/owner/fleet-demo";
import { FLEET_STATUS } from "@/lib/owner/fleet";
import type { FleetVehicle } from "@/lib/owner/types";

type LeafletApi = typeof import("leaflet");

async function loadLeaflet(): Promise<LeafletApi> {
  const mod = await import("leaflet");
  await import("leaflet/dist/leaflet.css");
  return mod.default ?? mod;
}

function tooltipHtml(vehicle: FleetVehicle): string {
  const cfg = FLEET_STATUS[vehicle.status];
  return `
    <div style="font-size:12px;min-width:140px">
      <div style="font-weight:700;color:${cfg.color}">Vogn ${vehicle.vehicleNumber} · ${vehicle.driverName}</div>
      <div style="color:#94a3b8;margin-top:2px">${cfg.label}</div>
      <div style="color:#64748b;margin-top:4px">${vehicle.locationLabel}</div>
    </div>
  `;
}

export default function FleetMap({ vehicles }: { vehicles: FleetVehicle[] }) {
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
        center: HORSENS_CENTER,
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> · OSM',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
      drawMarkers(L, map, vehicles, markersRef);

      requestAnimationFrame(() => {
        map.invalidateSize();
        drawMarkers(L, map, vehicles, markersRef);
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

    drawMarkers(L, map, vehicles, markersRef);
    map.invalidateSize();
  }, [vehicles]);

  return (
    <div
      ref={containerRef}
      className="h-full min-h-[320px] w-full rounded-xl"
      style={{ background: "#080c14" }}
    />
  );
}

function drawMarkers(
  L: LeafletApi,
  map: LeafletMap,
  vehicles: FleetVehicle[],
  markersRef: MutableRefObject<LeafletCircleMarker[]>,
) {
  markersRef.current.forEach((marker) => marker.remove());
  markersRef.current = [];

  vehicles.forEach((vehicle) => {
    const color = FLEET_STATUS[vehicle.status].color;
    const isBusy = vehicle.status === "optaget";

    const marker = L.circleMarker([vehicle.lat, vehicle.lng], {
      radius: isBusy ? 14 : 12,
      fillColor: color,
      fillOpacity: 0.9,
      color: isBusy ? "#fff" : color,
      weight: isBusy ? 2.5 : 2,
      opacity: 1,
    }).addTo(map);

    marker.bindTooltip(tooltipHtml(vehicle), {
      direction: "top",
      offset: [0, -10],
      opacity: 1,
      permanent: false,
    });

    markersRef.current.push(marker);
  });

  if (vehicles.length > 0) {
    const bounds = L.latLngBounds(vehicles.map((v) => [v.lat, v.lng]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
  }
}
