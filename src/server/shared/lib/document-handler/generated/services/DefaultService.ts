/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_process_pdf_process_pdf_post } from '../models/Body_process_pdf_process_pdf_post';
import type { ProcessPdfResponse } from '../models/ProcessPdfResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DefaultService {
  /**
   * Processa um PDF
   * Extrai texto (por página) e tabelas (em markdown) de um arquivo PDF, removendo headers, footers e tabelas template.
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
}
