/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type FinalizeOportunidadeRegistrationResponse = {
  /**
   * ID da oportunidade consumada.
   */
  oportunidadeId: string;
  /**
   * Status final da oportunidade após a consumação.
   */
  oportunidadeStatus: 'ACTIVE';
  /**
   * ID da licitação oficial preenchida.
   */
  licitacaoId: string;
  /**
   * Status técnico do cadastro da licitação após a conclusão.
   */
  licitacaoStatus: 'COMPLETED';
  /**
   * ID do edital preenchido com sua estrutura rica.
   */
  editalId: string;
  /**
   * Status técnico do cadastro do edital após a conclusão.
   */
  editalStatus: 'COMPLETED';
};

