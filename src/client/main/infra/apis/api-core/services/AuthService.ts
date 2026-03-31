/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeleteUserResponse } from '../models/DeleteUserResponse';
import type { FetchUserResponse } from '../models/FetchUserResponse';
import type { RegisterUserResponse } from '../models/RegisterUserResponse';
import type { UpdateUserResponse } from '../models/UpdateUserResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class AuthService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Busca um usuário por campo
   * Retorna um usuário buscando por 'id', 'email' ou outro campo suportado.
   * @returns FetchUserResponse Usuário encontrado
   * @throws ApiError
   */
  public fetchUser({
    field,
    value,
  }: {
    field: string,
    value: string,
  }): CancelablePromise<FetchUserResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/fetch-user',
      query: {
        'field': field,
        'value': value,
      },
    });
  }
  /**
   * Cadastra um novo usuário
   * Cria um usuário no sistema.
   * @returns RegisterUserResponse Usuário criado
   * @throws ApiError
   */
  public registerUser({
    requestBody,
  }: {
    requestBody: {
      /**
       * ID do usuário (opcional, gerado pelo sistema)
       */
      id?: string;
      /**
       * E-mail do usuário
       */
      email: string;
      /**
       * Hash da senha (opcional)
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
       * Data de criação (opcional)
       */
      createdAt?: string;
      /**
       * Data de atualização (opcional)
       */
      updatedAt?: string;
    },
  }): CancelablePromise<RegisterUserResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/register-user',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Atualiza dados de um usuário
   * Atualiza campos do usuário (email, nome, senha, verificação e imagem).
   * @returns UpdateUserResponse Usuário atualizado
   * @throws ApiError
   */
  public updateUser({
    requestBody,
  }: {
    requestBody: {
      /**
       * ID do usuário
       */
      id: string;
      /**
       * Campos atualizáveis do usuário
       */
      data: {
        /**
         * E-mail do usuário
         */
        email?: string;
        /**
         * Hash da senha
         */
        password?: (string | null);
        /**
         * Nome completo
         */
        name?: string;
        /**
         * Se o e-mail foi verificado
         */
        emailVerified?: boolean;
        /**
         * URL da imagem do perfil
         */
        image?: (string | null);
      };
    },
  }): CancelablePromise<UpdateUserResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/update-user',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Remove um usuário
   * Remove o usuário pelo ID e retorna o registro removido.
   * @returns DeleteUserResponse Usuário removido
   * @throws ApiError
   */
  public deleteUser({
    requestBody,
  }: {
    requestBody: {
      /**
       * ID do usuário
       */
      id: string;
    },
  }): CancelablePromise<DeleteUserResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/delete-user',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
