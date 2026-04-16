/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Configuration options for the HybridChunker.
 */
export type HybridChunkerOptions = {
  chunker?: string;
  /**
   * Use markdown table format instead of triplets for table serialization.
   */
  use_markdown_tables?: boolean;
  /**
   * Include both raw_text and text (contextualized) in response. If False, only text is included.
   */
  include_raw_text?: boolean;
  /**
   * Maximum number of tokens per chunk. When left to none, the value is automatically extracted from the tokenizer.
   */
  max_tokens?: (number | null);
  /**
   * HuggingFace model name for custom tokenization. If not specified, uses 'sentence-transformers/all-MiniLM-L6-v2' as default.
   */
  tokenizer?: string;
  /**
   * Merge undersized successive chunks with same headings.
   */
  merge_peers?: boolean;
};

