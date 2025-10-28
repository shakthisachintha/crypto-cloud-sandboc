export type WalletRow = {
  uuid: string;
  shop_id?: string | null;
  currency: string;
  identify?: string | null;
  address: string;
  active?: boolean | null;
  created?: string | Date | null;
};

export type ListWalletsResult = {
  rows: WalletRow[];
  all_count: number;
};
