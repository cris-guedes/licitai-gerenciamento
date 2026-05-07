/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type WorkflowNode = {
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
};

