/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type FetchUserResponse = {
  /**
   * Identificador único do usuário
   */
  id: string;
  /**
   * E-mail do usuário
   */
  email: string;
  /**
   * Nome completo
   */
  name: string;
  /**
   * Se o e-mail foi verificado
   */
  emailVerified: boolean;
  /**
   * URL da imagem do perfil
   */
  image?: (string | null);
  /**
   * Hash da senha (não expor ao cliente público)
   */
  password?: (string | null);
  /**
   * Data de criação
   */
  createdAt: string;
  /**
   * Data de atualização
   */
  updatedAt: string;
};

