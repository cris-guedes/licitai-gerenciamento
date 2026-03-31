/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CompanyProfile = {
  /**
   * ID da empresa
   */
  id: string;
  /**
   * CNPJ da empresa
   */
  cnpj: string;
  /**
   * Razão social da empresa
   */
  razao_social: string;
  /**
   * Nome fantasia da empresa
   */
  nome_fantasia: (string | null);
  /**
   * Situação cadastral da empresa
   */
  situacao_cadastral: (string | null);
  /**
   * Data da situação cadastral
   */
  data_situacao_cadastral: (string | null);
  /**
   * Data de abertura da empresa
   */
  data_abertura: (string | null);
  /**
   * Porte da empresa
   */
  porte: (string | null);
  /**
   * Natureza jurídica da empresa
   */
  natureza_juridica: (string | null);
  /**
   * Código CNAE principal
   */
  cnae_fiscal: (number | null);
  /**
   * Descrição do CNAE principal
   */
  cnae_fiscal_descricao: (string | null);
  /**
   * Lista de CNAEs secundários
   */
  cnaes_secundarios: null;
  /**
   * Logradouro da empresa
   */
  logradouro: (string | null);
  /**
   * Número do endereço
   */
  numero: (string | null);
  /**
   * Complemento do endereço
   */
  complemento: (string | null);
  /**
   * Bairro
   */
  bairro: (string | null);
  /**
   * Município
   */
  municipio: (string | null);
  /**
   * UF da empresa
   */
  uf: (string | null);
  /**
   * CEP da empresa
   */
  cep: (string | null);
  /**
   * Telefone principal
   */
  telefone_1: (string | null);
  /**
   * E-mail da empresa
   */
  email_empresa: (string | null);
  /**
   * Capital social em reais
   */
  capital_social: (number | null);
  /**
   * Indica se a empresa opta pelo Simples
   */
  opcao_pelo_simples: (boolean | null);
  /**
   * Indica se a empresa opta pelo MEI
   */
  opcao_pelo_mei: (boolean | null);
  /**
   * ID da organização dona da empresa
   */
  organizationId: string;
  /**
   * Data de criação do registro
   */
  createdAt: string;
  /**
   * Data da última atualização
   */
  updatedAt: string;
};

