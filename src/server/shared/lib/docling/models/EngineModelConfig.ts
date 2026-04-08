/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Engine-specific model configuration.
 *
 * Allows overriding model settings for specific engines.
 * For example, MLX might use a different repo_id than Transformers.
 */
export type EngineModelConfig = {
  /**
   * Override model repository ID for this engine
   */
  repo_id?: (string | null);
  /**
   * Override model revision for this engine
   */
  revision?: (string | null);
  /**
   * Override torch dtype for this engine (e.g., 'bfloat16')
   */
  torch_dtype?: (string | null);
  /**
   * Additional engine-specific configuration
   */
  extra_config?: Record<string, any>;
};

