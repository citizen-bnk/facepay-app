export interface QrPayload {
  merchantId: string;
  merchantName: string;
  amountMinor?: number;
}

/**
 * Parses a FacePay merchant QR. Supported:
 *   facepay://pay?merchant=m_picknpay&name=Pick%20n%20Pay&amount=250.00
 *   {"merchantId":"m_x","merchantName":"X","amountMinor":2500}
 * Returns null for anything else (we never guess a payee).
 */
export function parseQr(data: string): QrPayload | null {
  const s = data.trim();
  try {
    if (s.startsWith('{')) {
      const j = JSON.parse(s);
      if (typeof j.merchantId === 'string' && j.merchantId) {
        return {
          merchantId: j.merchantId,
          merchantName: String(j.merchantName ?? j.merchantId),
          amountMinor: Number.isInteger(j.amountMinor) && j.amountMinor > 0 ? j.amountMinor : undefined,
        };
      }
      return null;
    }
    const m = s.match(/^facepay:\/\/pay\?(.*)$/i);
    if (!m) return null;
    const p = new URLSearchParams(m[1]);
    const id = p.get('merchant');
    if (!id) return null;
    const amt = p.get('amount');
    const minor = amt && /^\d+(\.\d{1,2})?$/.test(amt) ? Math.round(parseFloat(amt) * 100) : undefined;
    return { merchantId: id, merchantName: p.get('name') ?? id, amountMinor: minor && minor > 0 ? minor : undefined };
  } catch {
    return null;
  }
}

export const DEMO_QR = 'facepay://pay?merchant=m_picknpay&name=Pick%20n%20Pay&amount=250.00';
