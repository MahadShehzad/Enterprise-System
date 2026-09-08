/** "PKR 340,000" style formatting for the demo. */
export function money(amount: number): string {
  return 'PKR ' + Math.round(amount).toLocaleString('en-PK');
}

/** "12 Sep 2026" from an ISO yyyy-mm-dd string. */
export function prettyDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
