/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateLicitacaoResponse } from '../models/CreateLicitacaoResponse';
import type { ListLicitacoesResponse } from '../models/ListLicitacoesResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class LicitacaoService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Lista licitações da empresa
   * Retorna todas as licitações (edital + tender) vinculadas à empresa.
   * @returns ListLicitacoesResponse Lista retornada com sucesso
   * @throws ApiError
   */
  public listLicitacoes({
    orgId,
    companyId,
  }: {
    orgId: string,
    companyId: string,
  }): CancelablePromise<ListLicitacoesResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/licitacao/list-licitacoes',
      query: {
        'orgId': orgId,
        'companyId': companyId,
      },
    });
  }
  /**
   * Cria uma nova licitação
   * Cria um edital e uma licitação vinculada para a empresa especificada.
   * @returns CreateLicitacaoResponse Licitação criada com sucesso
   * @throws ApiError
   */
  public createLicitacao({
    requestBody,
  }: {
    requestBody: {
      /**
       * ID da organização
       */
      orgId: string;
      /**
       * ID da empresa
       */
      companyId: string;
      /**
       * Objeto da licitação
       */
      object: string;
      /**
       * Modalidade
       */
      modality: string;
      contractType?: (string | null);
      estimatedValue?: (number | null);
      editalNumber?: (string | null);
      portal?: (string | null);
      sphere?: (string | null);
      state?: (string | null);
      editalUrl?: (string | null);
      publicationDate?: (string | null);
      openingDate?: (string | null);
      proposalDeadline?: (string | null);
      processNumber?: (string | null);
      uasg?: (string | null);
      proposalDeadlineTime?: (string | null);
      bidInterval?: (number | null);
      judgmentCriteria?: (string | null);
      disputeMode?: (string | null);
      proposalValidityDays?: (number | null);
      clarificationDeadline?: (string | null);
      regionality?: (string | null);
      exclusiveSmallBusiness?: boolean;
      allowsAdhesion?: boolean;
      rules?: ({
        deliveryDays?: (number | null);
        acceptanceDays?: (number | null);
        liquidationDays?: (number | null);
        paymentDays?: (number | null);
        guaranteeType?: (string | null);
        guaranteeMonths?: (number | null);
        installation?: (string | null);
      } | null);
      logistics?: ({
        agencyCnpj?: (string | null);
        agencyStateRegistration?: (string | null);
        deliveryLocation?: (string | null);
        zipCode?: (string | null);
        street?: (string | null);
        number?: (string | null);
        neighborhood?: (string | null);
        city?: (string | null);
        state?: (string | null);
        complement?: (string | null);
        auctioneerName?: (string | null);
        auctioneerContact?: (string | null);
        contractManagerName?: (string | null);
        contractManagerContact?: (string | null);
        notes?: (string | null);
      } | null);
      requiredDocuments?: Array<string>;
      managingAgencies?: Array<{
        name: string;
        cnpj?: (string | null);
      }>;
      participatingAgencies?: Array<{
        name: string;
        cnpj?: (string | null);
      }>;
    },
  }): CancelablePromise<CreateLicitacaoResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/licitacao/create-licitacao',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
