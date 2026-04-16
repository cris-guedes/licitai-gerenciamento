/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SectionChunkSchema } from './SectionChunkSchema';
export type SectionSchema = {
  /**
   * Título da seção
   */
  header: string;
  /**
   * Profundidade do header (1=#, 2=##, etc.)
   */
  level: number;
  /**
   * Página onde a seção começa
   */
  page_start: number;
  /**
   * Chunks da seção prontos para embedding
   */
  chunks: Array<SectionChunkSchema>;
};

