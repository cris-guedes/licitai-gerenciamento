/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseMeta } from './BaseMeta';
import type { ContentLayer } from './ContentLayer';
import type { GroupLabel } from './GroupLabel';
import type { RefItem } from './RefItem';
/**
 * GroupItem.
 */
export type GroupItem = {
  self_ref: string;
  parent?: (RefItem | null);
  children?: Array<RefItem>;
  content_layer?: ContentLayer;
  meta?: (BaseMeta | null);
  name?: string;
  label?: GroupLabel;
};

