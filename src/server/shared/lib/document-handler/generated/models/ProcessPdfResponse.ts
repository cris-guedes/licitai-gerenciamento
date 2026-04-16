/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SectionSchema } from './SectionSchema';
import type { TableSchema } from './TableSchema';
export type ProcessPdfResponse = {
  /**
   * Nome do arquivo processado
   */
  filename: string;
  /**
   * Timestamp do processamento
   */
  processed_at: string;
  /**
   * Tempo de processamento em milissegundos
   */
  processing_time_ms: number;
  /**
   * Tamanho do arquivo em bytes
   */
  file_size_bytes: number;
  /**
   * Total de páginas do PDF
   */
  total_pages: number;
  /**
   * Total de caracteres extraídos
   */
  total_chars: number;
  /**
   * Total de palavras extraídas
   */
  total_words: number;
  /**
   * Total de tabelas extraídas
   */
  total_tables: number;
  /**
   * Total de seções detectadas
   */
  total_sections: number;
  /**
   * Tabelas com seus chunks de linha
   */
  tables: Array<TableSchema>;
  /**
   * Seções do documento com chunks e metadados AST
   */
  sections: Array<SectionSchema>;
};

