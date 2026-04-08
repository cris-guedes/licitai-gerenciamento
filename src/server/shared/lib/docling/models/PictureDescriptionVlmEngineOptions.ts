/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseVlmEngineOptions } from './BaseVlmEngineOptions';
import type { PictureClassificationLabel } from './PictureClassificationLabel';
import type { VlmModelSpec } from './VlmModelSpec';
/**
 * Configuration for VLM runtime-based picture description.
 *
 * This is the new implementation that uses the pluggable runtime system with preset support.
 * Supports all runtime types (Transformers, MLX, API, etc.) through the unified runtime interface.
 *
 * Use `from_preset()` to create instances from registered presets.
 *
 * Examples:
 * # Use preset with default runtime
 * options = PictureDescriptionVlmEngineOptions.from_preset("smolvlm")
 *
 * # Use preset with runtime override
 * from docling.datamodel.vlm_engine_options import MlxVlmEngineOptions, VlmEngineType
 * options = PictureDescriptionVlmEngineOptions.from_preset(
   * "smolvlm",
   * engine_options=MlxVlmEngineOptions(engine_type=VlmEngineType.MLX)
   * )
   */
  export type PictureDescriptionVlmEngineOptions = {
    /**
     * Number of images to process in a single batch during picture description. Higher values improve throughput but increase memory usage. Adjust based on available GPU/CPU memory.
     */
    batch_size?: number;
    /**
     * Scaling factor for image resolution before processing. Higher values (e.g., 2.0) provide more detail for the vision model but increase processing time and memory. Range: 0.5-4.0 typical.
     */
    scale?: number;
    /**
     * Minimum picture area as fraction of page area (0.0-1.0) to trigger description. Pictures smaller than this threshold are skipped. Use lower values (e.g., 0.01) to describe small images.
     */
    picture_area_threshold?: number;
    /**
     * List of picture classification labels to allow for description. Only pictures classified with these labels will be processed. If None, all picture types are allowed unless explicitly denied. Use to focus description on specific image types (e.g., diagrams, charts).
     */
    classification_allow?: (Array<PictureClassificationLabel> | null);
    /**
     * List of picture classification labels to exclude from description. Pictures classified with these labels will be skipped. If None, no picture types are denied unless not in allow list. Use to exclude unwanted image types (e.g., decorative images, logos).
     */
    classification_deny?: (Array<PictureClassificationLabel> | null);
    /**
     * Minimum classification confidence score (0.0-1.0) required for a picture to be processed. Pictures with classification confidence below this threshold are skipped. Higher values ensure only confidently classified images are described. Range: 0.0 (no filtering) to 1.0 (maximum confidence).
     */
    classification_min_confidence?: number;
    /**
     * Runtime configuration (transformers, mlx, api, etc.)
     */
    engine_options: BaseVlmEngineOptions;
    /**
     * Model specification with runtime-specific overrides
     */
    model_spec: VlmModelSpec;
    /**
     * Prompt template for the vision model. Customize to control description style, detail level, or focus.
     */
    prompt?: string;
    /**
     * Generation configuration for text generation. Controls output length, sampling strategy, temperature, etc.
     */
    generation_config?: Record<string, any>;
  };

