/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_Chunk_files_with_HierarchicalChunker_as_async_task_v1_chunk_hierarchical_file_async_post } from '../models/Body_Chunk_files_with_HierarchicalChunker_as_async_task_v1_chunk_hierarchical_file_async_post';
import type { Body_Chunk_files_with_HierarchicalChunker_v1_chunk_hierarchical_file_post } from '../models/Body_Chunk_files_with_HierarchicalChunker_v1_chunk_hierarchical_file_post';
import type { Body_Chunk_files_with_HybridChunker_as_async_task_v1_chunk_hybrid_file_async_post } from '../models/Body_Chunk_files_with_HybridChunker_as_async_task_v1_chunk_hybrid_file_async_post';
import type { Body_Chunk_files_with_HybridChunker_v1_chunk_hybrid_file_post } from '../models/Body_Chunk_files_with_HybridChunker_v1_chunk_hybrid_file_post';
import type { ChunkDocumentResponse } from '../models/ChunkDocumentResponse';
import type { HierarchicalChunkerOptionsDocumentsRequest } from '../models/HierarchicalChunkerOptionsDocumentsRequest';
import type { HybridChunkerOptionsDocumentsRequest } from '../models/HybridChunkerOptionsDocumentsRequest';
import type { TaskStatusResponse } from '../models/TaskStatusResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class ChunkService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Chunk Sources With Hybridchunker As Async Task
   * @returns TaskStatusResponse Successful Response
   * @throws ApiError
   */
  public chunkSourcesWithHybridChunkerAsAsyncTaskV1ChunkHybridSourceAsyncPost({
    requestBody,
    xTenantId,
  }: {
    requestBody: HybridChunkerOptionsDocumentsRequest,
    xTenantId?: (string | null),
  }): CancelablePromise<TaskStatusResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/chunk/hybrid/source/async',
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
   * Chunk Files With Hybridchunker As Async Task
   * @returns TaskStatusResponse Successful Response
   * @throws ApiError
   */
  public chunkFilesWithHybridChunkerAsAsyncTaskV1ChunkHybridFileAsyncPost({
    formData,
    xTenantId,
  }: {
    formData: Body_Chunk_files_with_HybridChunker_as_async_task_v1_chunk_hybrid_file_async_post,
    xTenantId?: (string | null),
  }): CancelablePromise<TaskStatusResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/chunk/hybrid/file/async',
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
   * Chunk Sources With Hybridchunker
   * @returns ChunkDocumentResponse Successful Response
   * @throws ApiError
   */
  public chunkSourcesWithHybridChunkerV1ChunkHybridSourcePost({
    requestBody,
    xTenantId,
  }: {
    requestBody: HybridChunkerOptionsDocumentsRequest,
    xTenantId?: (string | null),
  }): CancelablePromise<ChunkDocumentResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/chunk/hybrid/source',
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
   * Chunk Files With Hybridchunker
   * @returns ChunkDocumentResponse Successful Response
   * @throws ApiError
   */
  public chunkFilesWithHybridChunkerV1ChunkHybridFilePost({
    formData,
    xTenantId,
  }: {
    formData: Body_Chunk_files_with_HybridChunker_v1_chunk_hybrid_file_post,
    xTenantId?: (string | null),
  }): CancelablePromise<ChunkDocumentResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/chunk/hybrid/file',
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
   * Chunk Sources With Hierarchicalchunker As Async Task
   * @returns TaskStatusResponse Successful Response
   * @throws ApiError
   */
  public chunkSourcesWithHierarchicalChunkerAsAsyncTaskV1ChunkHierarchicalSourceAsyncPost({
    requestBody,
    xTenantId,
  }: {
    requestBody: HierarchicalChunkerOptionsDocumentsRequest,
    xTenantId?: (string | null),
  }): CancelablePromise<TaskStatusResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/chunk/hierarchical/source/async',
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
   * Chunk Files With Hierarchicalchunker As Async Task
   * @returns TaskStatusResponse Successful Response
   * @throws ApiError
   */
  public chunkFilesWithHierarchicalChunkerAsAsyncTaskV1ChunkHierarchicalFileAsyncPost({
    formData,
    xTenantId,
  }: {
    formData: Body_Chunk_files_with_HierarchicalChunker_as_async_task_v1_chunk_hierarchical_file_async_post,
    xTenantId?: (string | null),
  }): CancelablePromise<TaskStatusResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/chunk/hierarchical/file/async',
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
   * Chunk Sources With Hierarchicalchunker
   * @returns ChunkDocumentResponse Successful Response
   * @throws ApiError
   */
  public chunkSourcesWithHierarchicalChunkerV1ChunkHierarchicalSourcePost({
    requestBody,
    xTenantId,
  }: {
    requestBody: HierarchicalChunkerOptionsDocumentsRequest,
    xTenantId?: (string | null),
  }): CancelablePromise<ChunkDocumentResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/chunk/hierarchical/source',
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
   * Chunk Files With Hierarchicalchunker
   * @returns ChunkDocumentResponse Successful Response
   * @throws ApiError
   */
  public chunkFilesWithHierarchicalChunkerV1ChunkHierarchicalFilePost({
    formData,
    xTenantId,
  }: {
    formData: Body_Chunk_files_with_HierarchicalChunker_v1_chunk_hierarchical_file_post,
    xTenantId?: (string | null),
  }): CancelablePromise<ChunkDocumentResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/v1/chunk/hierarchical/file',
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
