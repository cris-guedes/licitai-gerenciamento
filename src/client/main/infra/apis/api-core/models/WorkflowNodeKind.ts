/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type WorkflowNodeKind = {
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
};

