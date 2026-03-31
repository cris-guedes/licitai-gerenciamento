/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ListMembersResponse = {
  /**
   * Lista de membros da organizacao
   */
  members: Array<{
    /**
     * ID da membership
     */
    membershipId: string;
    /**
     * ID do usuario
     */
    userId: string;
    /**
     * Nome do membro
     */
    name: string;
    /**
     * Email do membro
     */
    email: string;
    /**
     * Papel do membro (OWNER, ADMIN, MEMBER)
     */
    role: string;
    /**
     * Data de entrada na organizacao
     */
    createdAt: string;
  }>;
};

