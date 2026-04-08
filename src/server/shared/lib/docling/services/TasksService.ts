/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChunkDocumentResponse } from '../models/ChunkDocumentResponse';
import type { ConvertDocumentResponse } from '../models/ConvertDocumentResponse';
import type { PresignedUrlConvertDocumentResponse } from '../models/PresignedUrlConvertDocumentResponse';
import type { TaskStatusResponse } from '../models/TaskStatusResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class TasksService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Task Status Poll
   * @returns TaskStatusResponse Successful Response
   * @throws ApiError
   */
  public taskStatusPollV1StatusPollTaskIdGet({
    taskId,
    wait,
  }: {
    taskId: string,
    /**
     * Number of seconds to wait for a completed status.
     */
    wait?: number,
  }): CancelablePromise<TaskStatusResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/v1/status/poll/{task_id}',
      path: {
        'task_id': taskId,
      },
      query: {
        'wait': wait,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }
  /**
   * Task Result
   * @returns any Successful Response
   * @throws ApiError
   */
  public taskResultV1ResultTaskIdGet({
    taskId,
  }: {
    taskId: string,
  }): CancelablePromise<(ConvertDocumentResponse | PresignedUrlConvertDocumentResponse | ChunkDocumentResponse)> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/v1/result/{task_id}',
      path: {
        'task_id': taskId,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }
}
