/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseVlmEngineOptions } from './BaseVlmEngineOptions';
import type { VlmModelSpec } from './VlmModelSpec';
/**
 * Configuration for VLM-based code and formula extraction.
 *
 * This stage uses vision-language models to extract code blocks and
 * mathematical formulas from document images. Supports preset-based
 * configuration via StagePresetMixin.
 *
 * Examples:
 * # Use CodeFormulaV2 preset
 * options = CodeFormulaVlmOptions.from_preset("codeformulav2")
 *
 * # Use Granite Docling preset
 * options = CodeFormulaVlmOptions.from_preset("granite_docling")
 */
export type CodeFormulaVlmOptions = {
  /**
   * Runtime configuration (transformers, mlx, api, etc.)
   */
  engine_options: BaseVlmEngineOptions;
  /**
   * Model specification with runtime-specific overrides
   */
  model_spec: VlmModelSpec;
  /**
   * Image scaling factor for preprocessing
   */
  scale?: number;
  /**
   * Maximum image dimension (width or height)
   */
  max_size?: (number | null);
  /**
   * Extract code blocks
   */
  extract_code?: boolean;
  /**
   * Extract mathematical formulas
   */
  extract_formulas?: boolean;
};

