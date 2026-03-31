/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AcceptInviteResponse } from '../models/AcceptInviteResponse';
import type { CreateInviteResponse } from '../models/CreateInviteResponse';
import type { CreateMemberResponse } from '../models/CreateMemberResponse';
import type { GetInviteResponse } from '../models/GetInviteResponse';
import type { ListMembersResponse } from '../models/ListMembersResponse';
import type { RemoveMemberResponse } from '../models/RemoveMemberResponse';
import type { UpdateMemberRoleResponse } from '../models/UpdateMemberRoleResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class TeamService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Lista membros da organização
   * Retorna todos os membros com seus papéis.
   * @returns ListMembersResponse Lista de membros retornada
   * @throws ApiError
   */
  public listMembers({
    organizationId,
  }: {
    organizationId: string,
  }): CancelablePromise<ListMembersResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/team/list-members',
      query: {
        'organizationId': organizationId,
      },
    });
  }
  /**
   * Cria membro diretamente
   * Cria um usuário e o vincula à organização com o papel especificado.
   * @returns CreateMemberResponse Membro criado
   * @throws ApiError
   */
  public createMember({
    requestBody,
  }: {
    requestBody: {
      /**
       * Nome do novo membro
       */
      name: string;
      /**
       * Email do novo membro
       */
      email: string;
      /**
       * Senha do novo membro
       */
      password: string;
      /**
       * Papel do membro na organizacao
       */
      role: 'ADMIN' | 'MEMBER';
      /**
       * ID da organizacao
       */
      organizationId: string;
      /**
       * ID da empresa
       */
      companyId: string;
    },
  }): CancelablePromise<CreateMemberResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/team/create-member',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Gera link de convite
   * Cria um convite com token e retorna a URL para envio.
   * @returns CreateInviteResponse Convite criado
   * @throws ApiError
   */
  public createInvite({
    requestBody,
  }: {
    requestBody: {
      /**
       * Email do convidado
       */
      email: string;
      /**
       * Papel do convidado na organizacao
       */
      role: 'ADMIN' | 'MEMBER';
      /**
       * ID da organizacao
       */
      organizationId: string;
      /**
       * ID da empresa
       */
      companyId: string;
    },
  }): CancelablePromise<CreateInviteResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/team/create-invite',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Busca dados de um convite
   * Retorna informações públicas do convite para exibição na página de aceite.
   * @returns GetInviteResponse Dados do convite retornados
   * @throws ApiError
   */
  public getInvite({
    token,
  }: {
    token: string,
  }): CancelablePromise<GetInviteResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/team/get-invite',
      query: {
        'token': token,
      },
    });
  }
  /**
   * Aceita convite e cria conta
   * Valida o token, cria usuário se necessário, vincula à organização e marca convite como usado.
   * @returns AcceptInviteResponse Convite aceito
   * @throws ApiError
   */
  public acceptInvite({
    requestBody,
  }: {
    requestBody: {
      /**
       * Token do convite
       */
      token: string;
      /**
       * Nome do usuario que esta aceitando o convite
       */
      name: string;
      /**
       * Senha para a nova conta
       */
      password: string;
    },
  }): CancelablePromise<AcceptInviteResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/team/accept-invite',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Atualiza papel de um membro
   * Altera o papel de um membro (ADMIN ou MEMBER). Não permite alterar OWNERs.
   * @returns UpdateMemberRoleResponse Papel atualizado
   * @throws ApiError
   */
  public updateMemberRole({
    requestBody,
  }: {
    requestBody: {
      /**
       * ID da membership a ser atualizada
       */
      membershipId: string;
      /**
       * Novo papel do membro
       */
      role: 'ADMIN' | 'MEMBER';
    },
  }): CancelablePromise<UpdateMemberRoleResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/team/update-member-role',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Remove um membro
   * Remove o vínculo de um membro da organização. Não permite remover OWNERs.
   * @returns RemoveMemberResponse Membro removido
   * @throws ApiError
   */
  public removeMember({
    requestBody,
  }: {
    requestBody: {
      /**
       * ID da membership a ser removida
       */
      membershipId: string;
    },
  }): CancelablePromise<RemoveMemberResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/team/remove-member',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
