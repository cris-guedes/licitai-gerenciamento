/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BoundingBox } from './BoundingBox';
/**
 * Provenance information for elements extracted from a textual document.
 *
 * A `ProvenanceItem` object acts as a lightweight pointer back into the original
 * document for an extracted element. It applies to documents with an explicity
 * or implicit layout, such as PDF, HTML, docx, or pptx.
 */
export type ProvenanceItem = {
  /**
   * Page number
   */
  page_no: number;
  /**
   * Bounding box
   */
  bbox: BoundingBox;
  /**
   * Character span (0-indexed)
   */
  charspan: any[];
};

