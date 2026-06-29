export interface MapDestination {
  address?: string;
  lat?: number;
  lng?: number;
  googleMapsUrl?: string;
}

export function buildGoogleMapsUrl(dest: MapDestination): string | null {
  if (dest.googleMapsUrl?.trim()) return dest.googleMapsUrl.trim();

  if (dest.lat !== undefined && dest.lng !== undefined) {
    return `https://www.google.com/maps/dir/?api=1&destination=${dest.lat},${dest.lng}`;
  }

  if (dest.address?.trim()) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest.address.trim())}`;
  }

  return null;
}

export function getLocationLabel(dest: MapDestination, areaFallback?: string): {
  prefix: "Adresse" | "Område";
  value: string;
} {
  if (dest.address?.trim()) {
    return { prefix: "Adresse", value: dest.address.trim() };
  }

  return {
    prefix: "Område",
    value: areaFallback?.trim() || "Se kort for placering",
  };
}
