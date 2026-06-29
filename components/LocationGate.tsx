"use client";

import { useEffect } from "react";
import { LocationContext } from "@/lib/location/location-context";
import { useDriverLocation } from "@/lib/location/use-driver-location";
import type { LocationStatus } from "@/lib/location/use-driver-location";

interface LocationGateProps {
  children: React.ReactNode;
  role: "chauffør" | "ejer";
}

export default function LocationGate({ children, role }: LocationGateProps) {
  const locationState = useDriverLocation();
  const { status, isActive, requestPermission, error } = locationState;

  useEffect(() => {
    if (status === "idle") {
      requestPermission();
    }
  }, [status, requestPermission]);

  if (!isActive) {
    return (
      <LocationRequiredScreen
        role={role}
        status={status}
        error={error}
        onRequest={requestPermission}
      />
    );
  }

  return (
    <LocationContext.Provider value={locationState}>{children}</LocationContext.Provider>
  );
}

function LocationRequiredScreen({
  role,
  status,
  error,
  onRequest,
}: {
  role: "chauffør" | "ejer";
  status: LocationStatus;
  error: string | null;
  onRequest: () => void;
}) {
  const isRequesting = status === "requesting";
  const isDenied = status === "denied";
  const isUnsupported = status === "unsupported";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080c14] px-4">
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
        <div className="h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[150px]" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2">
            <span className="text-3xl">📍</span>
            <span className="text-xl font-black tracking-wide text-blue-400">ZYFLEX ZONE</span>
          </div>
          <p className="mt-3 text-sm text-slate-500">Placering påkrævet</p>
        </div>

        <div className="rounded-2xl border border-[#1e2d45] bg-[#0f1520] p-8 shadow-2xl">
          <h1 className="mb-2 text-xl font-bold text-white">Tillad din placering</h1>
          <p className="mb-6 text-sm leading-relaxed text-slate-400">
            Zyflex Zone bruger GPS til at vise dig på kortet, finde nærmeste zone og give
            bedre anbefalinger som {role}. Du kan ikke bruge appen uden adgang til placering.
          </p>

          {error && (
            <div className="mb-4 rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {isDenied && (
            <div className="mb-4 rounded-lg border border-amber-900/50 bg-amber-950/30 px-4 py-3 text-xs leading-relaxed text-amber-200/90">
              <strong className="block text-amber-300">Sådan aktiverer du GPS:</strong>
              <span className="mt-1 block">iPhone: Indstillinger → Safari/Chrome → Placering → Tillad</span>
              <span className="mt-1 block">Android: Tap lås-ikon i browseren → Tilladelser → Placering</span>
            </div>
          )}

          {isUnsupported && (
            <div className="mb-4 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-xs text-red-300">
              Prøv en nyere browser på telefonen — GPS er påkrævet for Zyflex Zone.
            </div>
          )}

          {!isUnsupported && (
            <button
              type="button"
              onClick={onRequest}
              disabled={isRequesting}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-500 disabled:opacity-60"
            >
              {isRequesting
                ? "Henter placering…"
                : isDenied
                  ? "Prøv igen"
                  : "Tillad min placering →"}
            </button>
          )}

          <p className="mt-4 text-center text-[11px] text-slate-600">
            Placeringen deles kun med Zyflex — ikke offentligt.
          </p>
        </div>
      </div>
    </div>
  );
}
