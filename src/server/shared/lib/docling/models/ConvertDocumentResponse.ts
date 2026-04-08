/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ConversionStatus } from './ConversionStatus';
import type { ErrorItem } from './ErrorItem';
import type { ExportDocumentResponse } from './ExportDocumentResponse';
import type { ProfilingItem } from './ProfilingItem';
export type ConvertDocumentResponse = {
  document: ExportDocumentResponse;
  status: ConversionStatus;
  errors?: Array<ErrorItem>;
  processing_time: number;
  timings?: Record<string, ProfilingItem>;
};

