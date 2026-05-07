/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type OportunidadeBoardNode = {
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
};

