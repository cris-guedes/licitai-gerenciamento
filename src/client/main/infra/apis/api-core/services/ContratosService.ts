/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GetCoreContratosContratoIdWorkspaceResponse } from '../models/GetCoreContratosContratoIdWorkspaceResponse';
import type { GetCoreContratosListResponse } from '../models/GetCoreContratosListResponse';
import type { PostCoreContratosItensDeleteResponse } from '../models/PostCoreContratosItensDeleteResponse';
import type { PostCoreContratosItensResponse } from '../models/PostCoreContratosItensResponse';
import type { PostCoreContratosItensUpdateResponse } from '../models/PostCoreContratosItensUpdateResponse';
import type { PostCoreContratosResponse } from '../models/PostCoreContratosResponse';
import type { PostCoreContratosUpdateResponse } from '../models/PostCoreContratosUpdateResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class ContratosService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Criar novo contrato
   * Cria um contrato a partir de uma oportunidade ganha
   * @returns PostCoreContratosResponse Contrato criado com sucesso
   * @throws ApiError
   */
  public postCoreContratos({
    requestBody,
  }: {
    requestBody: {
      /**
       * ID da empresa (passado pelo frontend)
       */
      companyId: string;
      /**
       * ID da Oportunidade de origem
       */
      oportunidadeId: string;
      /**
       * Número do contrato (ex: 01/2025)
       */
      numeroContrato?: string;
      /**
       * Ano do contrato
       */
      anoContrato?: number;
      /**
       * Número do Processo Administrativo
       */
      processo?: string;
      /**
       * Tipo: contrato, ata_registro_precos, empenho_direto
       */
      tipoContrato?: string;
      /**
       * Objeto do contrato
       */
      objetoContrato?: string;
      /**
       * Data de assinatura
       */
      dataAssinatura?: string;
      /**
       * Início da vigência
       */
      dataVigenciaInicio?: string;
      /**
       * Fim da vigência
       */
      dataVigenciaFim?: string;
      /**
       * CNPJ da nossa empresa no contrato
       */
      fornecedorCnpjCpf?: string;
      /**
       * Razão Social da nossa empresa
       */
      fornecedorNome?: string;
      /**
       * Valor inicial do contrato
       */
      valorInicial?: number;
      /**
       * Valor global do contrato
       */
      valorGlobal?: number;
      /**
       * Valor total (alias para global)
       */
      valorTotal?: number;
      /**
       * Status do contrato
       */
      status?: 'RASCUNHO' | 'VIGENTE' | 'ENCERRADO' | 'RESCINDIDO' | 'CANCELADO';
      /**
       * Órgão contratante selecionado a partir dos órgãos vinculados à oportunidade.
       */
      orgaoContratante?: {
        editalOrgaoId?: string;
        orgaoId?: string;
        papel?: string;
        cnpj?: (string | null);
        razaoSocial?: (string | null);
        codigoUnidade?: (string | null);
        nomeUnidade?: (string | null);
        municipio?: (string | null);
        uf?: (string | null);
        esfera?: (string | null);
        poder?: (string | null);
      };
      /**
       * Lista de itens vinculados a este contrato
       */
      itens: Array<{
        /**
         * ID do OportunidadeItem
         */
        oportunidadeItemId: string;
        /**
         * Quantidade do item fechada no contrato
         */
        quantidadeContratada?: number;
        /**
         * Valor unitário negociado
         */
        valorUnitario?: number;
        /**
         * Valor total do item
         */
        valorTotal?: number;
      }>;
    },
  }): CancelablePromise<PostCoreContratosResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/contratos',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Listar contratos
   * Lista os contratos da empresa
   * @returns GetCoreContratosListResponse Lista de contratos retornada
   * @throws ApiError
   */
  public getCoreContratosList({
    companyId,
    oportunidadeId,
  }: {
    companyId: string,
    oportunidadeId?: string,
  }): CancelablePromise<GetCoreContratosListResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/contratos/list',
      query: {
        'companyId': companyId,
        'oportunidadeId': oportunidadeId,
      },
    });
  }
  /**
   * Obter Workspace do Contrato
   * Obtém todos os detalhes do contrato, itens, empenhos e pipeline
   * @returns GetCoreContratosContratoIdWorkspaceResponse Workspace carregado com sucesso
   * @throws ApiError
   */
  public getCoreContratosContratoIdWorkspace({
    companyId,
    contratoId,
  }: {
    companyId: string,
    contratoId: string,
  }): CancelablePromise<GetCoreContratosContratoIdWorkspaceResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/contratos/workspace',
      query: {
        'companyId': companyId,
        'contratoId': contratoId,
      },
    });
  }
  /**
   * Atualizar contrato
   * Atualiza dados cadastrais e status de um contrato
   * @returns PostCoreContratosUpdateResponse Contrato atualizado com sucesso
   * @throws ApiError
   */
  public postCoreContratosUpdate({
    requestBody,
  }: {
    requestBody: {
      /**
       * ID da empresa
       */
      companyId: string;
      /**
       * ID do contrato
       */
      contratoId: string;
      numeroContrato?: (string | null);
      anoContrato?: (number | null);
      processo?: (string | null);
      tipoContrato?: (string | null);
      objetoContrato?: (string | null);
      dataAssinatura?: (string | null);
      dataVigenciaInicio?: (string | null);
      dataVigenciaFim?: (string | null);
      fornecedorCnpjCpf?: (string | null);
      fornecedorNome?: (string | null);
      valorInicial?: (number | null);
      valorGlobal?: (number | null);
      valorTotal?: (number | null);
      status?: 'RASCUNHO' | 'VIGENTE' | 'ENCERRADO' | 'RESCINDIDO' | 'CANCELADO';
    },
  }): CancelablePromise<PostCoreContratosUpdateResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/contratos/update',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Adicionar item ao contrato
   * Vincula ao contrato um item ativo da oportunidade de origem
   * @returns PostCoreContratosItensResponse Item vinculado com sucesso
   * @throws ApiError
   */
  public postCoreContratosItens({
    requestBody,
  }: {
    requestBody: {
      /**
       * ID da empresa
       */
      companyId: string;
      /**
       * ID do contrato
       */
      contratoId: string;
      /**
       * ID do item da oportunidade que será vinculado
       */
      oportunidadeItemId: string;
      /**
       * Quantidade contratada
       */
      quantidadeContratada?: (number | null);
      /**
       * Valor unitário contratado
       */
      valorUnitario?: (number | null);
      /**
       * Valor total contratado
       */
      valorTotal?: (number | null);
    },
  }): CancelablePromise<PostCoreContratosItensResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/contratos/itens',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Atualizar item do contrato
   * Atualiza quantidade e valores de um item vinculado ao contrato
   * @returns PostCoreContratosItensUpdateResponse Item atualizado com sucesso
   * @throws ApiError
   */
  public postCoreContratosItensUpdate({
    requestBody,
  }: {
    requestBody: {
      /**
       * ID da empresa
       */
      companyId: string;
      /**
       * ID do contrato
       */
      contratoId: string;
      /**
       * ID do item do contrato
       */
      contratoItemId: string;
      /**
       * Quantidade contratada
       */
      quantidadeContratada?: (number | null);
      /**
       * Valor unitário contratado
       */
      valorUnitario?: (number | null);
      /**
       * Valor total contratado
       */
      valorTotal?: (number | null);
    },
  }): CancelablePromise<PostCoreContratosItensUpdateResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/contratos/itens/update',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Remover item do contrato
   * Remove item do contrato quando ele ainda não possui empenhos vinculados
   * @returns PostCoreContratosItensDeleteResponse Item removido com sucesso
   * @throws ApiError
   */
  public postCoreContratosItensDelete({
    requestBody,
  }: {
    requestBody: {
      /**
       * ID da empresa
       */
      companyId: string;
      /**
       * ID do contrato
       */
      contratoId: string;
      /**
       * ID do item do contrato
       */
      contratoItemId: string;
    },
  }): CancelablePromise<PostCoreContratosItensDeleteResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/contratos/itens/delete',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
