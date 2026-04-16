/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseVlmEngineOptions } from './BaseVlmEngineOptions';
import type { VlmModelSpec } from './VlmModelSpec';
/**
 * Configuration for VLM-based document conversion.
 *
 * This stage uses vision-language models to convert document pages to
 * structured formats (DocTags, Markdown, etc.). Supports preset-based
 * configuration via StagePresetMixin.
 *
 * Examples:
 * # Use preset with default runtime
 * options = VlmConvertOptions.from_preset("smoldocling")
 *
 * # Use preset with runtime override
 * from docling.datamodel.vlm_engine_options import ApiVlmEngineOptions, VlmEngineType
 * options = VlmConvertOptions.from_preset(
   * "smoldocling",
   * engine_options=ApiVlmEngineOptions(engine_type=VlmEngineType.API_OLLAMA)
   * )
   */
  export type VlmConvertOptions = {
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
     * Batch size for processing multiple pages
     */
    batch_size?: number;
    /**
     * Force use of backend text extraction instead of VLM
     */
    force_backend_text?: boolean;
  };

