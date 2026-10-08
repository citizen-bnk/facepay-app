export interface Payee {
  id: string;
  name: string;
  icon: 'cart' | 'car' | 'speedometer' | 'basket' | 'flash' | 'water' | 'phone-portrait' | 'tv' | 'shield' | 'business' | 'person';
}

export const PAYEES: Payee[] = [
  { id: 'm_picknpay', name: 'Pick n Pay', icon: 'cart' },
  { id: 'm_uber', name: 'Uber', icon: 'car' },
  { id: 'm_bp', name: 'BP Fuel', icon: 'speedometer' },
  { id: 'm_checkers', name: 'Checkers', icon: 'basket' },
];

export const BILLERS: Payee[] = [
  { id: 'b_electricity', name: 'Electricity', icon: 'flash' },
  { id: 'b_water', name: 'Water & Rates', icon: 'water' },
  { id: 'b_airtime', name: 'Airtime & Data', icon: 'phone-portrait' },
  { id: 'b_tv', name: 'DStv & Streaming', icon: 'tv' },
  { id: 'b_insurance', name: 'Insurance', icon: 'shield' },
  { id: 'b_municipal', name: 'Municipal Fines', icon: 'business' },
];

export const RECIPIENTS: Payee[] = [
  { id: 'p_lerato', name: 'Lerato M.', icon: 'person' },
  { id: 'p_sipho', name: 'Sipho N.', icon: 'person' },
  { id: 'p_naledi', name: 'Naledi K.', icon: 'person' },
  { id: 'p_ayanda', name: 'Ayanda D.', icon: 'person' },
];

export function findPayee(id: string): Payee | undefined {
  return [...PAYEES, ...BILLERS, ...RECIPIENTS].find((p) => p.id === id);
}
