/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PictureClassificationLabel } from './PictureClassificationLabel';
export type PictureDescriptionApi = {
  /**
   * Endpoint which accepts openai-api compatible requests.
   */
  url: string;
  /**
   * Headers used for calling the API endpoint. For example, it could include authentication headers.
   */
  headers?: Record<string, string>;
  /**
   * Model parameters.
   */
  params?: Record<string, any>;
  /**
   * Timeout for the API request.
   */
  timeout?: number;
  /**
   * Maximum number of concurrent requests to the API.
   */
  concurrency?: number;
  /**
   * Prompt used when calling the vision-language model.
   */
  prompt?: string;
  /**
   * Only describe pictures whose predicted class is in this allow-list.
   */
  classification_allow?: (Array<PictureClassificationLabel> | null);
  /**
   * Do not describe pictures whose predicted class is in this deny-list.
   */
  classification_deny?: (Array<PictureClassificationLabel> | null);
  /**
   * Minimum classification confidence required before a picture can be described.
   */
  classification_min_confidence?: number;
};

