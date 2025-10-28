import { NextResponse } from "next/server";
import { listWallets } from "../../../../../db/postgres";
import { makeCurrencyObject } from "../../../../_utils";
import type { ListWalletsResult, WalletRow } from "../types";

type ListBody = {
  shop_id?: string;
  offset?: number;
  limit?: number;
  start?: string;
  end?: string;
};

export async function POST(req: Request) {

  const body = await req.json() as ListBody | undefined;
  const { shop_id, offset = 0, limit = 100, start, end } = body || {};
  if (!shop_id) return NextResponse.json({ status: "error", result: { validation_error: "shop_id not passed" } }, { status: 400 });

  try {
    const { rows, all_count } = (await listWallets({ shop_id, offset, limit, start, end })) as unknown as ListWalletsResult;
    const staticWallets = (rows as WalletRow[]).map((r) => ({
      currency: makeCurrencyObject(r.currency),
      active: !!r.active,
      address: r.address,
      uuid: r.uuid,
    }));
    return NextResponse.json({ status: "success", result: { staticWallets, all_count } });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ status: "error", result: { validation_error: `Failed to list: ${msg}` } }, { status: 400 });
  }
}
