/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Available document processing pipeline types for different use cases.
 *
 * Each pipeline is optimized for specific document types and processing requirements.
 * Select the appropriate pipeline based on your input format and desired output.
 *
 * Attributes:
 * LEGACY: Legacy pipeline for backward compatibility with older document processing workflows.
 * STANDARD: Standard pipeline for general document processing (PDF, DOCX, images, etc.) with layout analysis.
 * VLM: Vision-Language Model pipeline for advanced document understanding using multimodal AI models.
 * ASR: Automatic Speech Recognition pipeline for audio and video transcription to text.
 */
export type ProcessingPipeline = 'legacy' | 'standard' | 'vlm' | 'asr';
