export function genUuid32() {
  const b = new Uint8Array(16);
  // Use Node/Bun crypto if available, fallback to Math.random
  if (typeof crypto !== "undefined" && (crypto as any).getRandomValues) {
    (crypto as any).getRandomValues(b);
  } else {
    for (let i = 0; i < b.length; i++) b[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(b)
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

export function makeCurrencyObject(code: string) {
  const _code = code || "";
  const base = (_code.split("_")[0] || _code).toUpperCase();
  return {
    id: Math.abs(hashCode(_code)) % 1000 + 1,
    code: _code,
    short_code: base,
    name: _code,
    is_email_required: false,
    stablecoin: _code.includes("USDT") || _code.includes("USDC"),
    icon_base: `https://cdn.cryptocloud.plus/currency/icons/main/${_code.toLowerCase()}.svg`,
    icon_network: null,
    icon_qr: `https://cdn.cryptocloud.plus/currency/icons/stroke/${_code.toLowerCase()}.svg`,
    order: 0,
    obj_network: {
      code: _code.includes("TRC20") ? "TRC20" : _code.includes("ERC20") ? "ERC20" : "None",
      id: 1,
      icon: `https://cdn.cryptocloud.plus/currency/crypto/${base}.svg`,
      fullname: _code,
    },
    enable: true,
  };
}

function hashCode(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h;
}