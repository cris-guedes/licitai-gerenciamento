/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateOportunidadeNoteResponse = {
  /**
   * Nota criada para a oportunidade.
   */
  note: {
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    createdBy: {
      id: string;
      name: string;
      email: string;
    };
  };
};

