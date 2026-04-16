/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * A single chunk of a document with its metadata and content.
 */
export type ChunkedDocumentResultItem = {
  filename: string;
  chunk_index: number;
  /**
   * The chunk text with structural context (headers, formatting)
   */
  text: string;
  /**
   * Raw chunk text without additional formatting or context
   */
  raw_text?: (string | null);
  /**
   * Number of tokens in the text, if the chunker is aware of tokens
   */
  num_tokens?: (number | null);
  /**
   * List of headings for this chunk
   */
  headings?: (Array<string> | null);
  /**
   * List of captions for this chunk (e.g. for pictures and tables)
   */
  captions?: (Array<string> | null);
  /**
   * List of doc items references
   */
  doc_items: Array<string>;
  /**
   * Page numbers where this chunk content appears
   */
  page_numbers?: (Array<number> | null);
  /**
   * Additional metadata associated with this chunk
   */
  metadata?: (Record<string, any> | null);
};

