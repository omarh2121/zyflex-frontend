"use client";

import { createContext, useContext } from "react";
import type { DriverLocation, LocationStatus } from "./use-driver-location";

export interface LocationContextValue {
  status: LocationStatus;
  location: DriverLocation | null;
  error: string | null;
  isActive: boolean;
  requestPermission: () => void;
}

export const LocationContext = createContext<LocationContextValue | null>(null);

export function useLocation(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error("useLocation skal bruges inden for LocationGate");
  }
  return ctx;
}
