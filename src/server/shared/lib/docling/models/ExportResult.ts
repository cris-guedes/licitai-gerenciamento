/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ConversionStatus } from './ConversionStatus';
import type { ErrorItem } from './ErrorItem';
import type { ExportDocumentResponse } from './ExportDocumentResponse';
import type { ProfilingItem } from './ProfilingItem';
/**
 * Container of all exported content.
 */
export type ExportResult = {
  kind?: string;
  content: ExportDocumentResponse;
  status: ConversionStatus;
  errors?: Array<ErrorItem>;
  timings?: Record<string, ProfilingItem>;
};

