"use client";

import { useState } from "react";
import type { ZoneFeedbackAnswer } from "@/lib/odense/types";

interface ZoneFeedbackButtonsProps {
  zoneId: string;
  zoneName: string;
  city: string;
  driverId: string;
  driverName: string;
  lat?: number;
  lng?: number;
}

async function submitFeedback(payload: {
  driverId: string;
  driverName: string;
  city: string;
  zoneId: string;
  zoneName: string;
  answer: ZoneFeedbackAnswer;
  lat?: number;
  lng?: number;
}) {
  await fetch("/api/odense/zone-feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export default function ZoneFeedbackButtons({
  zoneId,
  zoneName,
  city,
  driverId,
  driverName,
  lat,
  lng,
}: ZoneFeedbackButtonsProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "thanks">("idle");

  async function handleAnswer(answer: ZoneFeedbackAnswer, e: React.MouseEvent) {
    e.stopPropagation();
    if (status !== "idle") return;

    setStatus("submitting");
    try {
      await submitFeedback({
        driverId,
        driverName,
        city,
        zoneId,
        zoneName,
        answer,
        lat,
        lng,
      });
      setStatus("thanks");
      window.setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("idle");
    }
  }

  if (status === "thanks") {
    return (
      <div
        className="mt-3 rounded-xl border border-green-900/40 bg-green-950/20 px-3 py-2 text-center text-xs font-semibold text-green-400"
        onClick={(e) => e.stopPropagation()}
      >
        Tak — gemt ✓
      </div>
    );
  }

  return (
    <div
      className="mt-3 border-t border-[#1e2d45] pt-3"
      onClick={(e) => e.stopPropagation()}
    >
      <p className="mb-2 text-xs font-semibold text-slate-400">Fik du en tur her?</p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={status === "submitting"}
          onClick={(e) => void handleAnswer("yes", e)}
          className="flex-1 rounded-xl bg-green-600 py-2.5 text-sm font-bold text-white transition hover:bg-green-500 disabled:opacity-60"
        >
          Ja
        </button>
        <button
          type="button"
          disabled={status === "submitting"}
          onClick={(e) => void handleAnswer("no", e)}
          className="flex-1 rounded-xl border border-[#1e2d45] bg-[#080c14] py-2.5 text-sm font-bold text-slate-300 transition hover:border-slate-500 disabled:opacity-60"
        >
          Nej
        </button>
      </div>
    </div>
  );
}
