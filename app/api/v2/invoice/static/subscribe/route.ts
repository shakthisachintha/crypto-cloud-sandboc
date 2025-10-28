import { NextResponse } from "next/server";
import { makeCurrencyObject } from "../../../../_utils";
import { getWalletByUuid, updateActive } from "../../../../../db/postgres";
import type { WalletRow } from "../types";

type UuidBody = { uuid?: string };

export async function POST(req: Request) {
  const body = (await req.json()) as UuidBody | undefined;
  const { uuid } = body || {};
  if (!uuid || typeof uuid !== "string") {
    return NextResponse.json({ status: "error", result: { validation_error: "uuid is required" } }, { status: 400 });
  }

  const row = (await getWalletByUuid(uuid)) as WalletRow | null;
  if (!row) return NextResponse.json({ status: "error", result: { validation_error: "Wallet not found" } }, { status: 400 });

  try {
    const updated = (await updateActive(uuid, true)) as WalletRow;
    const result = {
      currency: makeCurrencyObject(updated.currency),
      active: !!updated.active,
      address: updated.address,
      created: updated.created,
      identify: updated.identify,
    };
    return NextResponse.json({ status: "success", result });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ status: "error", result: { validation_error: `Failed to subscribe: ${msg}` } }, { status: 400 });
  }
}
