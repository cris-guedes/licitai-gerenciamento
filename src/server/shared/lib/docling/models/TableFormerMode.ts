/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Operating modes for TableFormer table structure extraction model.
 *
 * Controls the trade-off between processing speed and extraction accuracy.
 * Choose based on your performance requirements and document complexity.
 *
 * Attributes:
 * FAST: Fast mode prioritizes speed over precision. Suitable for simple tables or high-volume
 * processing.
 * ACCURATE: Accurate mode provides higher quality results with slower processing. Recommended for complex
 * tables and production use.
 */
export type TableFormerMode = 'fast' | 'accurate';
