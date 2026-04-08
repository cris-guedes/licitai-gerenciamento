/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ClearResponse } from '../models/ClearResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class ClearService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Clear Converters
   * @returns ClearResponse Successful Response
   * @throws ApiError
   */
  public clearConvertersV1ClearConvertersGet(): CancelablePromise<ClearResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/v1/clear/converters',
    });
  }
  /**
   * Clear Results
   * @returns ClearResponse Successful Response
   * @throws ApiError
   */
  public clearResultsV1ClearResultsGet({
    olderThen = 3600,
  }: {
    olderThen?: number,
  }): CancelablePromise<ClearResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/v1/clear/results',
      query: {
        'older_then': olderThen,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }
}
