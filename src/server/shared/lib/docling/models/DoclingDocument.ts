/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CodeItem } from './CodeItem';
import type { DocumentOrigin } from './DocumentOrigin';
import type { FormItem } from './FormItem';
import type { FormulaItem } from './FormulaItem';
import type { GroupItem } from './GroupItem';
import type { InlineGroup } from './InlineGroup';
import type { KeyValueItem } from './KeyValueItem';
import type { ListGroup } from './ListGroup';
import type { ListItem } from './ListItem';
import type { PageItem } from './PageItem';
import type { PictureItem } from './PictureItem';
import type { SectionHeaderItem } from './SectionHeaderItem';
import type { TableItem } from './TableItem';
import type { TextItem } from './TextItem';
import type { TitleItem } from './TitleItem';
/**
 * DoclingDocument.
 */
export type DoclingDocument = {
  schema_name?: string;
  version?: string;
  name: string;
  origin?: (DocumentOrigin | null);
  /**
   * @deprecated
   */
  furniture?: GroupItem;
  body?: GroupItem;
  groups?: Array<(ListGroup | InlineGroup | GroupItem)>;
  texts?: Array<(TitleItem | SectionHeaderItem | ListItem | CodeItem | FormulaItem | TextItem)>;
  pictures?: Array<PictureItem>;
  tables?: Array<TableItem>;
  key_value_items?: Array<KeyValueItem>;
  form_items?: Array<FormItem>;
  pages?: Record<string, PageItem>;
};

