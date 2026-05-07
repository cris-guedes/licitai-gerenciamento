/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type OportunidadeBoardItem = {
  /**
   * ID da oportunidade listada no board.
   */
  oportunidadeId: string;
  /**
   * Status técnico atual da oportunidade.
   */
  oportunidadeStatus: 'DRAFT' | 'ACTIVE' | 'CANCELLED';
  /**
   * ID da licitação oficial vinculada à oportunidade.
   */
  licitacaoId: (string | null);
  /**
   * ID do edital técnico vinculado.
   */
  editalId: (string | null);
  /**
   * ID da definição de workflow usada pela oportunidade.
   */
  workflowDefinitionId: (string | null);
  /**
   * Título principal exibido no card ou linha do board.
   */
  title: string;
  /**
   * Número resumido do edital ou licitação.
   */
  numero: (string | null);
  /**
   * Modalidade principal da oportunidade.
   */
  modalidade: (string | null);
  /**
   * Resumo do objeto da contratação.
   */
  objetoResumo: (string | null);
  /**
   * Valor estimado principal da oportunidade já formatável pela UI.
   */
  valorEstimado: (string | null);
  /**
   * Órgão principal associado à oportunidade.
   */
  orgaoNome: (string | null);
  /**
   * Usuário responsável pela movimentação da oportunidade.
   */
  responsavel: ({
    /**
     * ID do usuário responsável pela oportunidade.
     */
    id: string;
    /**
     * Nome do responsável.
     */
    name: string;
    /**
     * E-mail do responsável.
     */
    email: string;
  } | null);
  /**
   * Recorte atual do workflow aplicado à oportunidade.
   */
  workflow: {
    /**
     * Nó corrente exato do workflow.
     */
    currentNode: ({
      /**
       * ID do nó atual no workflow.
       */
      id: string;
      /**
       * Chave estável do nó.
       */
      key: string;
      /**
       * Nome legível do nó.
       */
      label: string;
      /**
       * Cor opcional do nó.
       */
      color: (string | null);
      /**
       * Caminho completo do nó dentro do workflow.
       */
      path: string;
      /**
       * Indica se este nó é inicial dentro do seu contexto.
       */
      isInitial: boolean;
      /**
       * Indica se o nó representa um encerramento do fluxo.
       */
      isTerminal: boolean;
    } | null);
    /**
     * Nó usado como coluna do kanban.
     */
    phase: ({
      /**
       * ID do nó atual no workflow.
       */
      id: string;
      /**
       * Chave estável do nó.
       */
      key: string;
      /**
       * Nome legível do nó.
       */
      label: string;
      /**
       * Cor opcional do nó.
       */
      color: (string | null);
      /**
       * Caminho completo do nó dentro do workflow.
       */
      path: string;
      /**
       * Indica se este nó é inicial dentro do seu contexto.
       */
      isInitial: boolean;
      /**
       * Indica se o nó representa um encerramento do fluxo.
       */
      isTerminal: boolean;
    } | null);
    /**
     * Nó usado como badge principal do card.
     */
    status: ({
      /**
       * ID do nó atual no workflow.
       */
      id: string;
      /**
       * Chave estável do nó.
       */
      key: string;
      /**
       * Nome legível do nó.
       */
      label: string;
      /**
       * Cor opcional do nó.
       */
      color: (string | null);
      /**
       * Caminho completo do nó dentro do workflow.
       */
      path: string;
      /**
       * Indica se este nó é inicial dentro do seu contexto.
       */
      isInitial: boolean;
      /**
       * Indica se o nó representa um encerramento do fluxo.
       */
      isTerminal: boolean;
    } | null);
    /**
     * Nó usado como contexto secundário do card.
     */
    situation: ({
      /**
       * ID do nó atual no workflow.
       */
      id: string;
      /**
       * Chave estável do nó.
       */
      key: string;
      /**
       * Nome legível do nó.
       */
      label: string;
      /**
       * Cor opcional do nó.
       */
      color: (string | null);
      /**
       * Caminho completo do nó dentro do workflow.
       */
      path: string;
      /**
       * Indica se este nó é inicial dentro do seu contexto.
       */
      isInitial: boolean;
      /**
       * Indica se o nó representa um encerramento do fluxo.
       */
      isTerminal: boolean;
    } | null);
    /**
     * Data ISO da última alteração manual do workflow.
     */
    updatedAt: (string | null);
  };
  /**
   * Quantidade de itens da licitação que estão vinculados à oportunidade.
   */
  itemCount: number;
  /**
   * Data ISO de criação da oportunidade.
   */
  createdAt: string;
  /**
   * Data ISO da última atualização da oportunidade.
   */
  updatedAt: string;
  /**
   * Indica se o usuário autenticado pode mover esta oportunidade no board.
   */
  canMove: boolean;
};

