/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GraphCellLabel } from './GraphCellLabel';
import type { ProvenanceItem } from './ProvenanceItem';
import type { RefItem } from './RefItem';
/**
 * GraphCell.
 */
export type GraphCell = {
  label: GraphCellLabel;
  cell_id: number;
  text: string;
  orig: string;
  prov?: (ProvenanceItem | null);
  item_ref?: (RefItem | null);
};

