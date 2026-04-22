/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_extract_tables_extract_tables_post } from '../models/Body_extract_tables_extract_tables_post';
import type { Body_extract_text_extract_text_post } from '../models/Body_extract_text_extract_text_post';
import type { Body_process_pdf_process_pdf_post } from '../models/Body_process_pdf_process_pdf_post';
import type { ExtractResponse } from '../models/ExtractResponse';
import type { ProcessPdfResponse } from '../models/ProcessPdfResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DefaultService {
  /**
   * Process Pdf
   * @returns ProcessPdfResponse Successful Response
   * @throws ApiError
   */
  public static processPdfProcessPdfPost({
    formData,
  }: {
    formData: Body_process_pdf_process_pdf_post,
  }): CancelablePromise<ProcessPdfResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/process-pdf',
      formData: formData,
      mediaType: 'multipart/form-data',
      errors: {
        422: `Validation Error`,
      },
    });
  }
  /**
   * Extract Tables
   * @returns ExtractResponse Successful Response
   * @throws ApiError
   */
  public static extractTablesExtractTablesPost({
    formData,
  }: {
    formData: Body_extract_tables_extract_tables_post,
  }): CancelablePromise<ExtractResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/extract-tables',
      formData: formData,
      mediaType: 'multipart/form-data',
      errors: {
        422: `Validation Error`,
      },
    });
  }
  /**
   * Extract Text
   * @returns ExtractResponse Successful Response
   * @throws ApiError
   */
  public static extractTextExtractTextPost({
    formData,
  }: {
    formData: Body_extract_text_extract_text_post,
  }): CancelablePromise<ExtractResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/extract-text',
      formData: formData,
      mediaType: 'multipart/form-data',
      errors: {
        422: `Validation Error`,
      },
    });
  }
}
