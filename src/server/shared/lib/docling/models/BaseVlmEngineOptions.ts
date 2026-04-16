/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { VlmEngineType } from './VlmEngineType';
/**
 * Base configuration for VLM inference engines.
 *
 * Engine options are independent of model specifications and prompts.
 * They only control how the inference is executed.
 */
export type BaseVlmEngineOptions = {
  /**
   * Type of inference engine to use
   */
  engine_type: VlmEngineType;
};

