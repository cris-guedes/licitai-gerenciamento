/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { schemas__process_pdf_schema__ChunkMetadataSchema } from './schemas__process_pdf_schema__ChunkMetadataSchema';
export type SectionChunkSchema = {
  /**
   * Ordem do chunk dentro da seção
   */
  order: number;
  /**
   * Header da seção — contexto do chunk para embedding
   */
  header: string;
  /**
   * Texto do chunk
   */
  text: string;
  /**
   * Metadados extraídos via AST
   */
  metadata: schemas__process_pdf_schema__ChunkMetadataSchema;
};

