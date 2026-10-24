import { getCountries, getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';
export type { CountryCode } from 'libphonenumber-js';
const names = typeof Intl.DisplayNames === 'function' ? new Intl.DisplayNames(['en'], { type: 'region' }) : null;
export const PHONE_COUNTRIES = getCountries().map(code => ({ code, dial: '+' + getCountryCallingCode(code), name: names?.of(code) || code })).sort((a,b) => a.name.localeCompare(b.name));

export function normalisePhone(raw: string, country: CountryCode = 'ZA'): string | null {
  const cleaned = raw.trim().replace(/^00/, '+');
  if (!cleaned || /[a-z]/i.test(cleaned)) return null;
  const digits = cleaned.replace(/\D/g, '');
  if (!cleaned.startsWith('+') && digits.startsWith(getCountryCallingCode(country))) {
    const international = parsePhoneNumberFromString('+' + digits);
    if (international?.isValid() && international.country === country) return international.number;
  }
  const parsed = parsePhoneNumberFromString(cleaned, country);
  return parsed?.isValid() && !parsed.ext ? parsed.number : null;
}
export function phoneInputValue(raw: string, country: CountryCode) {
  const number = normalisePhone(raw, country);
  if (!number) return null;
  const parsed = parsePhoneNumberFromString(number)!;
  return { country: parsed.country || country, national: parsed.formatInternational().replace('+' + parsed.countryCallingCode, '').trim(), e164: number };
}
