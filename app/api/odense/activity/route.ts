import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import type { DriverOpenLog } from "@/lib/odense/types";

const ACTIVITY_FILE = path.join(process.cwd(), "data", "odense", "driver-activity.json");

async function readActivity(): Promise<{ opens: DriverOpenLog[] }> {
  try {
    const raw = await fs.readFile(ACTIVITY_FILE, "utf-8");
    return JSON.parse(raw) as { opens: DriverOpenLog[] };
  } catch {
    return { opens: [] };
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as { driverId?: string; driverName?: string };

  if (!body.driverId) {
    return NextResponse.json({ error: "driverId mangler" }, { status: 400 });
  }

  const entry: DriverOpenLog = {
    driverId: body.driverId,
    driverName: body.driverName?.trim() || "Chauffør",
    openedAt: new Date().toISOString(),
  };

  const data = await readActivity();
  data.opens.unshift(entry);
  data.opens = data.opens.slice(0, 500);

  await fs.writeFile(ACTIVITY_FILE, JSON.stringify(data, null, 2), "utf-8");

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const data = await readActivity();
  return NextResponse.json(data);
}
