/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiModelConfig } from './ApiModelConfig';
import type { EngineModelConfig } from './EngineModelConfig';
import type { ResponseFormat } from './ResponseFormat';
import type { VlmEngineType } from './VlmEngineType';
/**
 * Specification for a VLM model.
 *
 * This defines the model configuration that is independent of the engine.
 * It includes:
 * - Default model repository ID
 * - Prompt template
 * - Response format
 * - Engine-specific overrides
 */
export type VlmModelSpec = {
  /**
   * Human-readable model name
   */
  name: string;
  /**
   * Default HuggingFace repository ID
   */
  default_repo_id: string;
  /**
   * Default model revision
   */
  revision?: string;
  /**
   * Prompt template for this model
   */
  prompt: string;
  /**
   * Expected response format from the model
   */
  response_format: ResponseFormat;
  /**
   * Set of supported engines (None = all supported)
   */
  supported_engines?: (Array<VlmEngineType> | null);
  /**
   * Engine-specific configuration overrides
   */
  engine_overrides?: Record<string, EngineModelConfig>;
  /**
   * API-specific configuration overrides
   */
  api_overrides?: Record<string, ApiModelConfig>;
  /**
   * Whether to trust remote code for this model
   */
  trust_remote_code?: boolean;
  /**
   * Stop strings for generation
   */
  stop_strings?: Array<string>;
  /**
   * Maximum number of new tokens to generate
   */
  max_new_tokens?: number;
};

