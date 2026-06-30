import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import type { ZoneFeedbackEntry } from "@/lib/odense/types";

const FEEDBACK_FILE = path.join(process.cwd(), "data", "odense", "zone-feedback.json");

async function readFeedback(): Promise<{ entries: ZoneFeedbackEntry[] }> {
  try {
    const raw = await fs.readFile(FEEDBACK_FILE, "utf-8");
    return JSON.parse(raw) as { entries: ZoneFeedbackEntry[] };
  } catch {
    return { entries: [] };
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    driverId?: string;
    driverName?: string;
    city?: string;
    zoneId?: string;
    zoneName?: string;
    answer?: string;
    lat?: number;
    lng?: number;
  };

  if (!body.driverId || !body.zoneId || !body.zoneName) {
    return NextResponse.json({ error: "driverId, zoneId og zoneName er påkrævet" }, { status: 400 });
  }

  if (body.answer !== "yes" && body.answer !== "no") {
    return NextResponse.json({ error: "answer skal være yes eller no" }, { status: 400 });
  }

  const entry: ZoneFeedbackEntry = {
    id: `fb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    driverId: body.driverId,
    driverName: body.driverName?.trim() || "Chauffør",
    city: body.city?.trim() || "Odense",
    zoneId: body.zoneId,
    zoneName: body.zoneName.trim(),
    answer: body.answer,
    answeredAt: new Date().toISOString(),
    lat: typeof body.lat === "number" ? body.lat : undefined,
    lng: typeof body.lng === "number" ? body.lng : undefined,
  };

  const data = await readFeedback();
  data.entries.unshift(entry);
  data.entries = data.entries.slice(0, 2000);

  await fs.writeFile(FEEDBACK_FILE, JSON.stringify(data, null, 2), "utf-8");

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const data = await readFeedback();
  return NextResponse.json(data);
}
