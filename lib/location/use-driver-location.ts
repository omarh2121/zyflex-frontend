"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type LocationStatus = "idle" | "requesting" | "granted" | "denied" | "unsupported";

export interface DriverLocation {
  lat: number;
  lng: number;
  accuracy: number;
  updatedAt: string;
}

interface LocationState {
  status: LocationStatus;
  location: DriverLocation | null;
  error: string | null;
}

export function useDriverLocation() {
  const [state, setState] = useState<LocationState>({
    status: "idle",
    location: null,
    error: null,
  });
  const watchIdRef = useRef<number | null>(null);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const requestPermission = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({
        status: "unsupported",
        location: null,
        error: "Din browser understøtter ikke GPS.",
      });
      return;
    }

    setState((s) => ({ ...s, status: "requesting", error: null }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          status: "granted",
          location: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            updatedAt: new Date().toISOString(),
          },
          error: null,
        });
      },
      (err) => {
        const denied = err.code === err.PERMISSION_DENIED;
        setState({
          status: denied ? "denied" : "idle",
          location: null,
          error: denied
            ? "Placering afvist — tillad GPS i browser/telefon-indstillinger."
            : "Kunne ikke hente placering. Prøv igen.",
        });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 },
    );
  }, []);

  useEffect(() => {
    if (state.status !== "granted" || !navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setState((s) => ({
          ...s,
          location: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            updatedAt: new Date().toISOString(),
          },
        }));
      },
      undefined,
      { enableHighAccuracy: false, maximumAge: 60000, timeout: 20000 },
    );

    return stopWatching;
  }, [state.status, stopWatching]);

  return {
    status: state.status,
    location: state.location,
    error: state.error,
    requestPermission,
    isActive: state.status === "granted" && state.location != null,
  };
}
