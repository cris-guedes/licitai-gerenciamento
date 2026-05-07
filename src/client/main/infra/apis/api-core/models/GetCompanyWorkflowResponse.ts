/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GetCompanyWorkflowResponse = {
  /**
   * Definição ativa do workflow da empresa, pronta para board e editor visual.
   */
  workflow: {
    /**
     * ID da definição de workflow ativa para a empresa.
     */
    id: string;
    /**
     * ID da empresa dona da definição.
     */
    companyId: string;
    /**
     * Nome do workflow.
     */
    name: string;
    /**
     * Slug estável da definição.
     */
    slug: string;
    /**
     * Versão da definição do workflow.
     */
    version: number;
    /**
     * Indica se esta é a definição ativa da empresa.
     */
    isActive: boolean;
    /**
     * Metadados globais da definição, como kinds usados no board.
     */
    metadata: null;
    /**
     * Data ISO de criação da definição.
     */
    createdAt: string;
    /**
     * Data ISO da última atualização da definição.
     */
    updatedAt: string;
    /**
     * Tipos de nós disponíveis neste workflow.
     */
    nodeKinds: Array<{
      /**
       * ID interno do tipo de nó do workflow.
       */
      id: string;
      /**
       * Chave estável usada pelo sistema para identificar o tipo de nó.
       */
      key: string;
      /**
       * Nome legível do tipo de nó.
       */
      label: string;
      /**
       * Descrição opcional do papel do tipo de nó.
       */
      description: (string | null);
      /**
       * Ordem de exibição do tipo dentro da definição.
       */
      order: number;
      /**
       * Tipo pai, quando houver hierarquia entre kinds.
       */
      parentKindId: (string | null);
      /**
       * Cor opcional associada ao tipo de nó.
       */
      color: (string | null);
      /**
       * Metadados livres usados para layout e configurações visuais.
       */
      metadata: null;
      /**
       * Data ISO de criação do tipo de nó.
       */
      createdAt: string;
      /**
       * Data ISO da última atualização do tipo de nó.
       */
      updatedAt: string;
    }>;
    /**
     * Nós hierárquicos que formam a estrutura do workflow.
     */
    nodes: Array<{
      /**
       * ID do nó do workflow.
       */
      id: string;
      /**
       * ID do tipo do nó.
       */
      kindId: string;
      /**
       * ID do nó pai, quando este nó estiver abaixo de outro.
       */
      parentId: (string | null);
      /**
       * Chave estável do nó.
       */
      key: string;
      /**
       * Nome legível do nó.
       */
      label: string;
      /**
       * Descrição opcional do nó.
       */
      description: (string | null);
      /**
       * Ordem do nó entre seus irmãos.
       */
      order: number;
      /**
       * Profundidade hierárquica do nó na árvore.
       */
      depth: number;
      /**
       * Caminho completo do nó dentro da definição do workflow.
       */
      path: string;
      /**
       * Cor opcional do nó.
       */
      color: (string | null);
      /**
       * Indica se o nó é considerado ponto inicial dentro do seu nível.
       */
      isInitial: boolean;
      /**
       * Indica se o nó representa um encerramento do fluxo.
       */
      isTerminal: boolean;
      /**
       * Metadados livres do nó, incluindo layout para editores visuais.
       */
      metadata: null;
      /**
       * Data ISO de criação do nó.
       */
      createdAt: string;
      /**
       * Data ISO da última atualização do nó.
       */
      updatedAt: string;
      /**
       * Resumo do tipo associado ao nó.
       */
      kind: {
        /**
         * ID do tipo do nó.
         */
        id: string;
        /**
         * Chave estável do tipo do nó.
         */
        key: string;
        /**
         * Nome legível do tipo do nó.
         */
        label: string;
        /**
         * Ordem do tipo do nó.
         */
        order: number;
        /**
         * Tipo pai do kind, quando existir.
         */
        parentKindId: (string | null);
        /**
         * Cor opcional do tipo do nó.
         */
        color: (string | null);
      };
    }>;
    /**
     * Transições permitidas entre os nós do workflow.
     */
    transitions: Array<{
      /**
       * ID interno da transição.
       */
      id: string;
      /**
       * ID do nó de origem.
       */
      fromNodeId: string;
      /**
       * ID do nó de destino.
       */
      toNodeId: string;
      /**
       * Tipo semântico opcional da transição.
       */
      transitionType: (string | null);
      /**
       * Metadados livres da transição, incluindo labels de visualização.
       */
      metadata: null;
      /**
       * Data ISO de criação da transição.
       */
      createdAt: string;
      /**
       * Data ISO da última atualização da transição.
       */
      updatedAt: string;
    }>;
  };
};

