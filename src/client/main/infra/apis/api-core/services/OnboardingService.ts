/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OnboardingResponse } from '../models/OnboardingResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class OnboardingService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Fluxo de onboarding da empresa
   * Cria organização, empresa e vínculo de proprietário com base nos dados fornecidos.
   * @returns OnboardingResponse Onboarding concluído
   * @throws ApiError
   */
  public onboarding({
    requestBody,
  }: {
    requestBody: {
      /**
       * CNPJ da empresa (apenas numeros, 14 digitos)
       */
      cnpj: string;
      /**
       * Razao social da empresa
       */
      razao_social: string;
      /**
       * Nome fantasia
       */
      nome_fantasia?: (string | null);
      /**
       * Situacao cadastral (ex: ATIVA, BAIXADA)
       */
      situacao_cadastral?: string;
      /**
       * Data da situacao cadastral
       */
      data_situacao_cadastral?: string;
      /**
       * Data de abertura (YYYY-MM-DD)
       */
      data_abertura?: string;
      /**
       * Porte da empresa
       */
      porte?: string;
      /**
       * Natureza juridica
       */
      natureza_juridica?: string;
      /**
       * Codigo CNAE fiscal principal
       */
      cnae_fiscal?: number;
      /**
       * Descricao do CNAE fiscal principal
       */
      cnae_fiscal_descricao?: string;
      /**
       * CNAEs secundarios
       */
      cnaes_secundarios?: Array<{
        /**
         * Codigo CNAE secundario
         */
        codigo: number;
        /**
         * Descricao do CNAE secundario
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
      email_empresa?: (string | null);
      /**
       * Capital social em reais
       */
      capital_social?: number;
      opcao_pelo_simples?: (boolean | null);
      opcao_pelo_mei?: (boolean | null);
    },
  }): CancelablePromise<OnboardingResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/onboarding',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
