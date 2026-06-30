"use client";
// Dynamically imported (no SSR) from heatmap/page.tsx
import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polygon, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { type HexData, scoreColor } from "@/lib/api";

// H3 doesn't have a browser build we can import here, so we use approximate
// hex-to-polygon math directly from the center coords returned by the API.
function hexPolygon(lat: number, lon: number, radiusKm = 0.25): [number, number][] {
  const R    = 6371;
  const dlat = (radiusKm / R) * (180 / Math.PI);
  const dlon = dlat / Math.cos((lat * Math.PI) / 180);
  const pts: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    pts.push([lat + dlat * Math.cos(angle), lon + dlon * Math.sin(angle)]);
  }
  return pts;
}

function hexColor(score: number): string {
  if (score >= 85) return "#ef4444";
  if (score >= 70) return "#f59e0b";
  if (score >= 50) return "#ef4444";
  return "#374151";
}

function hexOpacity(score: number): number {
  return Math.max(0.08, Math.min(0.65, score / 100));
}

// Recenter map on city change
function MapCenter({ city }: { city: string }) {
  const map = useMap();
  const CENTERS: Record<string, [number, number]> = {
    horsens: [55.8615, 9.8506],
    vejle:   [55.7079, 9.5359],
    herning: [56.1395, 9.0099],
    ikast:   [56.1389, 9.1578],
    aarhus:  [56.1629, 10.2039],
  };
  const center = CENTERS[city.toLowerCase()] ?? [55.8615, 9.8506];
  useEffect(() => {
    map.setView(center, 13, { animate: true });
  }, [city, map, center]);
  return null;
}

export default function HeatmapMap({ hexes, city }: { hexes: HexData[]; city: string }) {
  const CENTERS: Record<string, [number, number]> = {
    horsens: [55.8615, 9.8506],
    vejle:   [55.7079, 9.5359],
    herning: [56.1395, 9.0099],
    ikast:   [56.1389, 9.1578],
    aarhus:  [56.1629, 10.2039],
  };
  const center = CENTERS[city.toLowerCase()] ?? [55.8615, 9.8506];

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "100%", width: "100%", background: "#080c14" }}
      zoomControl>
      {/* Dark tile layer */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        maxZoom={19}
      />
      <MapCenter city={city} />

      {hexes.map((h) => (
        <Polygon
          key={h.hex_id}
          positions={hexPolygon(h.lat, h.lon)}
          pathOptions={{
            fillColor:   hexColor(h.score),
            fillOpacity: hexOpacity(h.score),
            color:       hexColor(h.score),
            weight:      h.score >= 70 ? 1.5 : 0.5,
            opacity:     0.6,
          }}>
          <Tooltip sticky>
            <div style={{ background: "#0f1520", border: "1px solid #1e2d45", borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", fontSize: 12 }}>
              <div style={{ fontWeight: 900, color: hexColor(h.score), fontSize: 16 }}>{h.score}/100</div>
              <div style={{ color: "#6b7280", marginTop: 2 }}>{h.grade}</div>
              <div style={{ color: "#374151", marginTop: 2, fontSize: 10 }}>
                {h.lat.toFixed(4)}, {h.lon.toFixed(4)}
              </div>
            </div>
          </Tooltip>
        </Polygon>
      ))}
    </MapContainer>
  );
}
