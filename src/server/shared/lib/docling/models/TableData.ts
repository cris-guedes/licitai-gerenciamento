/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RichTableCell } from './RichTableCell';
import type { TableCell } from './TableCell';
/**
 * BaseTableData.
 */
export type TableData = {
  table_cells?: Array<(RichTableCell | TableCell)>;
  num_rows?: number;
  num_cols?: number;
  /**
   * grid.
   */
  readonly grid: Array<Array<TableCell>>;
};

