/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateCompanyWorkflowNodeResponse } from '../models/CreateCompanyWorkflowNodeResponse';
import type { CreateCompanyWorkflowTransitionResponse } from '../models/CreateCompanyWorkflowTransitionResponse';
import type { CreateOportunidadeNoteResponse } from '../models/CreateOportunidadeNoteResponse';
import type { CreateOportunidadeTaskResponse } from '../models/CreateOportunidadeTaskResponse';
import type { DeleteCompanyWorkflowNodeResponse } from '../models/DeleteCompanyWorkflowNodeResponse';
import type { DeleteCompanyWorkflowTransitionResponse } from '../models/DeleteCompanyWorkflowTransitionResponse';
import type { DeleteOportunidadeNoteResponse } from '../models/DeleteOportunidadeNoteResponse';
import type { DeleteOportunidadeTaskResponse } from '../models/DeleteOportunidadeTaskResponse';
import type { GetCompanyWorkflowResponse } from '../models/GetCompanyWorkflowResponse';
import type { ListOportunidadesBoardResponse } from '../models/ListOportunidadesBoardResponse';
import type { MoveOportunidadeWorkflowResponse } from '../models/MoveOportunidadeWorkflowResponse';
import type { ToggleOportunidadeTaskResponse } from '../models/ToggleOportunidadeTaskResponse';
import type { UpdateCompanyWorkflowNodeResponse } from '../models/UpdateCompanyWorkflowNodeResponse';
import type { UpdateCompanyWorkflowTransitionResponse } from '../models/UpdateCompanyWorkflowTransitionResponse';
import type { UpdateOportunidadeItemResponse } from '../models/UpdateOportunidadeItemResponse';
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
   * Cria uma tarefa operacional da oportunidade
   * Adiciona uma tarefa simples vinculada à oportunidade para acompanhamento interno do time.
   * @returns CreateOportunidadeTaskResponse Tarefa criada com sucesso
   * @throws ApiError
   */
  public createOportunidadeTask({
    requestBody,
  }: {
    requestBody: {
      /**
       * ID da empresa dona da oportunidade.
       */
      companyId: string;
      /**
       * ID da oportunidade que receberá a tarefa.
       */
      oportunidadeId: string;
      /**
       * Título objetivo da tarefa.
       */
      title: string;
      /**
       * Prazo opcional em ISO ou YYYY-MM-DD.
       */
      dueAt?: (string | null);
    },
  }): CancelablePromise<CreateOportunidadeTaskResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/create-oportunidade-task',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Atualiza os dados operacionais de um item da oportunidade
   * Persiste seleção, mapeamento para item interno, precificação e dados correntes de disputa de um item da oportunidade.
   * @returns UpdateOportunidadeItemResponse Item da oportunidade atualizado com sucesso
   * @throws ApiError
   */
  public updateOportunidadeItem({
    requestBody,
  }: {
    requestBody: {
      /**
       * ID da empresa dona da oportunidade.
       */
      companyId: string;
      /**
       * ID da oportunidade que contem o item.
       */
      oportunidadeId: string;
      /**
       * ID do item operacional da oportunidade.
       */
      oportunidadeItemId: string;
      /**
       * Patch parcial com os dados operacionais do item da oportunidade.
       */
      data: {
        /**
         * Dados editáveis do item oficial do edital.
         */
        editalItem?: {
          /**
           * Numero sequencial do item no edital.
           */
          numeroItem?: ((string | number) | null);
          /**
           * Descricao oficial do item no edital.
           */
          descricao?: (string | null);
          /**
           * Tipo oficial do item no edital.
           */
          tipoItem?: ('MATERIAL' | 'SERVICO' | null);
          /**
           * Identificacao do lote do item.
           */
          lote?: (string | null);
          /**
           * Quantidade total solicitada no edital.
           */
          quantidadeTotal?: ((string | number) | null);
          /**
           * Unidade de medida oficial do edital.
           */
          unidadeMedida?: (string | null);
          /**
           * Valor unitario estimado pelo edital.
           */
          valorUnitarioEstimado?: ((string | number) | null);
          /**
           * Valor total estimado pelo edital.
           */
          valorTotalEstimado?: ((string | number) | null);
        };
        /**
         * ID do item interno da empresa vinculado ao item do edital.
         */
        companyItemId?: (string | null);
        /**
         * Indica se o item continua ativo na proposta.
         */
        isSelected?: boolean;
        /**
         * Status operacional do item dentro da oportunidade.
         */
        status?: 'PENDING_PRICING' | 'READY_FOR_BID' | 'IN_BIDDING' | 'WON' | 'LOST' | 'DISCARDED';
        /**
         * Observacoes internas do time comercial para o item.
         */
        observacaoInterna?: (string | null);
        /**
         * Dados de precificacao do item.
         */
        pricing?: {
          /**
           * Quantidade efetivamente considerada para a proposta.
           */
          quantidadeCotada?: ((string | number) | null);
          /**
           * Quantidade adicional prevista para adesao, quando houver.
           */
          quantidadeAdesao?: ((string | number) | null);
          /**
           * Preco unitario ofertado pela empresa.
           */
          precoOfertaUnitario?: ((string | number) | null);
          /**
           * Custo unitario congelado para esta oportunidade.
           */
          custoUnitarioSnapshot?: ((string | number) | null);
          /**
           * Valor minimo definido internamente para a fase de lances.
           */
          valorMinimoLance?: ((string | number) | null);
          /**
           * Marca efetivamente ofertada para o item.
           */
          ofertaMarca?: (string | null);
          /**
           * Modelo efetivamente ofertado para o item.
           */
          ofertaModelo?: (string | null);
          /**
           * Descricao da garantia comercial prometida para o item.
           */
          garantiaDescricao?: (string | null);
        };
        /**
         * Dados correntes da disputa do item.
         */
        disputa?: {
          /**
           * Ultimo lance registrado para o item.
           */
          ultimoLance?: ((string | number) | null);
          /**
           * Data ISO ou YYYY-MM-DD do ultimo lance informado.
           */
          dataUltimoLance?: (string | null);
          /**
           * Situacao operacional resumida da disputa.
           */
          situacaoDisputa?: (string | null);
          /**
           * Observacoes internas sobre a disputa do item.
           */
          observacaoOperacional?: (string | null);
        };
      };
    },
  }): CancelablePromise<UpdateOportunidadeItemResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/update-oportunidade-item',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Atualiza o status de uma tarefa da oportunidade
   * Marca uma tarefa da oportunidade como aberta ou concluída.
   * @returns ToggleOportunidadeTaskResponse Tarefa atualizada com sucesso
   * @throws ApiError
   */
  public toggleOportunidadeTask({
    requestBody,
  }: {
    requestBody: {
      /**
       * ID da empresa dona da oportunidade.
       */
      companyId: string;
      /**
       * ID da oportunidade dona da tarefa.
       */
      oportunidadeId: string;
      /**
       * ID da tarefa.
       */
      taskId: string;
      /**
       * Novo status da tarefa.
       */
      status: 'OPEN' | 'DONE';
    },
  }): CancelablePromise<ToggleOportunidadeTaskResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/toggle-oportunidade-task',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Remove uma tarefa da oportunidade
   * Exclui uma tarefa operacional vinculada à oportunidade.
   * @returns DeleteOportunidadeTaskResponse Tarefa removida com sucesso
   * @throws ApiError
   */
  public deleteOportunidadeTask({
    requestBody,
  }: {
    requestBody: {
      /**
       * ID da empresa dona da oportunidade.
       */
      companyId: string;
      /**
       * ID da oportunidade dona da tarefa.
       */
      oportunidadeId: string;
      /**
       * ID da tarefa.
       */
      taskId: string;
    },
  }): CancelablePromise<DeleteOportunidadeTaskResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/delete-oportunidade-task',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Cria uma nota interna da oportunidade
   * Adiciona uma nota ou comentário interno vinculado à oportunidade.
   * @returns CreateOportunidadeNoteResponse Nota criada com sucesso
   * @throws ApiError
   */
  public createOportunidadeNote({
    requestBody,
  }: {
    requestBody: {
      /**
       * ID da empresa dona da oportunidade.
       */
      companyId: string;
      /**
       * ID da oportunidade que receberá a nota.
       */
      oportunidadeId: string;
      /**
       * Conteúdo textual da nota.
       */
      content: string;
    },
  }): CancelablePromise<CreateOportunidadeNoteResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/create-oportunidade-note',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Remove uma nota da oportunidade
   * Exclui uma nota interna previamente registrada para a oportunidade.
   * @returns DeleteOportunidadeNoteResponse Nota removida com sucesso
   * @throws ApiError
   */
  public deleteOportunidadeNote({
    requestBody,
  }: {
    requestBody: {
      /**
       * ID da empresa dona da oportunidade.
       */
      companyId: string;
      /**
       * ID da oportunidade dona da nota.
       */
      oportunidadeId: string;
      /**
       * ID da nota.
       */
      noteId: string;
    },
  }): CancelablePromise<DeleteOportunidadeNoteResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/delete-oportunidade-note',
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
