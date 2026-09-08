export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number;
}

function escapeCell(input: string | number): string {
  const s = String(input ?? '');
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Build a CSV string from rows + column definitions. */
export function toCsv<T>(rows: readonly T[], columns: readonly CsvColumn<T>[]): string {
  const head = columns.map((c) => escapeCell(c.header)).join(',');
  const body = rows
    .map((row) => columns.map((c) => escapeCell(c.value(row))).join(','))
    .join('\r\n');
  return body ? `${head}\r\n${body}` : head;
}

/**
 * Trigger a real browser download of `content` as `filename`.
 * Uses a Blob + object URL + temporary anchor, then revokes the URL.
 */
export function downloadCsv(filename: string, content: string): void {
  try {
    const blob = new Blob(['﻿' + content], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch {
    /* download unavailable in this environment */
  }
}

/** Convenience: build + download in one call. */
export function exportCsv<T>(
  filename: string,
  rows: readonly T[],
  columns: readonly CsvColumn<T>[],
): void {
  downloadCsv(filename, toCsv(rows, columns));
}
