import { NextResponse } from "next/server";
import { runQuery } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await runQuery<{ now: string }>(
      "SELECT NOW()::text AS now"
    );

    return NextResponse.json({
      status: "ok",
      database: "connected",
      timestamp: result.rows[0]?.now ?? null
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        message: error instanceof Error ? error.message : "Unknown database error"
      },
      { status: 500 }
    );
  }
}

