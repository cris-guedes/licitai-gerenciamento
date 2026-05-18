/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ToggleOportunidadeTaskResponse = {
  /**
   * Tarefa atualizada.
   */
  task: {
    id: string;
    title: string;
    status: 'OPEN' | 'DONE';
    dueAt: (string | null);
    completedAt: (string | null);
    createdAt: string;
    updatedAt: string;
    createdBy: {
      id: string;
      name: string;
      email: string;
    };
  };
};

