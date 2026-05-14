/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GetCoreContratosContratoIdEmpenhosListResponse } from '../models/GetCoreContratosContratoIdEmpenhosListResponse';
import type { PostCoreContratosContratoIdEmpenhosEmpenhoIdEntregasEntregaIdStatusResponse } from '../models/PostCoreContratosContratoIdEmpenhosEmpenhoIdEntregasEntregaIdStatusResponse';
import type { PostCoreContratosContratoIdEmpenhosEmpenhoIdEntregasResponse } from '../models/PostCoreContratosContratoIdEmpenhosEmpenhoIdEntregasResponse';
import type { PostCoreContratosContratoIdEmpenhosEmpenhoIdLocaisResponse } from '../models/PostCoreContratosContratoIdEmpenhosEmpenhoIdLocaisResponse';
import type { PostCoreContratosContratoIdEmpenhosResponse } from '../models/PostCoreContratosContratoIdEmpenhosResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class EmpenhosService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Criar novo empenho
   * Cria uma nota de empenho vinculada a um contrato, deduzindo do saldo
   * @returns PostCoreContratosContratoIdEmpenhosResponse Empenho criado com sucesso
   * @throws ApiError
   */
  public postCoreContratosContratoIdEmpenhos({
    requestBody,
  }: {
    requestBody: {
      /**
       * ID da empresa (passado pelo frontend)
       */
      companyId: string;
      /**
       * ID do Contrato
       */
      contratoId: string;
      /**
       * Número da nota de empenho
       */
      numeroEmpenho: string;
      /**
       * Ex: ordinario, estimativo, global
       */
      tipoEmpenho?: string;
      /**
       * Valor total do empenho
       */
      valor: number;
      /**
       * Data de emissão da nota de empenho
       */
      dataEmissao?: string;
      /**
       * CNPJ do órgão emissor
       */
      orgaoCnpj?: string;
      /**
       * Nome do órgão emissor
       */
      orgaoNome?: string;
      /**
       * Unidade/Secretaria
       */
      orgaoUnidadeNome?: string;
      /**
       * Observações gerais
       */
      observacao?: string;
      /**
       * Status do empenho
       */
      status?: 'ATIVO' | 'CANCELADO' | 'UTILIZADO';
      /**
       * Itens vinculados ao empenho
       */
      itens: Array<{
        /**
         * ID do ContratoItem
         */
        contratoItemId: string;
        /**
         * Quantidade sendo empenhada
         */
        quantidade: number;
        /**
         * Valor unitário (caso diferente do contrato)
         */
        valorUnitario?: number;
        /**
         * Valor total desta linha de empenho
         */
        valorTotal?: number;
      }>;
    },
  }): CancelablePromise<PostCoreContratosContratoIdEmpenhosResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/contratos/empenhos',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Listar empenhos do contrato
   * Lista todas as notas de empenho registradas em um contrato
   * @returns GetCoreContratosContratoIdEmpenhosListResponse Empenhos encontrados
   * @throws ApiError
   */
  public getCoreContratosContratoIdEmpenhosList({
    companyId,
    contratoId,
  }: {
    companyId: string,
    contratoId: string,
  }): CancelablePromise<GetCoreContratosContratoIdEmpenhosListResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/contratos/empenhos/list',
      query: {
        'companyId': companyId,
        'contratoId': contratoId,
      },
    });
  }
  /**
   * Adicionar Local de Entrega
   * Adiciona um local de entrega à nota de empenho
   * @returns PostCoreContratosContratoIdEmpenhosEmpenhoIdLocaisResponse Local adicionado com sucesso
   * @throws ApiError
   */
  public postCoreContratosContratoIdEmpenhosEmpenhoIdLocais({
    requestBody,
  }: {
    requestBody: {
      /**
       * ID da empresa
       */
      companyId: string;
      /**
       * ID do Contrato
       */
      contratoId: string;
      /**
       * ID do Empenho
       */
      empenhoId: string;
      orgaoNome?: string;
      logradouro: string;
      numero?: string;
      complemento?: string;
      bairro?: string;
      cidade?: string;
      estado?: string;
      cep?: string;
      contatoNome?: string;
      contatoTelefone?: string;
      contatoEmail?: string;
      observacoes?: string;
    },
  }): CancelablePromise<PostCoreContratosContratoIdEmpenhosEmpenhoIdLocaisResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/contratos/empenhos/locais',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Criar Entrega (Pipeline Logístico)
   * Adiciona uma nova entrega pendente para um item de empenho
   * @returns PostCoreContratosContratoIdEmpenhosEmpenhoIdEntregasResponse Entrega registrada com sucesso
   * @throws ApiError
   */
  public postCoreContratosContratoIdEmpenhosEmpenhoIdEntregas({
    requestBody,
  }: {
    requestBody: {
      companyId: string;
      /**
       * ID do Contrato
       */
      contratoId: string;
      /**
       * ID do Empenho
       */
      empenhoId: string;
      empenhoItemId: string;
      quantidade: number;
      dataPrevista?: string;
      observacoes?: string;
    },
  }): CancelablePromise<PostCoreContratosContratoIdEmpenhosEmpenhoIdEntregasResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/contratos/empenhos/entregas',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Atualizar Status da Entrega
   * Avança a entrega no pipeline
   * @returns PostCoreContratosContratoIdEmpenhosEmpenhoIdEntregasEntregaIdStatusResponse Status atualizado com sucesso
   * @throws ApiError
   */
  public postCoreContratosContratoIdEmpenhosEmpenhoIdEntregasEntregaIdStatus({
    requestBody,
  }: {
    requestBody: {
      companyId: string;
      /**
       * ID do Contrato
       */
      contratoId: string;
      /**
       * ID do Empenho
       */
      empenhoId: string;
      /**
       * ID da Entrega
       */
      entregaId: string;
      /**
       * Novo status da entrega
       */
      status: 'PENDENTE' | 'ENTREGUE' | 'ACEITE_PROVISORIO' | 'ACEITE_DEFINITIVO' | 'PAGO' | 'REJEITADO';
      dataEntrega?: string;
      observacoes?: string;
    },
  }): CancelablePromise<PostCoreContratosContratoIdEmpenhosEmpenhoIdEntregasEntregaIdStatusResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/contratos/empenhos/entregas/status',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
