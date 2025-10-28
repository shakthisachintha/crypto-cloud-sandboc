import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL || process.env.PGCONNSTR || "";

console.log("Using DATABASE_URL:", DATABASE_URL ? DATABASE_URL.replace(/(\/\/.+:).+(@.+)/, "$1****$2") : "not set");

if (!DATABASE_URL) {
    console.warn("Warning: DATABASE_URL is not set. The server will still start but DB operations will fail until you set DATABASE_URL to your Supabase/Postgres connection string.");
}

// create a client using the 'postgres' library which works well in Bun
export const sql = postgres(DATABASE_URL, { max: 10, ssl: { rejectUnauthorized: false } });

export async function createWallet({ uuid, shop_id, currency, identify, address }: {
    uuid: string;
    shop_id: string;
    currency: string;
    identify: string;
    address: string;
}) {
    const res = await sql`
    INSERT INTO static_wallets (uuid, shop_id, currency, identify, address)
    VALUES (${uuid}, ${shop_id}, ${currency}, ${identify}, ${address})
    RETURNING *
  `;
    return res[0];
}

export async function listWallets({ shop_id, offset = 0, limit = 100, start, end }: {
    shop_id: string;
    offset?: number;
    limit?: number;
    start?: string;
    end?: string;
}) {
    // base filter
    let where = sql`shop_id = ${shop_id}`;
    if (start) where = sql`${where} AND created >= ${start}`;
    if (end) where = sql`${where} AND created <= ${end}`;

    const countRes = await sql`
    SELECT COUNT(*) AS c FROM static_wallets WHERE ${where}
  `;
    const all_count = Number(countRes[0]?.c ?? 0);

    const rows = await sql`
    SELECT * FROM static_wallets WHERE ${where}
    ORDER BY created DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

    return { rows, all_count };
}

export async function getWalletByUuid(uuid: string) {
    const res = await sql`SELECT * FROM static_wallets WHERE uuid = ${uuid} LIMIT 1`;
    return res[0];
}

export async function updateActive(uuid: string, active: boolean) {
    const res = await sql`
    UPDATE static_wallets SET active = ${active} WHERE uuid = ${uuid} RETURNING *
  `;
    return res[0];
}
