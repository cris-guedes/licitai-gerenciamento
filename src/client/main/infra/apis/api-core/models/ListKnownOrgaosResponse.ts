/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ListKnownOrgaosResponse = {
  /**
   * Órgãos públicos já cadastrados e reutilizáveis no formulário.
   */
  orgaos: Array<{
    /**
     * ID interno do órgão público previamente cadastrado.
     */
    id: string;
    /**
     * CNPJ conhecido do órgão público.
     */
    cnpj: string;
    /**
     * Razão social ou nome principal do órgão público.
     */
    nome: string;
    /**
     * Código da unidade gestora do órgão, quando disponível.
     */
    codigoUnidade: string;
    /**
     * Nome da unidade gestora do órgão, quando disponível.
     */
    nomeUnidade: string;
    /**
     * Município associado ao órgão.
     */
    municipio: string;
    /**
     * UF associada ao órgão.
     */
    uf: string;
    /**
     * Esfera normalizada para reaproveitamento no cadastro.
     */
    esfera: string;
    /**
     * Poder normalizado para reaproveitamento no cadastro.
     */
    poder: string;
  }>;
};

