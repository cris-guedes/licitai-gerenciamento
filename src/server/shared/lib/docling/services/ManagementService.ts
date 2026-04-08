/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class ManagementService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Memory Stats
   * @returns any Successful Response
   * @throws ApiError
   */
  public memoryStatsV1MemoryStatsGet(): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/v1/memory/stats',
    });
  }
  /**
   * Memory Counts
   * @returns any Successful Response
   * @throws ApiError
   */
  public memoryCountsV1MemoryCountsGet(): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/v1/memory/counts',
    });
  }
}
