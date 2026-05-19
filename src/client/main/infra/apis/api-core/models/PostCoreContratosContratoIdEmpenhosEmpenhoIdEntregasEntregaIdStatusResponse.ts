/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PostCoreContratosContratoIdEmpenhosEmpenhoIdEntregasEntregaIdStatusResponse = {
  /**
   * ID da entrega criada.
   */
  id: string;
  /**
   * ID do item do empenho entregue.
   */
  empenhoItemId: string;
  /**
   * ID do local de entrega vinculado.
   */
  localEntregaId?: (string | null);
  /**
   * Quantidade reservada para entrega.
   */
  quantidadeEntregue: (string | number);
  /**
   * Data em que a entrega foi concluída.
   */
  dataEntrega?: (string | null);
  /**
   * Status atual da entrega no pipeline.
   */
  status: string;
  /**
   * Observações registradas para a entrega.
   */
  observacao: (string | null);
};

