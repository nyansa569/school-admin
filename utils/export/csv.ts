// utils/export/csv.ts

export interface CSVColumn<T extends Record<string, any>> {
  header: string;
  accessor: keyof T | ((row: T) => unknown);
  formatter?: (value: unknown, row: T) => string;
}

export interface CSVExportOptions {
  filename?: string;
  delimiter?: string;
  includeHeaders?: boolean;
}

export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  columns: CSVColumn<T>[],
  options: CSVExportOptions = {}
): void {
  const {
    filename = `export-${new Date().toISOString().split('T')[0]}`,
    delimiter = ',',
    includeHeaders = true,
  } = options;

  if (!data?.length) {
    console.warn('No data to export');
    return;
  }

  const rows: string[][] = [];

  // Headers
  if (includeHeaders) {
    rows.push(columns.map(col => formatCSVCell(col.header)));
  }

  // Data rows
  for (const row of data) {
    const rowData: string[] = [];

    for (const col of columns) {
      let value: unknown;

      if (typeof col.accessor === 'function') {
        value = col.accessor(row);
      } else {
        value = row[col.accessor];
      }

      if (col.formatter) {
        value = col.formatter(value, row);
      }

      rowData.push(formatCSVCell(String(value ?? '')));
    }

    rows.push(rowData);
  }

  const csvContent = rows
    .map(row => row.join(delimiter))
    .join('\n');

  const blob = new Blob(
    [`\uFEFF${csvContent}`],
    { type: 'text/csv;charset=utf-8;' }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function formatCSVCell(value: string): string {
  if (
    value.includes(',') ||
    value.includes('\n') ||
    value.includes('"')
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}