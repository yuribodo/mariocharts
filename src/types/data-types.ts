export interface ChartDataPoint {
  readonly [key: string]: unknown;
}

export interface TimeSeriesDataPoint extends ChartDataPoint {
  readonly date: string | Date;
  readonly value: number;
}

export interface CategoryDataPoint extends ChartDataPoint {
  readonly name: string;
  readonly value: number;
  readonly category?: string;
}

export interface KPIData {
  readonly title: string;
  readonly value: string | number;
  readonly change?: {
    readonly value: number;
    readonly type: "increase" | "decrease";
    readonly period?: string;
  };
  readonly sparkline?: {
    readonly data: readonly number[];
    readonly type: "line" | "bar" | "area";
  };
  readonly target?: number;
  readonly unit?: string;
  readonly icon?: React.ReactNode;
}

export interface FilterState {
  readonly [key: string]: unknown;
}

export interface SortConfig<T> {
  readonly key: keyof T;
  readonly direction: "asc" | "desc";
}

export interface PaginationConfig {
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
}

export interface DataTableColumn<T> {
  readonly key: keyof T;
  readonly title: string;
  readonly sortable?: boolean;
  readonly filterable?: boolean;
  readonly width?: string;
  readonly align?: "left" | "center" | "right";
  readonly render?: (value: T[keyof T], record: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T extends Record<string, unknown>> {
  readonly data: readonly T[];
  readonly columns: readonly DataTableColumn<T>[];
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly pagination?: PaginationConfig;
  readonly sorting?: SortConfig<T>;
  readonly filters?: FilterState;
  readonly onSort?: (config: SortConfig<T>) => void;
  readonly onFilter?: (filters: FilterState) => void;
  readonly onPageChange?: (page: number) => void;
  readonly className?: string;
}