/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseMeta } from './BaseMeta';
import type { ContentLayer } from './ContentLayer';
import type { RefItem } from './RefItem';
/**
 * InlineGroup.
 */
export type InlineGroup = {
  self_ref: string;
  parent?: (RefItem | null);
  children?: Array<RefItem>;
  content_layer?: ContentLayer;
  meta?: (BaseMeta | null);
  name?: string;
  label?: string;
};

