import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;

    console.info("[telemetry]", {
      type: payload.type ?? "unknown",
      path: payload.path ?? "/",
      ts: payload.ts ?? new Date().toISOString(),
      message: payload.message ?? null,
    });
  } catch {
    // Ignore malformed telemetry payloads.
  }

  return NextResponse.json({ ok: true }, { status: 202 });
}
