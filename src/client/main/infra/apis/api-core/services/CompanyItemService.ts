/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateCompanyItemResponse } from '../models/CreateCompanyItemResponse';
import type { DeleteCompanyItemResponse } from '../models/DeleteCompanyItemResponse';
import type { FetchCompanyItemByIdResponse } from '../models/FetchCompanyItemByIdResponse';
import type { ListCompanyItemsResponse } from '../models/ListCompanyItemsResponse';
import type { UpdateCompanyItemResponse } from '../models/UpdateCompanyItemResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class CompanyItemService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Busca um item da empresa por ID
   * Retorna um item do catálogo interno da empresa a partir do seu identificador.
   * @returns FetchCompanyItemByIdResponse Item da empresa encontrado
   * @throws ApiError
   */
  public fetchCompanyItemById({
    companyId,
    companyItemId,
  }: {
    companyId: string,
    companyItemId: string,
  }): CancelablePromise<FetchCompanyItemByIdResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/company-item/fetch-company-item-by-id',
      query: {
        'companyId': companyId,
        'companyItemId': companyItemId,
      },
    });
  }
  /**
   * Lista itens da empresa
   * Retorna os itens cadastrados para a empresa informada.
   * @returns ListCompanyItemsResponse Lista de itens retornada
   * @throws ApiError
   */
  public listCompanyItems({
    companyId,
  }: {
    companyId: string,
  }): CancelablePromise<ListCompanyItemsResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/company-item/list-company-items',
      query: {
        'companyId': companyId,
      },
    });
  }
  /**
   * Cria um item da empresa
   * Cadastra um novo item no catálogo interno da empresa.
   * @returns CreateCompanyItemResponse Item da empresa criado com sucesso
   * @throws ApiError
   */
  public createCompanyItem({
    requestBody,
  }: {
    requestBody: {
      /**
       * Codigo interno do item
       */
      codigo: string;
      /**
       * Descricao principal do item
       */
      descricao: string;
      /**
       * Marca comercial do item, quando informada
       */
      marca?: (string | null);
      /**
       * Unidade de medida operacional do item
       */
      unidadeMedida: string;
      /**
       * Imagem principal do item para exibição no catálogo
       */
      imageUrl?: (string | null);
      /**
       * Preço de referência do item
       */
      precoReferencia?: (number | null);
      /**
       * Permite ativar ou inativar o item
       */
      ativo?: boolean;
      /**
       * ID da empresa dona do item
       */
      companyId: string;
    },
  }): CancelablePromise<CreateCompanyItemResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/company-item/create-company-item',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Atualiza um item da empresa
   * Atualiza os campos editáveis de um item do catálogo interno da empresa.
   * @returns UpdateCompanyItemResponse Item da empresa atualizado com sucesso
   * @throws ApiError
   */
  public updateCompanyItem({
    requestBody,
  }: {
    requestBody: {
      /**
       * ID da empresa dona do item
       */
      companyId: string;
      /**
       * ID do item a ser atualizado
       */
      companyItemId: string;
      /**
       * Campos editáveis do item
       */
      data: {
        /**
         * Codigo interno do item
         */
        codigo?: string;
        /**
         * Descricao principal do item
         */
        descricao?: string;
        /**
         * Marca comercial do item, quando informada
         */
        marca?: (string | null);
        /**
         * Unidade de medida operacional do item
         */
        unidadeMedida?: string;
        /**
         * Imagem principal do item para exibição no catálogo
         */
        imageUrl?: (string | null);
        /**
         * Preço de referência do item
         */
        precoReferencia?: (number | null);
        /**
         * Permite ativar ou inativar o item
         */
        ativo?: boolean;
      };
    },
  }): CancelablePromise<UpdateCompanyItemResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/company-item/update-company-item',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Remove um item da empresa
   * Exclui um item do catálogo interno da empresa.
   * @returns DeleteCompanyItemResponse Item da empresa removido com sucesso
   * @throws ApiError
   */
  public deleteCompanyItem({
    requestBody,
  }: {
    requestBody: {
      /**
       * ID da empresa dona do item
       */
      companyId: string;
      /**
       * ID do item a ser removido
       */
      companyItemId: string;
    },
  }): CancelablePromise<DeleteCompanyItemResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/company-item/delete-company-item',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
