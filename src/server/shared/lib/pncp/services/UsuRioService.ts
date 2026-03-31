/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AlterarParcialPermissaoUsuarioDTO } from '../models/AlterarParcialPermissaoUsuarioDTO';
import type { AlterarUsuarioDTO } from '../models/AlterarUsuarioDTO';
import type { CamposLoginDTO } from '../models/CamposLoginDTO';
import type { CredenciaisDTO } from '../models/CredenciaisDTO';
import type { IncluirUsuarioOrgaoDTO } from '../models/IncluirUsuarioOrgaoDTO';
import type { InserirUsuarioDTO } from '../models/InserirUsuarioDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsuRioService {
  /**
   * Consultar usuário por ID
   * @returns CredenciaisDTO OK
   * @throws ApiError
   */
  public static get({
    id,
  }: {
    id: number,
  }): CancelablePromise<CredenciaisDTO> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/usuarios/{id}',
      path: {
        'id': id,
      },
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        422: `Unprocessable Entity`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Atualizar usuário
   * @returns any OK
   * @throws ApiError
   */
  public static put({
    id,
    requestBody,
  }: {
    id: number,
    requestBody: AlterarUsuarioDTO,
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/usuarios/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        422: `Unprocessable Entity`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Excluir usuário
   * @returns any OK
   * @throws ApiError
   */
  public static delete({
    id,
  }: {
    id: number,
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/v1/usuarios/{id}',
      path: {
        'id': id,
      },
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        422: `Unprocessable Entity`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Consultar usuário por login ou por CPF/CNPJ
   * @returns CredenciaisDTO OK
   * @throws ApiError
   */
  public static getByLoginNi({
    login,
    cpfCnpj,
  }: {
    login?: string,
    cpfCnpj?: string,
  }): CancelablePromise<Array<CredenciaisDTO>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/usuarios',
      query: {
        'login': login,
        'cpfCnpj': cpfCnpj,
      },
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        422: `Unprocessable Entity`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Inserir usuário
   * @returns CredenciaisDTO OK
   * @throws ApiError
   */
  public static post({
    requestBody,
  }: {
    requestBody: InserirUsuarioDTO,
  }): CancelablePromise<CredenciaisDTO> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/usuarios',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        422: `Unprocessable Entity`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Inserir Entes Autorizados para um Usuário
   * @returns any OK
   * @throws ApiError
   */
  public static post1({
    id,
    requestBody,
  }: {
    id: number,
    requestBody: IncluirUsuarioOrgaoDTO,
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/usuarios/{id}/orgaos',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        422: `Unprocessable Entity`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Excluir Entes Autorizados de um Usuário
   * @returns any OK
   * @throws ApiError
   */
  public static delete1({
    id,
    requestBody,
  }: {
    id: number,
    requestBody: IncluirUsuarioOrgaoDTO,
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/v1/usuarios/{id}/orgaos',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        422: `Unprocessable Entity`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Autenticação/login no sistema
   * @returns any OK
   * @throws ApiError
   */
  public static autenticar({
    requestBody,
  }: {
    requestBody: CamposLoginDTO,
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/usuarios/login',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        422: `Unprocessable Entity`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Alterar permissões do usuário
   * @returns any OK
   * @throws ApiError
   */
  public static alterarParcialmentePermissaoUsuario({
    id,
    requestBody,
  }: {
    id: number,
    requestBody: AlterarParcialPermissaoUsuarioDTO,
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'PATCH',
      url: '/v1/usuarios/{id}/permissoes',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        422: `Unprocessable Entity`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Consultar permissões
   * @returns any OK
   * @throws ApiError
   */
  public static obterTodasPermissoes(): CancelablePromise<Record<string, any>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/usuarios/permissoes',
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        422: `Unprocessable Entity`,
        500: `Internal Server Error`,
      },
    });
  }
}
