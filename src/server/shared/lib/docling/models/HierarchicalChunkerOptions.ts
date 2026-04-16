/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Configuration options for the HierarchicalChunker.
 */
export type HierarchicalChunkerOptions = {
  chunker?: string;
  /**
   * Use markdown table format instead of triplets for table serialization.
   */
  use_markdown_tables?: boolean;
  /**
   * Include both raw_text and text (contextualized) in response. If False, only text is included.
   */
  include_raw_text?: boolean;
};

