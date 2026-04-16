/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TableChunkSchema } from './TableChunkSchema';
export type TableSchema = {
  /**
   * Página onde a tabela foi encontrada
   */
  page: number;
  /**
   * Índice da tabela dentro da página
   */
  index: number;
  /**
   * Tabela completa em markdown
   */
  markdown: string;
  /**
   * Número de linhas
   */
  rows: number;
  /**
   * Número de colunas
   */
  cols: number;
  /**
   * Cabeçalhos da tabela
   */
  headers: Array<string>;
  /**
   * Linhas da tabela prontas para embedding
   */
  chunks: Array<TableChunkSchema>;
};

