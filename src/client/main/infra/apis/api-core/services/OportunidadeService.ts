/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateCompanyWorkflowNodeResponse } from '../models/CreateCompanyWorkflowNodeResponse';
import type { CreateCompanyWorkflowTransitionResponse } from '../models/CreateCompanyWorkflowTransitionResponse';
import type { DeleteCompanyWorkflowNodeResponse } from '../models/DeleteCompanyWorkflowNodeResponse';
import type { DeleteCompanyWorkflowTransitionResponse } from '../models/DeleteCompanyWorkflowTransitionResponse';
import type { GetCompanyWorkflowResponse } from '../models/GetCompanyWorkflowResponse';
import type { ListOportunidadesBoardResponse } from '../models/ListOportunidadesBoardResponse';
import type { MoveOportunidadeWorkflowResponse } from '../models/MoveOportunidadeWorkflowResponse';
import type { UpdateCompanyWorkflowNodeResponse } from '../models/UpdateCompanyWorkflowNodeResponse';
import type { UpdateCompanyWorkflowTransitionResponse } from '../models/UpdateCompanyWorkflowTransitionResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class OportunidadeService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Recupera o workflow ativo da empresa
   * Retorna a definição relacional completa do workflow ativo da empresa, incluindo kinds, nós e transições, pronta para board e editor visual.
   * @returns GetCompanyWorkflowResponse Workflow carregado com sucesso
   * @throws ApiError
   */
  public getCompanyWorkflow({
    companyId,
  }: {
    companyId: string,
  }): CancelablePromise<GetCompanyWorkflowResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/get-company-workflow',
      query: {
        'companyId': companyId,
      },
    });
  }
  /**
   * Lista oportunidades ativas para o board da empresa
   * Retorna as oportunidades ativas da empresa com fase, status, situação, responsável e dados principais para as visualizações em kanban e lista.
   * @returns ListOportunidadesBoardResponse Board carregado com sucesso
   * @throws ApiError
   */
  public listOportunidadesBoard({
    companyId,
    workflowNodeIds,
    currentPhaseNodeId,
    currentStatusNodeId,
    currentSituationNodeId,
    responsavelUserId,
    valorEstimadoMin,
    valorEstimadoMax,
    q,
  }: {
    companyId: string,
    workflowNodeIds?: (string | Array<string>),
    currentPhaseNodeId?: string,
    currentStatusNodeId?: string,
    currentSituationNodeId?: string,
    responsavelUserId?: string,
    valorEstimadoMin?: number,
    valorEstimadoMax?: number,
    q?: string,
  }): CancelablePromise<ListOportunidadesBoardResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/list-oportunidades-board',
      query: {
        'companyId': companyId,
        'workflowNodeIds': workflowNodeIds,
        'currentPhaseNodeId': currentPhaseNodeId,
        'currentStatusNodeId': currentStatusNodeId,
        'currentSituationNodeId': currentSituationNodeId,
        'responsavelUserId': responsavelUserId,
        'valorEstimadoMin': valorEstimadoMin,
        'valorEstimadoMax': valorEstimadoMax,
        'q': q,
      },
    });
  }
  /**
   * Move uma oportunidade dentro do workflow
   * Atualiza o nó atual do workflow de uma oportunidade ativa. Apenas o responsável pela oportunidade pode executar a movimentação.
   * @returns MoveOportunidadeWorkflowResponse Oportunidade movida com sucesso
   * @throws ApiError
   */
  public moveOportunidadeWorkflow({
    requestBody,
  }: {
    requestBody: {
      /**
       * ID da empresa dona da oportunidade.
       */
      companyId: string;
      /**
       * ID da oportunidade que será movida.
       */
      oportunidadeId: string;
      /**
       * ID exato do nó de destino permitido pelo workflow.
       */
      targetNodeId: string;
    },
  }): CancelablePromise<MoveOportunidadeWorkflowResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/move-oportunidade-workflow',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Cria um nó no workflow da empresa
   * Cria uma nova etapa hierárquica no workflow ativo da empresa, respeitando os tipos de nó permitidos pela definição.
   * @returns CreateCompanyWorkflowNodeResponse Nó do workflow criado com sucesso
   * @throws ApiError
   */
  public createCompanyWorkflowNode({
    requestBody,
  }: {
    requestBody: {
      /**
       * ID da empresa dona do workflow.
       */
      companyId: string;
      /**
       * ID da definição de workflow alterada.
       */
      workflowDefinitionId: string;
      /**
       * ID do nó pai. Quando vazio, cria uma fase raiz.
       */
      parentNodeId?: (string | null);
      /**
       * Tipo do nó a ser criado. Quando vazio, o servidor usa o próximo tipo permitido pela hierarquia.
       */
      kindId?: (string | null);
      /**
       * Rótulo exibido para o novo nó.
       */
      label: string;
      /**
       * Descrição opcional do novo nó.
       */
      description?: (string | null);
      /**
       * Cor hexadecimal opcional usada para destacar o nó no workflow.
       */
      color?: (string | null);
      /**
       * Marca o nó como inicial dentro do seu grupo de irmãos.
       */
      isInitial?: boolean;
      /**
       * Marca o nó como etapa terminal do workflow.
       */
      isTerminal?: boolean;
      /**
       * Posição opcional usada pelo editor visual.
       */
      position?: ({
        /**
         * Posição horizontal do nó no editor visual.
         */
        'x': number;
        /**
         * Posição vertical do nó no editor visual.
         */
        'y': number;
      } | null);
    },
  }): CancelablePromise<CreateCompanyWorkflowNodeResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/create-company-workflow-node',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Personaliza um nó do workflow da empresa
   * Atualiza propriedades editáveis de um nó da definição de workflow ativa da empresa.
   * @returns UpdateCompanyWorkflowNodeResponse Nó do workflow atualizado com sucesso
   * @throws ApiError
   */
  public updateCompanyWorkflowNode({
    requestBody,
  }: {
    requestBody: {
      /**
       * ID da empresa dona do workflow.
       */
      companyId: string;
      /**
       * ID da definição de workflow alterada.
       */
      workflowDefinitionId: string;
      /**
       * ID do nó que será personalizado.
       */
      nodeId: string;
      /**
       * Novo rótulo exibido para o nó no board e nas configurações.
       */
      label?: string;
      /**
       * Descrição opcional do nó.
       */
      description?: (string | null);
      /**
       * Cor hexadecimal opcional usada para destacar o nó no workflow.
       */
      color?: (string | null);
      /**
       * Marca o nó como inicial dentro do seu grupo de irmãos.
       */
      isInitial?: boolean;
      /**
       * Marca o nó como etapa terminal do workflow.
       */
      isTerminal?: boolean;
      /**
       * Ordem do nó entre seus irmãos.
       */
      order?: number;
      /**
       * Posição opcional usada pelo editor visual.
       */
      position?: ({
        /**
         * Posição horizontal do nó no editor visual.
         */
        'x': number;
        /**
         * Posição vertical do nó no editor visual.
         */
        'y': number;
      } | null);
    },
  }): CancelablePromise<UpdateCompanyWorkflowNodeResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/update-company-workflow-node',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Exclui um nó do workflow da empresa
   * Exclui um nó e seus filhos quando eles não estão vinculados a oportunidades ativas.
   * @returns DeleteCompanyWorkflowNodeResponse Nó do workflow excluído com sucesso
   * @throws ApiError
   */
  public deleteCompanyWorkflowNode({
    requestBody,
  }: {
    requestBody: {
      /**
       * ID da empresa dona do workflow.
       */
      companyId: string;
      /**
       * ID da definição de workflow alterada.
       */
      workflowDefinitionId: string;
      /**
       * ID do nó que será excluído junto com seus filhos.
       */
      nodeId: string;
    },
  }): CancelablePromise<DeleteCompanyWorkflowNodeResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/delete-company-workflow-node',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Cria uma transição no workflow da empresa
   * Cria uma ligação permitida entre dois nós existentes da definição de workflow da empresa.
   * @returns CreateCompanyWorkflowTransitionResponse Transição do workflow criada com sucesso
   * @throws ApiError
   */
  public createCompanyWorkflowTransition({
    requestBody,
  }: {
    requestBody: {
      /**
       * ID da empresa dona do workflow.
       */
      companyId: string;
      /**
       * ID da definição de workflow alterada.
       */
      workflowDefinitionId: string;
      /**
       * ID do nó de origem da transição.
       */
      fromNodeId: string;
      /**
       * ID do nó de destino da transição.
       */
      toNodeId: string;
      /**
       * Tipo semântico opcional da transição.
       */
      transitionType?: (string | null);
    },
  }): CancelablePromise<CreateCompanyWorkflowTransitionResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/create-company-workflow-transition',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Atualiza uma transição no workflow da empresa
   * Atualiza o tipo semântico de uma transição existente do workflow da empresa.
   * @returns UpdateCompanyWorkflowTransitionResponse Transição do workflow atualizada com sucesso
   * @throws ApiError
   */
  public updateCompanyWorkflowTransition({
    requestBody,
  }: {
    requestBody: {
      /**
       * ID da empresa dona do workflow.
       */
      companyId: string;
      /**
       * ID da definição de workflow alterada.
       */
      workflowDefinitionId: string;
      /**
       * ID da transição que será alterada.
       */
      transitionId: string;
      /**
       * Tipo semântico opcional da transição.
       */
      transitionType?: (string | null);
    },
  }): CancelablePromise<UpdateCompanyWorkflowTransitionResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/update-company-workflow-transition',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Exclui uma transição no workflow da empresa
   * Remove uma ligação entre dois nós existentes da definição de workflow da empresa.
   * @returns DeleteCompanyWorkflowTransitionResponse Transição do workflow excluída com sucesso
   * @throws ApiError
   */
  public deleteCompanyWorkflowTransition({
    requestBody,
  }: {
    requestBody: {
      /**
       * ID da empresa dona do workflow.
       */
      companyId: string;
      /**
       * ID da definição de workflow alterada.
       */
      workflowDefinitionId: string;
      /**
       * ID da transição que será excluída.
       */
      transitionId: string;
    },
  }): CancelablePromise<DeleteCompanyWorkflowTransitionResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/delete-company-workflow-transition',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
