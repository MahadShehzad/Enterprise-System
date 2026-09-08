/** Clamp `page` to the valid range for `total` items at `size` per page. */
export function clampPage(page: number, total: number, size: number): number {
  const pages = Math.max(1, Math.ceil(total / size));
  return Math.min(Math.max(1, Math.trunc(page) || 1), pages);
}

/** Return the slice of `items` for the given 1-based `page`. */
export function paginate<T>(items: readonly T[], page: number, size: number): T[] {
  const p = clampPage(page, items.length, size);
  const start = (p - 1) * size;
  return items.slice(start, start + size);
}
