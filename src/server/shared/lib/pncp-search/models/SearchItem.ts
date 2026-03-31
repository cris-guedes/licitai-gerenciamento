/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Documento retornado pela busca
 */
export type SearchItem = {
  id?: string;
  title?: string;
  description?: string;
  item_url?: string;
  document_type?: string;
  createdAt?: string;
  ano?: string;
  numero_sequencial?: string;
  numero_controle_pncp?: string;
  orgao_id?: string;
  orgao_cnpj?: string;
  orgao_nome?: string;
  unidade_id?: string;
  unidade_nome?: string;
  esfera_id?: 'F' | 'E' | 'M' | 'D' | 'N';
  poder_id?: 'E' | 'L' | 'J' | 'N';
  municipio_id?: string;
  municipio_nome?: string;
  uf?: string;
  modalidade_licitacao_id?: string;
  modalidade_licitacao_nome?: string;
  situacao_id?: string;
  situacao_nome?: string;
  data_publicacao_pncp?: string;
  data_atualizacao_pncp?: string;
  data_inicio_vigencia?: string | null;
  data_fim_vigencia?: string | null;
  cancelado?: boolean;
  valor_global?: number | null;
  tem_resultado?: boolean;
  tipo_id?: string;
  tipo_nome?: string;
  exigencia_conteudo_nacional?: boolean;
};

