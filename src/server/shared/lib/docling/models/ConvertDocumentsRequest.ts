/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CallbackSpec } from './CallbackSpec';
import type { ConvertDocumentsRequestOptions } from './ConvertDocumentsRequestOptions';
import type { FileSourceRequest } from './FileSourceRequest';
import type { HttpSourceRequest } from './HttpSourceRequest';
import type { InBodyTarget } from './InBodyTarget';
import type { PutTarget } from './PutTarget';
import type { S3SourceRequest } from './S3SourceRequest';
import type { S3Target } from './S3Target';
import type { ZipTarget } from './ZipTarget';
export type ConvertDocumentsRequest = {
  options?: ConvertDocumentsRequestOptions;
  sources: Array<(FileSourceRequest | HttpSourceRequest | S3SourceRequest)>;
  target?: (InBodyTarget | ZipTarget | S3Target | PutTarget);
  callbacks?: Array<CallbackSpec>;
};

