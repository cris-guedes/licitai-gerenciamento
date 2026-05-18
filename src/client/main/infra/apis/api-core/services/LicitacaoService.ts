/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeleteLicitacaoDocumentResponse } from '../models/DeleteLicitacaoDocumentResponse';
import type { DeleteLicitacaoDraftResponse } from '../models/DeleteLicitacaoDraftResponse';
import type { ExtractEditalDataPostEmbedingResponse } from '../models/ExtractEditalDataPostEmbedingResponse';
import type { ExtractEditalDataPostEmbedingStreamResponse } from '../models/ExtractEditalDataPostEmbedingStreamResponse';
import type { ExtractEditalDataResponse } from '../models/ExtractEditalDataResponse';
import type { ExtractEditalDataStreamResponse } from '../models/ExtractEditalDataStreamResponse';
import type { FinalizeOportunidadeRegistrationResponse } from '../models/FinalizeOportunidadeRegistrationResponse';
import type { GetLicitacaoWorkspaceResponse } from '../models/GetLicitacaoWorkspaceResponse';
import type { ListKnownOrgaosResponse } from '../models/ListKnownOrgaosResponse';
import type { ListLicitacaoDraftsResponse } from '../models/ListLicitacaoDraftsResponse';
import type { UploadEditalDocumentResponse } from '../models/UploadEditalDocumentResponse';
import type { UploadLicitacaoDocumentStreamResponse } from '../models/UploadLicitacaoDocumentStreamResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class LicitacaoService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Lista órgãos públicos já utilizados pela empresa
   * Retorna órgãos gerenciadores e participantes já cadastrados em licitações anteriores da empresa para reaproveitamento no formulário.
   * @returns ListKnownOrgaosResponse Órgãos reutilizáveis carregados com sucesso
   * @throws ApiError
   */
  public listKnownOrgaos({
    companyId,
  }: {
    companyId: string,
  }): CancelablePromise<ListKnownOrgaosResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/list-known-orgaos',
      query: {
        'companyId': companyId,
      },
    });
  }
  /**
   * Lista licitações em andamento
   * Retorna os rascunhos de licitação ainda não concluídos para a empresa selecionada.
   * @returns ListLicitacaoDraftsResponse Rascunhos encontrados
   * @throws ApiError
   */
  public listLicitacaoDrafts({
    companyId,
  }: {
    companyId: string,
  }): CancelablePromise<ListLicitacaoDraftsResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/list-licitacao-drafts',
      query: {
        'companyId': companyId,
      },
    });
  }
  /**
   * Recupera o workspace de IA de uma licitação em andamento
   * Retorna documentos, análises persistidas e URLs temporárias do workspace de IA para continuar uma licitação em progresso.
   * @returns GetLicitacaoWorkspaceResponse Workspace recuperado com sucesso
   * @throws ApiError
   */
  public getLicitacaoWorkspace({
    companyId,
    oportunidadeId,
  }: {
    companyId: string,
    oportunidadeId: string,
  }): CancelablePromise<GetLicitacaoWorkspaceResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/get-licitacao-workspace',
      query: {
        'companyId': companyId,
        'oportunidadeId': oportunidadeId,
      },
    });
  }
  /**
   * Exclui um rascunho de licitação
   * Remove uma licitação em andamento, seus documentos relacionados e o contexto vetorial associado.
   * @returns DeleteLicitacaoDraftResponse Rascunho excluído com sucesso
   * @throws ApiError
   */
  public deleteLicitacaoDraft({
    requestBody,
  }: {
    requestBody: {
      /**
       * ID da empresa dona do rascunho.
       */
      companyId: string;
      /**
       * ID da oportunidade em rascunho que será excluída.
       */
      oportunidadeId: string;
    },
  }): CancelablePromise<DeleteLicitacaoDraftResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/delete-licitacao-draft',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Faz upload simples do edital
   * Recebe o PDF principal do edital em multipart/form-data, armazena o documento e retorna os metadados necessários para preview no cadastro.
   * @returns UploadEditalDocumentResponse Edital enviado com sucesso
   * @throws ApiError
   */
  public uploadEditalDocument({
    formData,
  }: {
    formData: {
      /**
       * ID da empresa dona do edital enviado
       */
      companyId: string;
      /**
       * Arquivo PDF do edital de licitação
       */
      file: Blob;
    },
  }): CancelablePromise<UploadEditalDocumentResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/upload-edital-document',
      formData: formData,
      mediaType: 'multipart/form-data',
    });
  }
  /**
   * Faz upload e processa um documento da licitação em stream
   * Recebe um PDF de edital, anexo ou outro documento via upload (multipart/form-data), persiste no R2, executa chunking + embeddings e retorna um SSE com o andamento do processamento.
   * @returns UploadLicitacaoDocumentStreamResponse Stream SSE iniciado
   * @throws ApiError
   */
  public uploadLicitacaoDocumentStream({
    companyId,
    documentType,
    formData,
    oportunidadeId,
    editalId,
    replaceDocumentId,
  }: {
    companyId: string,
    documentType: 'EDITAL' | 'ANEXO' | 'OUTRO',
    formData: {
      /**
       * Arquivo PDF do documento da licitação
       */
      file: Blob;
    },
    oportunidadeId?: string,
    editalId?: string,
    replaceDocumentId?: string,
  }): CancelablePromise<UploadLicitacaoDocumentStreamResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/upload-licitacao-document/stream',
      query: {
        'companyId': companyId,
        'oportunidadeId': oportunidadeId,
        'editalId': editalId,
        'replaceDocumentId': replaceDocumentId,
        'documentType': documentType,
      },
      formData: formData,
      mediaType: 'multipart/form-data',
    });
  }
  /**
   * Exclui um documento da licitação
   * Remove o documento do banco, do armazenamento e do índice vetorial.
   * @returns DeleteLicitacaoDocumentResponse Documento excluído com sucesso
   * @throws ApiError
   */
  public deleteLicitacaoDocument({
    requestBody,
  }: {
    requestBody: {
      /**
       * ID da empresa dona do documento.
       */
      companyId: string;
      /**
       * ID do documento que será excluído.
       */
      documentId: string;
    },
  }): CancelablePromise<DeleteLicitacaoDocumentResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/delete-licitacao-document',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Consuma o cadastro final da oportunidade
   * Recebe o formulário consolidado da licitação, preenche licitação, edital, órgãos, itens e distribuição, e ativa a oportunidade para gestão interna.
   * @returns FinalizeOportunidadeRegistrationResponse Cadastro final concluído com sucesso
   * @throws ApiError
   */
  public finalizeOportunidadeRegistration({
    requestBody,
  }: {
    requestBody: {
      /**
       * ID da empresa dona da oportunidade.
       */
      companyId: string;
      /**
       * ID opcional da oportunidade em rascunho que será consumada.
       */
      oportunidadeId?: string;
      /**
       * Payload do formulário de cadastro consolidado da licitação.
       */
      form: {
        numeroLicitacao: string;
        ano: string;
        processo: string;
        modalidade: string;
        objeto: string;
        orgaoGerenciador: {
          cnpj: string;
          nome: string;
          codigoUnidade: string;
          nomeUnidade: string;
          municipio: string;
          uf: string;
          esfera: string;
          poder: string;
          itensSolicitados: Array<{
            itemId: string;
            quantidade: string;
          }>;
        };
        valorTotalEstimado: string;
        valorTotalHomologado: string;
        srp: string;
        situacao: string;
        dataPublicacao: string;
        dataUltimaAtualizacao: string;
        linkProcesso: string;
        identificadorExterno: string;
        edital: {
          amparoLegal: string;
          orgaosParticipantes: Array<{
            cnpj: string;
            nome: string;
            codigoUnidade: string;
            nomeUnidade: string;
            municipio: string;
            uf: string;
            esfera: string;
            poder: string;
            itensSolicitados: Array<{
              itemId: string;
              quantidade: string;
            }>;
          }>;
          cronograma: {
            acolhimentoInicio: string;
            acolhimentoFim: string;
            horaLimite: string;
            sessaoPublica: string;
            horaSessaoPublica: string;
            esclarecimentosAte: string;
            impugnacaoAte: string;
          };
          certame: {
            modoDisputa: string;
            criterioJulgamento: string;
            tipoLance: string;
            intervaloLances: string;
            duracaoSessaoMinutos: string;
            exclusivoMeEpp: string;
            permiteConsorcio: string;
            exigeVisitaTecnica: string;
            regionalidade: string;
            permiteAdesao: string;
            percentualAdesao: string;
            vigenciaAtaMeses: string;
            vigenciaContratoDias: string;
            difal: string;
          };
          itens: Array<{
            itemId: string;
            numero: string;
            descricao: string;
            tipo: string;
            lote: string;
            quantidade: string;
            unidadeMedida: string;
            valorUnitarioEstimado: string;
            valorTotal: string;
            codigoNcmNbs: string;
            descricaoNcmNbs: string;
            codigoCatmatCatser: string;
            criterioJulgamento: string;
            beneficioTributario: string;
            observacao: string;
          }>;
          execucao: {
            entrega: {
              prazoEmDias: string;
              localEntrega: string;
              tipoEntrega: string;
              responsavelInstalacao: string;
            };
            pagamento: {
              prazoEmDias: string;
            };
            aceite: {
              prazoEmDias: string;
            };
            validadeProposta: string;
            garantia: {
              tipo: string;
              meses: string;
              tempoAtendimentoHoras: string;
            };
          };
          habilitacao: Array<{
            tipo: string;
            categoria: string;
            obrigatorio: string;
          }>;
          informacaoComplementar: string;
        };
      };
    },
  }): CancelablePromise<FinalizeOportunidadeRegistrationResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/finalize-oportunidade-registration',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Extrai dados de um edital de licitação
   * Recebe um PDF de edital via upload (multipart/form-data), processa via RAG (busca vetorial + LLM) e retorna a licitação estruturada no modelo de domínio.
   * @returns ExtractEditalDataResponse Dados extraídos com sucesso
   * @throws ApiError
   */
  public extractEditalData({
    companyId,
    formData,
  }: {
    companyId: string,
    formData: {
      /**
       * Arquivo PDF do edital de licitação
       */
      file: Blob;
    },
  }): CancelablePromise<ExtractEditalDataResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/extract-edital-data',
      query: {
        'companyId': companyId,
      },
      formData: formData,
      mediaType: 'multipart/form-data',
    });
  }
  /**
   * Extrai dados de um edital de licitação (Stream SSE)
   * Recebe um PDF de edital via upload (multipart/form-data) e retorna um EventStream (SSE) com o progresso do processamento em tempo real.
   * @returns ExtractEditalDataStreamResponse Stream SSE iniciado
   * @throws ApiError
   */
  public extractEditalDataStream({
    companyId,
    formData,
  }: {
    companyId: string,
    formData: {
      /**
       * Arquivo PDF do edital de licitação
       */
      file: Blob;
    },
  }): CancelablePromise<ExtractEditalDataStreamResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/extract-edital-data/stream',
      query: {
        'companyId': companyId,
      },
      formData: formData,
      mediaType: 'multipart/form-data',
    });
  }
  /**
   * Extrai dados de um edital já pré-processado
   * Reutiliza um documento já indexado no banco vetorial e executa a extração estruturada sem reenviar nem reprocessar o PDF.
   * @returns ExtractEditalDataPostEmbedingResponse Dados extraídos com sucesso a partir do documento pré-processado
   * @throws ApiError
   */
  public extractEditalDataPostEmbeding({
    companyId,
    documentId,
    requestBody,
  }: {
    companyId: string,
    documentId: string,
    requestBody: null,
  }): CancelablePromise<ExtractEditalDataPostEmbedingResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/extract-edital-data-post-embeding',
      query: {
        'companyId': companyId,
        'documentId': documentId,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Extrai dados de um edital já pré-processado (Stream SSE)
   * Reutiliza um documento já indexado e retorna um EventStream (SSE) com o progresso da extração pós-embedding em tempo real.
   * @returns ExtractEditalDataPostEmbedingStreamResponse Stream SSE iniciado
   * @throws ApiError
   */
  public extractEditalDataPostEmbedingStream({
    companyId,
    documentId,
    requestBody,
  }: {
    companyId: string,
    documentId: string,
    requestBody: null,
  }): CancelablePromise<ExtractEditalDataPostEmbedingStreamResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/extract-edital-data-post-embeding/stream',
      query: {
        'companyId': companyId,
        'documentId': documentId,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
