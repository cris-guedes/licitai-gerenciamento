/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type TableChunkSchema = {
  /**
   * Índice da linha na tabela
   */
  row_index: number;
  /**
   * Par índice_coluna→valor (0, 1, 2...) — unidade para embedding
   */
  data: Record<string, string>;
};

