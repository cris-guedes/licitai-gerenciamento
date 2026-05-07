/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type WorkflowTransition = {
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
};

