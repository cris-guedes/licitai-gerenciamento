/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CallbackSpec } from './CallbackSpec';
import type { ConvertDocumentsRequestOptions } from './ConvertDocumentsRequestOptions';
import type { FileSourceRequest } from './FileSourceRequest';
import type { HttpSourceRequest } from './HttpSourceRequest';
import type { HybridChunkerOptions } from './HybridChunkerOptions';
import type { InBodyTarget } from './InBodyTarget';
import type { PutTarget } from './PutTarget';
import type { S3SourceRequest } from './S3SourceRequest';
import type { S3Target } from './S3Target';
import type { ZipTarget } from './ZipTarget';
export type HybridChunkerOptionsDocumentsRequest = {
  /**
   * Conversion options.
   */
  convert_options?: ConvertDocumentsRequestOptions;
  /**
   * List of input document sources to process.
   */
  sources: Array<(FileSourceRequest | HttpSourceRequest | S3SourceRequest)>;
  /**
   * If true, the output will include both the chunks and the converted document.
   */
  include_converted_doc?: boolean;
  /**
   * Specification for the type of output target.
   */
  target?: (InBodyTarget | ZipTarget | S3Target | PutTarget);
  callbacks?: Array<CallbackSpec>;
  /**
   * Options specific to the chunker.
   */
  chunking_options?: HybridChunkerOptions;
};

