/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChunkMetadataSchema } from './ChunkMetadataSchema';
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
  metadata: ChunkMetadataSchema;
};

