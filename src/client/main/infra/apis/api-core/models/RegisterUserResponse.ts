/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type RegisterUserResponse = {
  /**
   * ID do usuário
   */
  id: string;
  /**
   * E-mail do usuário
   */
  email: string;
  /**
   * Hash da senha
   */
  password?: (string | null);
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
   * Data de criação
   */
  createdAt: string;
  /**
   * Data de atualização
   */
  updatedAt: string;
};

