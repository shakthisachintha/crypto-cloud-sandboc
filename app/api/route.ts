import { NextResponse } from "next/server";
import { sql } from "../db/postgres";

export async function GET(_: Request) {
  try {
    const row = await sql`SELECT COUNT(*) as c FROM static_wallets`;
    const wallet_count = Number(row[0]?.c ?? 0);
    return NextResponse.json({ status: "ok", result: { wallet_count } }, { status: 200 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ status: "error", result: { validation_error: msg } }, { status: 500 });
  }
}
