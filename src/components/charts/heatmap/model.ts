import { parseCartesianValue } from "../_shared/cartesian";
import type { ChartDataItem } from "../_shared";
export interface HeatCell<T> {
  data: T | null;
  index: number | null;
  col: number;
  row: number;
  xLabel: string;
  yLabel: string;
  value: number | null;
  weight: number;
}
export function buildHeatmapModel<T extends ChartDataItem>(
  data: readonly T[],
  x: keyof T,
  y: keyof T,
  value: keyof T,
  stock: boolean,
  weight?: keyof T,
) {
  let error: string | null = null;
  const columns: string[] = [],
    rows: string[] = [];
  const colMap = new Map<string, number>(),
    rowMap = new Map<string, number>();
  const lookup = new Map<number, Map<number, HeatCell<T>>>();
  const observed: HeatCell<T>[] = [];
  function labelIndex(
    label: string,
    labels: string[],
    map: Map<string, number>,
  ) {
    if (!map.has(label)) {
      map.set(label, labels.length);
      labels.push(label);
    }
    return map.get(label)!;
  }
  data.forEach((item, index) => {
    if (item[x] == null || (!stock && item[y] == null))
      error ??= `Row ${index + 1}: provide labels for ${String(x)}${stock ? "" : ` and ${String(y)}`}.`;
    const xLabel = String(item[x] ?? ""),
      yLabel = stock ? "" : String(item[y] ?? "");
    const col = labelIndex(xLabel, columns, colMap),
      row = labelIndex(yLabel, rows, rowMap);
    const raw = item[value];
    const missing =
      raw == null || (typeof raw === "string" && raw.trim() === "");
    const parsed = missing ? null : parseCartesianValue(raw);
    if (!missing && parsed === null)
      error ??= `Row ${index + 1}: "${String(value)}" must be a finite number or an explicit missing value.`;
    const area =
      stock && weight !== undefined ? parseCartesianValue(item[weight]) : 1;
    if (area === null || area < 0)
      error ??= `Row ${index + 1}: "${String(weight)}" must contain a finite, nonnegative area weight.`;
    const cell = {
      data: item,
      index,
      col,
      row,
      xLabel,
      yLabel,
      value: parsed,
      weight: area ?? 0,
    };
    observed.push(cell);
    if (!stock) {
      const column = lookup.get(col) ?? new Map<number, HeatCell<T>>();
      if (column.has(row))
        error ??= `Rows ${column.get(row)!.index! + 1} and ${index + 1}: duplicate cell "${yLabel} / ${xLabel}". Aggregate duplicates before rendering.`;
      column.set(row, cell);
      lookup.set(col, column);
    }
  });
  if (!stock && columns.length * rows.length > 10000)
    error ??=
      "The matrix exceeds 10,000 cells, including missing combinations. Filter or aggregate categories before rendering.";
  const cells =
    stock || error
      ? observed
      : rows.flatMap((yLabel, row) =>
          columns.map(
            (xLabel, col) =>
              lookup.get(col)?.get(row) ?? {
                data: null,
                index: null,
                col,
                row,
                xLabel,
                yLabel,
                value: null,
                weight: 1,
              },
          ),
        );
  const values = observed.flatMap((cell) =>
    cell.value === null ? [] : [cell.value],
  );
  return {
    cells,
    columns,
    rows,
    values,
    error,
    missingCount: cells.filter((cell) => cell.value === null).length,
  };
}
