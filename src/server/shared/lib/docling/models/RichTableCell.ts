/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BoundingBox } from './BoundingBox';
import type { RefItem } from './RefItem';
/**
 * RichTableCell.
 */
export type RichTableCell = {
  bbox?: (BoundingBox | null);
  row_span?: number;
  col_span?: number;
  start_row_offset_idx: number;
  end_row_offset_idx: number;
  start_col_offset_idx: number;
  end_col_offset_idx: number;
  text: string;
  column_header?: boolean;
  row_header?: boolean;
  row_section?: boolean;
  fillable?: boolean;
  ref: RefItem;
};

