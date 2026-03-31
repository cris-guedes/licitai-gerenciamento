/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateCompanyResponse } from '../models/CreateCompanyResponse';
import type { DeleteCompanyResponse } from '../models/DeleteCompanyResponse';
import type { FetchCompanyByCnpjResponse } from '../models/FetchCompanyByCnpjResponse';
import type { FetchCompanyByIdResponse } from '../models/FetchCompanyByIdResponse';
import type { ListCompaniesResponse } from '../models/ListCompaniesResponse';
import type { UpdateCompanyResponse } from '../models/UpdateCompanyResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class CompanyService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Consulta dados cadastrais de uma empresa
   * Recupera informações oficiais da Receita Federal via OpenCNPJ utilizando o CNPJ.
   * @returns FetchCompanyByCnpjResponse Dados da empresa encontrados
   * @throws ApiError
   */
  public fetchCompanyByCnpj({
    cnpj,
  }: {
    cnpj: string,
  }): CancelablePromise<FetchCompanyByCnpjResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/fetch-company-by-cnpj',
      query: {
        'cnpj': cnpj,
      },
    });
  }
  /**
   * Busca o perfil de uma empresa por ID
   * Retorna os dados persistidos da empresa cadastrada na plataforma.
   * @returns FetchCompanyByIdResponse Perfil da empresa encontrado
   * @throws ApiError
   */
  public fetchCompanyById({
    companyId,
  }: {
    companyId: string,
  }): CancelablePromise<FetchCompanyByIdResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/company/fetch-company-by-id',
      query: {
        'companyId': companyId,
      },
    });
  }
  /**
   * Lista empresas da organização
   * Retorna as empresas vinculadas a uma organização.
   * @returns ListCompaniesResponse Lista de empresas retornada
   * @throws ApiError
   */
  public listCompanies({
    organizationId,
  }: {
    organizationId: string,
  }): CancelablePromise<ListCompaniesResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/company/list-companies',
      query: {
        'organizationId': organizationId,
      },
    });
  }
  /**
   * Cria uma nova empresa
   * Cadastra uma nova empresa vinculada a uma organização.
   * @returns CreateCompanyResponse Empresa criada com sucesso
   * @throws ApiError
   */
  public createCompany({
    requestBody,
  }: {
    requestBody: {
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
      nome_fantasia?: (string | null);
      /**
       * Situação cadastral da empresa
       */
      situacao_cadastral?: (string | null);
      /**
       * Data da situação cadastral
       */
      data_situacao_cadastral?: (string | null);
      /**
       * Data de abertura da empresa
       */
      data_abertura?: (string | null);
      /**
       * Porte da empresa
       */
      porte?: (string | null);
      /**
       * Natureza jurídica da empresa
       */
      natureza_juridica?: (string | null);
      /**
       * Código CNAE principal
       */
      cnae_fiscal?: (number | null);
      /**
       * Descrição do CNAE principal
       */
      cnae_fiscal_descricao?: (string | null);
      /**
       * Lista de CNAEs secundários
       */
      cnaes_secundarios?: null;
      /**
       * Logradouro da empresa
       */
      logradouro?: (string | null);
      /**
       * Número do endereço
       */
      numero?: (string | null);
      /**
       * Complemento do endereço
       */
      complemento?: (string | null);
      /**
       * Bairro
       */
      bairro?: (string | null);
      /**
       * Município
       */
      municipio?: (string | null);
      /**
       * UF da empresa
       */
      uf?: (string | null);
      /**
       * CEP da empresa
       */
      cep?: (string | null);
      /**
       * Telefone principal
       */
      telefone_1?: (string | null);
      /**
       * E-mail da empresa
       */
      email_empresa?: (string | null);
      /**
       * Capital social em reais
       */
      capital_social?: (number | null);
      /**
       * Indica se a empresa opta pelo Simples
       */
      opcao_pelo_simples?: (boolean | null);
      /**
       * Indica se a empresa opta pelo MEI
       */
      opcao_pelo_mei?: (boolean | null);
      /**
       * ID da organização dona da empresa
       */
      organizationId: string;
    },
  }): CancelablePromise<CreateCompanyResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/company/create-company',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Atualiza o perfil de uma empresa
   * Atualiza os campos editáveis do cadastro da empresa.
   * @returns UpdateCompanyResponse Empresa atualizada com sucesso
   * @throws ApiError
   */
  public updateCompany({
    requestBody,
  }: {
    requestBody: {
      /**
       * ID da empresa
       */
      companyId: string;
      /**
       * Campos da empresa que podem ser atualizados
       */
      data: {
        /**
         * CNPJ da empresa
         */
        cnpj?: string;
        /**
         * Razão social da empresa
         */
        razao_social?: string;
        /**
         * Nome fantasia da empresa
         */
        nome_fantasia?: (string | null);
        /**
         * Situação cadastral da empresa
         */
        situacao_cadastral?: (string | null);
        /**
         * Data da situação cadastral
         */
        data_situacao_cadastral?: (string | null);
        /**
         * Data de abertura da empresa
         */
        data_abertura?: (string | null);
        /**
         * Porte da empresa
         */
        porte?: (string | null);
        /**
         * Natureza jurídica da empresa
         */
        natureza_juridica?: (string | null);
        /**
         * Código CNAE principal
         */
        cnae_fiscal?: (number | null);
        /**
         * Descrição do CNAE principal
         */
        cnae_fiscal_descricao?: (string | null);
        /**
         * Lista de CNAEs secundários
         */
        cnaes_secundarios?: null;
        /**
         * Logradouro da empresa
         */
        logradouro?: (string | null);
        /**
         * Número do endereço
         */
        numero?: (string | null);
        /**
         * Complemento do endereço
         */
        complemento?: (string | null);
        /**
         * Bairro
         */
        bairro?: (string | null);
        /**
         * Município
         */
        municipio?: (string | null);
        /**
         * UF da empresa
         */
        uf?: (string | null);
        /**
         * CEP da empresa
         */
        cep?: (string | null);
        /**
         * Telefone principal
         */
        telefone_1?: (string | null);
        /**
         * E-mail da empresa
         */
        email_empresa?: (string | null);
        /**
         * Capital social em reais
         */
        capital_social?: (number | null);
        /**
         * Indica se a empresa opta pelo Simples
         */
        opcao_pelo_simples?: (boolean | null);
        /**
         * Indica se a empresa opta pelo MEI
         */
        opcao_pelo_mei?: (boolean | null);
      };
    },
  }): CancelablePromise<UpdateCompanyResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/company/update-company',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Remove uma empresa
   * Exclui uma empresa cadastrada da plataforma.
   * @returns DeleteCompanyResponse Empresa removida com sucesso
   * @throws ApiError
   */
  public deleteCompany({
    requestBody,
  }: {
    requestBody: {
      /**
       * ID da empresa
       */
      companyId: string;
    },
  }): CancelablePromise<DeleteCompanyResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/company/delete-company',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
