/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class DefaultService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Openapi 30
   * @returns any Successful Response
   * @throws ApiError
   */
  public openapi30Openapi30JsonGet(): CancelablePromise<any> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/openapi-3.0.json',
    });
  }
}
