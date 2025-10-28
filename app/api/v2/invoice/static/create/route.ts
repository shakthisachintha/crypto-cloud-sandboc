import { NextResponse } from "next/server";
import { createWallet } from "../../../../../db/postgres";
import { genUuid32, makeCurrencyObject } from "../../../../_utils";
import type { WalletRow } from "../types";

type CreateBody = {
  shop_id?: string;
  currency?: string;
  identify?: string;
};

export async function POST(req: Request) {
  const body = await req.json() as CreateBody | undefined;
  const { shop_id, currency, identify } = body || {};
  if (!shop_id || !currency || !identify) {
    return NextResponse.json({ status: "error", result: { validation_error: "Address not created / currency not passed / shop_id not passed" } }, { status: 400 });
  }

  const uuid = genUuid32();
  const address = `static_${uuid.slice(0, 12)}`;

  try {
    const row = (await createWallet({ uuid, shop_id, currency, identify, address })) as WalletRow;
    const result = {
      currency: makeCurrencyObject(row?.currency),
      address: row?.address,
      uuid: row?.uuid,
      active: !!row?.active,
      identify: row?.identify,
      created: row?.created,
    };
    return NextResponse.json({ status: "success", result });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ status: "error", result: { validation_error: `Failed to create address: ${msg}` } }, { status: 400 });
  }
}