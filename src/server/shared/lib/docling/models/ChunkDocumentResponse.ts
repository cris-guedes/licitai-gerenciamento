/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChunkedDocumentResultItem } from './ChunkedDocumentResultItem';
import type { ExportResult } from './ExportResult';
export type ChunkDocumentResponse = {
  chunks: Array<ChunkedDocumentResultItem>;
  documents: Array<ExportResult>;
  processing_time: number;
};

