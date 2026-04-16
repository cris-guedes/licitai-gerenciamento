/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { HealthCheckResponse } from '../models/HealthCheckResponse';
import type { ReadinessResponse } from '../models/ReadinessResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class HealthService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Health
   * @returns HealthCheckResponse Successful Response
   * @throws ApiError
   */
  public healthHealthGet(): CancelablePromise<HealthCheckResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/health',
    });
  }
  /**
   * Readiness
   * @returns ReadinessResponse Successful Response
   * @throws ApiError
   */
  public readinessReadyGet(): CancelablePromise<ReadinessResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/ready',
    });
  }
  /**
   * Version Info
   * @returns any Successful Response
   * @throws ApiError
   */
  public versionInfoVersionGet(): CancelablePromise<Record<string, any>> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/version',
    });
  }
}
