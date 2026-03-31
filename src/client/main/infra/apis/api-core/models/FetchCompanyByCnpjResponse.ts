/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type FetchCompanyByCnpjResponse = {
  /**
   * CNPJ formatado
   */
  cnpj?: string;
  /**
   * Razão social da empresa
   */
  razao_social?: string;
  /**
   * Nome fantasia
   */
  nome_fantasia?: (string | null);
  /**
   * Situação cadastral (ex: ATIVA, BAIXADA)
   */
  situacao_cadastral?: string;
  /**
   * Data da situação cadastral
   */
  data_situacao_cadastral?: string;
  /**
   * Data de abertura (YYYY-MM-DD)
   */
  data_abertura?: string;
  /**
   * Porte da empresa (ex: MICRO EMPRESA, PEQUENO PORTE)
   */
  porte?: string;
  /**
   * Natureza jurídica
   */
  natureza_juridica?: string;
  /**
   * Código CNAE fiscal principal
   */
  cnae_fiscal?: number;
  /**
   * Descrição do CNAE fiscal principal
   */
  cnae_fiscal_descricao?: string;
  /**
   * CNAEs secundários
   */
  cnaes_secundarios?: Array<{
    /**
     * Código CNAE secundário
     */
    codigo: number;
    /**
     * Descrição do CNAE secundário
     */
    descricao: string;
  }>;
  logradouro?: string;
  numero?: string;
  complemento?: (string | null);
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
  telefone_1?: (string | null);
  email?: (string | null);
  /**
   * Capital social em reais
   */
  capital_social?: number;
  opcao_pelo_simples?: (boolean | null);
  opcao_pelo_mei?: (boolean | null);
};

