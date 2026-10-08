/** Format minor units (cents) as ZAR, e.g. 1245000 -> "R 12,450.00". */
export function formatZAR(minor: number, opts: { sign?: boolean; space?: boolean } = {}): string {
  const space = opts.space ?? true;
  const abs = Math.abs(Math.round(minor));
  const rands = Math.floor(abs / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const cents = (abs % 100).toString().padStart(2, '0');
  const body = `R${space ? ' ' : ''}${rands}.${cents}`;
  if (!opts.sign) return minor < 0 ? `-${body}` : body;
  return minor < 0 ? `-${body}` : `+${body}`;
}

export function toMinor(input: string): number {
  const clean = input.replace(/[^0-9.]/g, '');
  if (!clean) return 0;
  const [r, c = ''] = clean.split('.');
  return parseInt(r || '0', 10) * 100 + parseInt((c + '00').slice(0, 2), 10);
}

export function relativeDay(iso: string, now = new Date()): string {
  const d = new Date(iso);
  const hm = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (sameDay(d, now)) return `Today ${hm}`;
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  if (sameDay(d, y)) return 'Yesterday';
  return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
}
