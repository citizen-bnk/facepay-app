/**
 * Phone OTP adapter (STUB). There is no SMS provider wired up: the demo code is 123456.
 * Replace `requestOtp`/`verifyOtp` with a real SMS/verification service before production.
 */
export const DEMO_OTP = '123456';

export function normalisePhone(raw: string): string | null {
  const d = raw.replace(/[^\d+]/g, '');
  if (/^\+27\d{9}$/.test(d)) return d;
  if (/^0\d{9}$/.test(d)) return '+27' + d.slice(1);
  if (/^27\d{9}$/.test(d)) return '+' + d;
  return null;
}

export async function requestOtp(_phone: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 400));
}

export async function verifyOtp(_phone: string, code: string): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 400));
  return code === DEMO_OTP;
}
