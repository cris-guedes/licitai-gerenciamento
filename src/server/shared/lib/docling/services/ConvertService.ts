/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_process_file_async_v1_convert_file_async_post } from '../models/Body_process_file_async_v1_convert_file_async_post';
import type { Body_process_file_v1_convert_file_post } from '../models/Body_process_file_v1_convert_file_post';
import type { ConvertDocumentResponse } from '../models/ConvertDocumentResponse';
import type { ConvertDocumentsRequest } from '../models/ConvertDocumentsRequest';
import type { PresignedUrlConvertDocumentResponse } from '../models/PresignedUrlConvertDocumentResponse';
import type { TaskStatusResponse } from '../models/TaskStatusResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class ConvertService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Process Url
   * @returns any Successful Response
   * @throws ApiError
   */
  public processUrlV1ConvertSourcePost({
    requestBody,
    xTenantId,
  }: {
    requestBody: ConvertDocumentsRequest,
    xTenantId?: (string | null),
  }): CancelablePromise<(ConvertDocumentResponse | PresignedUrlConvertDocumentResponse)> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/convert/source',
      headers: {
        'X-Tenant-Id': xTenantId,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    });
  }
  /**
   * Process File
   * @returns any Successful Response
   * @throws ApiError
   */
  public processFileV1ConvertFilePost({
    formData,
    xTenantId,
  }: {
    formData: Body_process_file_v1_convert_file_post,
    xTenantId?: (string | null),
  }): CancelablePromise<(ConvertDocumentResponse | PresignedUrlConvertDocumentResponse)> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/convert/file',
      headers: {
        'X-Tenant-Id': xTenantId,
      },
      formData: formData,
      mediaType: 'multipart/form-data',
      errors: {
        422: `Validation Error`,
      },
    });
  }
  /**
   * Process Url Async
   * @returns TaskStatusResponse Successful Response
   * @throws ApiError
   */
  public processUrlAsyncV1ConvertSourceAsyncPost({
    requestBody,
    xTenantId,
  }: {
    requestBody: ConvertDocumentsRequest,
    xTenantId?: (string | null),
  }): CancelablePromise<TaskStatusResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/convert/source/async',
      headers: {
        'X-Tenant-Id': xTenantId,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    });
  }
  /**
   * Process File Async
   * @returns TaskStatusResponse Successful Response
   * @throws ApiError
   */
  public processFileAsyncV1ConvertFileAsyncPost({
    formData,
    xTenantId,
  }: {
    formData: Body_process_file_async_v1_convert_file_async_post,
    xTenantId?: (string | null),
  }): CancelablePromise<TaskStatusResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/convert/file/async',
      headers: {
        'X-Tenant-Id': xTenantId,
      },
      formData: formData,
      mediaType: 'multipart/form-data',
      errors: {
        422: `Validation Error`,
      },
    });
  }
}
