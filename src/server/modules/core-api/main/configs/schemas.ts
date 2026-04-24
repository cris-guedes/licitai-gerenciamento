import { SearchPublicProcurementsControllerSchemas, LicitacaoItemSchema } from "../../domain/use-cases/captacao/search-public-procurements/SearchPublicProcurementsControllerSchemas";
import { FetchExternalProcurementItemsControllerSchemas, ProcurementItemSchema, FetchProcurementItemsResponseSchema } from "../../domain/use-cases/captacao/fetch-external-procurement-items/FetchExternalProcurementItemsControllerSchemas";
import { FetchExternalProcurementDetailControllerSchemas, ProcurementDetailSchema } from "../../domain/use-cases/captacao/fetch-external-procurement-detail/FetchExternalProcurementDetailControllerSchemas";
import { FetchExternalProcurementFilesControllerSchemas, ProcurementFileSchema, FetchProcurementFilesResponseSchema } from "../../domain/use-cases/captacao/fetch-external-procurement-files/FetchExternalProcurementFilesControllerSchemas";
import { FetchExternalProcurementAtasControllerSchemas, ProcurementAtaSchema, FetchExternalProcurementAtasResponseSchema } from "../../domain/use-cases/captacao/fetch-external-procurement-atas/FetchExternalProcurementAtasControllerSchemas";
import { FetchExternalProcurementContractsControllerSchemas, ProcurementContractSchema, FetchExternalProcurementContractsResponseSchema } from "../../domain/use-cases/captacao/fetch-external-procurement-contracts/FetchExternalProcurementContractsControllerSchemas";
import { FetchExternalProcurementHistoryControllerSchemas, ProcurementHistoryEntrySchema, FetchExternalProcurementHistoryResponseSchema } from "../../domain/use-cases/captacao/fetch-external-procurement-history/FetchExternalProcurementHistoryControllerSchemas";
import { FetchExternalProcurementItemResultsControllerSchemas, ProcurementItemResultSchema, FetchExternalProcurementItemResultsResponseSchema } from "../../domain/use-cases/captacao/fetch-external-procurement-item-results/FetchExternalProcurementItemResultsControllerSchemas";
import { FetchExternalContractDetailControllerSchemas, ContractDetailSchema } from "../../domain/use-cases/captacao/fetch-external-contract-detail/FetchExternalContractDetailControllerSchemas";
import { FetchExternalContractFilesControllerSchemas, ContractFileSchema, FetchExternalContractFilesResponseSchema } from "../../domain/use-cases/captacao/fetch-external-contract-files/FetchExternalContractFilesControllerSchemas";
import { FetchExternalContractHistoryControllerSchemas, ContractHistoryEntrySchema, FetchExternalContractHistoryResponseSchema } from "../../domain/use-cases/captacao/fetch-external-contract-history/FetchExternalContractHistoryControllerSchemas";
import { FetchExternalContractTermsControllerSchemas, ContractTermSchema, FetchExternalContractTermsResponseSchema } from "../../domain/use-cases/captacao/fetch-external-contract-terms/FetchExternalContractTermsControllerSchemas";
import { FetchExternalAtaDetailControllerSchemas, AtaDetailSchema } from "../../domain/use-cases/captacao/fetch-external-ata-detail/FetchExternalAtaDetailControllerSchemas";
import { FetchExternalAtaFilesControllerSchemas, AtaFileSchema, FetchExternalAtaFilesResponseSchema } from "../../domain/use-cases/captacao/fetch-external-ata-files/FetchExternalAtaFilesControllerSchemas";
import { FetchExternalAtaHistoryControllerSchemas, AtaHistoryEntrySchema, FetchExternalAtaHistoryResponseSchema } from "../../domain/use-cases/captacao/fetch-external-ata-history/FetchExternalAtaHistoryControllerSchemas";
import { FetchCompanyByCnpjControllerSchemas } from "../../domain/use-cases/company-details/fetch-company-by-cnpj/FetchCompanyByCnpjControllerSchemas";
import { FetchCompanyByIdControllerSchemas } from "../../domain/use-cases/company/fetch-company-by-id/FetchCompanyByIdControllerSchemas";
import { ListCompaniesControllerSchemas, ListCompaniesResponseSchema } from "../../domain/use-cases/company/list-companies/ListCompaniesControllerSchemas";
import { CreateCompanyControllerSchemas } from "../../domain/use-cases/company/create-company/CreateCompanyControllerSchemas";
import { UpdateCompanyControllerSchemas } from "../../domain/use-cases/company/update-company/UpdateCompanyControllerSchemas";
import { DeleteCompanyControllerSchemas } from "../../domain/use-cases/company/delete-company/DeleteCompanyControllerSchemas";
import { CompanyProfileSchema, CompanySecondaryCnaeSchema } from "../../domain/use-cases/company/_shared/companySchemas";
import { FetchUserControllerSchemas, UserSchema } from "../../domain/use-cases/auth/fetch-user/FetchUserControllerSchemas";
import { RegisterUserControllerSchemas, RegisterUserResponseSchema } from "../../domain/use-cases/auth/register-user/RegisterUserControllerSchemas";
import { UpdateUserControllerSchemas, UpdateUserResponseSchema } from "../../domain/use-cases/auth/update-user/UpdateUserControllerSchemas";
import { DeleteUserControllerSchemas, DeleteUserResponseSchema } from "../../domain/use-cases/auth/delete-user/DeleteUserControllerSchemas";
import { OnboardingControllerSchemas } from "../../domain/use-cases/onboarding/onboarding/OnboardingControllerSchemas";
import { ListMembersControllerSchemas, ListMemberItemSchema, ListMembersResponseSchema } from "../../domain/use-cases/team/list-members/ListMembersControllerSchemas";
import { CreateMemberControllerSchemas, CreateMemberResponseSchema } from "../../domain/use-cases/team/create-member/CreateMemberControllerSchemas";
import { CreateInviteControllerSchemas, CreateInviteResponseSchema } from "../../domain/use-cases/team/create-invite/CreateInviteControllerSchemas";
import { ExtractEditalDataControllerSchemas } from "../../domain/use-cases/licitacao/extract-edital-data/ExtractEditalDataControllerSchemas";
import { ExtractEditalDataStreamControllerSchemas } from "../../domain/use-cases/licitacao/extract-edital-data/ExtractEditalDataStreamControllerSchemas";
import { GetInviteControllerSchemas, GetInviteResponseSchema } from "../../domain/use-cases/team/get-invite/GetInviteControllerSchemas";
import { AcceptInviteControllerSchemas, AcceptInviteResponseSchema } from "../../domain/use-cases/team/accept-invite/AcceptInviteControllerSchemas";
import { UpdateMemberRoleControllerSchemas, UpdateMemberRoleResponseSchema } from "../../domain/use-cases/team/update-member-role/UpdateMemberRoleControllerSchemas";
import { RemoveMemberControllerSchemas, RemoveMemberResponseSchema } from "../../domain/use-cases/team/remove-member/RemoveMemberControllerSchemas";
import { ZodType } from "zod";
import type { ZodOpenApiRequestBodyObject, ZodOpenApiResponsesObject } from "zod-openapi";

export interface EndpointSchemas {
  Headers?: ZodType | undefined;
  Body?: ZodType | null | undefined;
  Query: ZodType | null;
  Params?: ZodType | null | undefined;
  Response: ZodType;
}

export interface EndpointConfig {
  path: string;
  operationId: string;
  tag: string;
  summary: string;
  description: string;
  successDescription: string;
  method?: "GET" | "POST";
  schemas: EndpointSchemas;
  /** Schemas extras adicionados a components/schemas para gerar models nomeados. */
  extraSchemas?: Record<string, ZodType>;
  /** Sobrescreve o requestBody gerado pelo Zod. Usado para multipart/form-data e outros casos especiais. */
  requestBodyOverride?: ZodOpenApiRequestBodyObject;
  /** Sobrescreve o bloco `responses` gerado automaticamente. Usado para SSE e outros formatos especiais. */
  responsesOverride?: ZodOpenApiResponsesObject;
}

/**
 * Registry of all API endpoints.
 * To add a new endpoint: create the controller schema and add one entry here.
 */
export const apiEndpoints: EndpointConfig[] = [
  {
    path: "/search-public-procurements",
    operationId: "searchPublicProcurements",
    tag: "Search",
    summary: "Busca avançada de licitações no PNCP",
    description: "Realiza buscas filtradas de editais, avisos e contratos diretamente na base do PNCP.",
    successDescription: "Sucesso na busca",
    schemas: SearchPublicProcurementsControllerSchemas,
    extraSchemas: {
      LicitacaoItem: LicitacaoItemSchema,
    },
  },
  {
    path: "/fetch-external-procurement-items",
    operationId: "fetchExternalProcurementItems",
    tag: "Search",
    summary: "Busca itens de uma contratação",
    description: "Retorna os itens (produtos/serviços) de uma licitação específica diretamente da API PNCP v1.",
    successDescription: "Itens encontrados",
    method: "GET",
    schemas: FetchExternalProcurementItemsControllerSchemas,
    extraSchemas: {
      ProcurementItem:               ProcurementItemSchema,
      FetchProcurementItemsResponse: FetchProcurementItemsResponseSchema,
    },
  },
  {
    path: "/fetch-external-procurement-detail",
    operationId: "fetchExternalProcurementDetail",
    tag: "Search",
    summary: "Busca detalhes de uma contratação",
    description: "Retorna os detalhes completos de uma licitação específica diretamente da API PNCP v1.",
    successDescription: "Detalhes encontrados",
    method: "GET",
    schemas: FetchExternalProcurementDetailControllerSchemas,
    extraSchemas: {
      ProcurementDetail: ProcurementDetailSchema,
    },
  },
  {
    path: "/fetch-external-procurement-files",
    operationId: "fetchExternalProcurementFiles",
    tag: "Search",
    summary: "Busca arquivos de uma contratação",
    description: "Retorna a lista de documentos (edital, anexos, adendos) de uma licitação específica.",
    successDescription: "Arquivos encontrados",
    method: "GET",
    schemas: FetchExternalProcurementFilesControllerSchemas,
    extraSchemas: {
      ProcurementFile:               ProcurementFileSchema,
      FetchProcurementFilesResponse: FetchProcurementFilesResponseSchema,
    },
  },
  {
    path: "/fetch-external-procurement-atas",
    operationId: "fetchExternalProcurementAtas",
    tag: "Search",
    summary: "Busca atas de registro de preço de uma contratação",
    description: "Retorna as atas de registro de preço vinculadas a uma licitação específica.",
    successDescription: "Atas encontradas",
    method: "GET",
    schemas: FetchExternalProcurementAtasControllerSchemas,
    extraSchemas: {
      ProcurementAta:                              ProcurementAtaSchema,
      FetchExternalProcurementAtasResponse:        FetchExternalProcurementAtasResponseSchema,
    },
  },
  {
    path: "/fetch-external-procurement-contracts",
    operationId: "fetchExternalProcurementContracts",
    tag: "Search",
    summary: "Busca contratos/empenhos de uma contratação",
    description: "Retorna os contratos e empenhos vinculados a uma licitação específica.",
    successDescription: "Contratos encontrados",
    method: "GET",
    schemas: FetchExternalProcurementContractsControllerSchemas,
    extraSchemas: {
      ProcurementContract:                              ProcurementContractSchema,
      FetchExternalProcurementContractsResponse:        FetchExternalProcurementContractsResponseSchema,
    },
  },
  {
    path: "/fetch-external-procurement-history",
    operationId: "fetchExternalProcurementHistory",
    tag: "Search",
    summary: "Busca histórico de alterações de uma contratação",
    description: "Retorna o log de manutenção (linha do tempo) de uma licitação específica.",
    successDescription: "Histórico encontrado",
    method: "GET",
    schemas: FetchExternalProcurementHistoryControllerSchemas,
    extraSchemas: {
      ProcurementHistoryEntry:                        ProcurementHistoryEntrySchema,
      FetchExternalProcurementHistoryResponse:        FetchExternalProcurementHistoryResponseSchema,
    },
  },
  {
    path: "/fetch-external-procurement-item-results",
    operationId: "fetchExternalProcurementItemResults",
    tag: "Search",
    summary: "Busca resultados de um item de contratação",
    description: "Retorna os fornecedores vencedores e valores homologados de um item específico.",
    successDescription: "Resultados encontrados",
    method: "GET",
    schemas: FetchExternalProcurementItemResultsControllerSchemas,
    extraSchemas: {
      ProcurementItemResult:                          ProcurementItemResultSchema,
      FetchExternalProcurementItemResultsResponse:    FetchExternalProcurementItemResultsResponseSchema,
    },
  },
  {
    path: "/fetch-external-contract-detail",
    operationId: "fetchExternalContractDetail",
    tag: "Search",
    summary: "Busca detalhes de um contrato/empenho",
    description: "Retorna os dados completos de um contrato ou empenho específico pelo CNPJ do órgão, ano e sequencial do contrato.",
    successDescription: "Detalhes do contrato encontrados",
    method: "GET",
    schemas: FetchExternalContractDetailControllerSchemas,
    extraSchemas: {
      ContractDetail: ContractDetailSchema,
    },
  },
  {
    path: "/fetch-external-contract-files",
    operationId: "fetchExternalContractFiles",
    tag: "Search",
    summary: "Busca arquivos de um contrato/empenho",
    description: "Retorna os documentos anexados a um contrato ou empenho específico.",
    successDescription: "Arquivos encontrados",
    method: "GET",
    schemas: FetchExternalContractFilesControllerSchemas,
    extraSchemas: {
      ContractFile:                          ContractFileSchema,
      FetchExternalContractFilesResponse:    FetchExternalContractFilesResponseSchema,
    },
  },
  {
    path: "/fetch-external-contract-history",
    operationId: "fetchExternalContractHistory",
    tag: "Search",
    summary: "Busca histórico de alterações de um contrato/empenho",
    description: "Retorna o log de manutenção (linha do tempo) de um contrato ou empenho específico.",
    successDescription: "Histórico encontrado",
    method: "GET",
    schemas: FetchExternalContractHistoryControllerSchemas,
    extraSchemas: {
      ContractHistoryEntry:                     ContractHistoryEntrySchema,
      FetchExternalContractHistoryResponse:     FetchExternalContractHistoryResponseSchema,
    },
  },
  {
    path: "/fetch-external-contract-terms",
    operationId: "fetchExternalContractTerms",
    tag: "Search",
    summary: "Busca termos aditivos de um contrato/empenho",
    description: "Retorna os termos aditivos, supressivos e outros instrumentos vinculados a um contrato ou empenho.",
    successDescription: "Termos encontrados",
    method: "GET",
    schemas: FetchExternalContractTermsControllerSchemas,
    extraSchemas: {
      ContractTerm:                          ContractTermSchema,
      FetchExternalContractTermsResponse:    FetchExternalContractTermsResponseSchema,
    },
  },
  {
    path: "/fetch-external-ata-detail",
    operationId: "fetchExternalAtaDetail",
    tag: "Search",
    summary: "Busca detalhes de uma ata de registro de preço",
    description: "Retorna os dados completos de uma ata de registro de preço específica pelo CNPJ do órgão, ano, sequencial da compra e sequencial da ata.",
    successDescription: "Detalhes da ata encontrados",
    method: "GET",
    schemas: FetchExternalAtaDetailControllerSchemas,
    extraSchemas: {
      AtaDetail: AtaDetailSchema,
    },
  },
  {
    path: "/fetch-external-ata-files",
    operationId: "fetchExternalAtaFiles",
    tag: "Search",
    summary: "Busca arquivos de uma ata de registro de preço",
    description: "Retorna os documentos anexados a uma ata de registro de preço específica.",
    successDescription: "Arquivos encontrados",
    method: "GET",
    schemas: FetchExternalAtaFilesControllerSchemas,
    extraSchemas: {
      AtaFile:                       AtaFileSchema,
      FetchExternalAtaFilesResponse: FetchExternalAtaFilesResponseSchema,
    },
  },
  {
    path: "/fetch-external-ata-history",
    operationId: "fetchExternalAtaHistory",
    tag: "Search",
    summary: "Busca histórico de alterações de uma ata de registro de preço",
    description: "Retorna o log de manutenção (linha do tempo) de uma ata de registro de preço específica.",
    successDescription: "Histórico encontrado",
    method: "GET",
    schemas: FetchExternalAtaHistoryControllerSchemas,
    extraSchemas: {
      AtaHistoryEntry:                      AtaHistoryEntrySchema,
      FetchExternalAtaHistoryResponse:      FetchExternalAtaHistoryResponseSchema,
    },
  },
  {
    path: "/fetch-company-by-cnpj",
    operationId: "fetchCompanyByCnpj",
    tag: "Company",
    summary: "Consulta dados cadastrais de uma empresa",
    description: "Recupera informações oficiais da Receita Federal via OpenCNPJ utilizando o CNPJ.",
    successDescription: "Dados da empresa encontrados",
    schemas: FetchCompanyByCnpjControllerSchemas,
  },
  {
    path: "/company/fetch-company-by-id",
    operationId: "fetchCompanyById",
    tag: "Company",
    summary: "Busca o perfil de uma empresa por ID",
    description: "Retorna os dados persistidos da empresa cadastrada na plataforma.",
    successDescription: "Perfil da empresa encontrado",
    method: "GET",
    schemas: FetchCompanyByIdControllerSchemas,
    extraSchemas: {
      CompanyProfile: CompanyProfileSchema,
      CompanySecondaryCnae: CompanySecondaryCnaeSchema,
    },
  },
  {
    path: "/company/list-companies",
    operationId: "listCompanies",
    tag: "Company",
    summary: "Lista empresas da organização",
    description: "Retorna as empresas vinculadas a uma organização.",
    successDescription: "Lista de empresas retornada",
    method: "GET",
    schemas: ListCompaniesControllerSchemas,
    extraSchemas: {
      CompanyProfile: CompanyProfileSchema,
      CompanySecondaryCnae: CompanySecondaryCnaeSchema,
      ListCompaniesResponse: ListCompaniesResponseSchema,
    },
  },
  {
    path: "/company/create-company",
    operationId: "createCompany",
    tag: "Company",
    summary: "Cria uma nova empresa",
    description: "Cadastra uma nova empresa vinculada a uma organização.",
    successDescription: "Empresa criada com sucesso",
    method: "POST",
    schemas: CreateCompanyControllerSchemas,
    extraSchemas: {
      CompanyProfile: CompanyProfileSchema,
      CompanySecondaryCnae: CompanySecondaryCnaeSchema,
    },
  },
  {
    path: "/company/update-company",
    operationId: "updateCompany",
    tag: "Company",
    summary: "Atualiza o perfil de uma empresa",
    description: "Atualiza os campos editáveis do cadastro da empresa.",
    successDescription: "Empresa atualizada com sucesso",
    method: "POST",
    schemas: UpdateCompanyControllerSchemas,
    extraSchemas: {
      CompanyProfile: CompanyProfileSchema,
      CompanySecondaryCnae: CompanySecondaryCnaeSchema,
    },
  },
  {
    path: "/company/delete-company",
    operationId: "deleteCompany",
    tag: "Company",
    summary: "Remove uma empresa",
    description: "Exclui uma empresa cadastrada da plataforma.",
    successDescription: "Empresa removida com sucesso",
    method: "POST",
    schemas: DeleteCompanyControllerSchemas,
    extraSchemas: {
      CompanyProfile: CompanyProfileSchema,
      CompanySecondaryCnae: CompanySecondaryCnaeSchema,
    },
  },
  {
    path: "/fetch-user",
    operationId: "fetchUser",
    tag: "Auth",
    summary: "Busca um usuário por campo",
    description: "Retorna um usuário buscando por 'id', 'email' ou outro campo suportado.",
    successDescription: "Usuário encontrado",
    method: "GET",
    schemas: FetchUserControllerSchemas,
    extraSchemas: {
      User: UserSchema,
    },
  },
  {
    path: "/register-user",
    operationId: "registerUser",
    tag: "Auth",
    summary: "Cadastra um novo usuário",
    description: "Cria um usuário no sistema.",
    successDescription: "Usuário criado",
    method: "POST",
    schemas: RegisterUserControllerSchemas,
    extraSchemas: {
      RegisterUserResponse: RegisterUserResponseSchema,
    },
  },
  {
    path: "/update-user",
    operationId: "updateUser",
    tag: "Auth",
    summary: "Atualiza dados de um usuário",
    description: "Atualiza campos do usuário (email, nome, senha, verificação e imagem).",
    successDescription: "Usuário atualizado",
    method: "POST",
    schemas: UpdateUserControllerSchemas,
    extraSchemas: {
      UpdateUserResponse: UpdateUserResponseSchema,
    },
  },
  {
    path: "/delete-user",
    operationId: "deleteUser",
    tag: "Auth",
    summary: "Remove um usuário",
    description: "Remove o usuário pelo ID e retorna o registro removido.",
    successDescription: "Usuário removido",
    method: "POST",
    schemas: DeleteUserControllerSchemas,
    extraSchemas: {
      DeleteUserResponse: DeleteUserResponseSchema,
    },
  },
  {
    path: "/onboarding",
    operationId: "onboarding",
    tag: "Onboarding",
    summary: "Fluxo de onboarding da empresa",
    description: "Cria organização, empresa e vínculo de proprietário com base nos dados fornecidos.",
    successDescription: "Onboarding concluído",
    method: "POST",
    schemas: OnboardingControllerSchemas,
  },
  {
    path: "/team/list-members",
    operationId: "listMembers",
    tag: "Team",
    summary: "Lista membros da organização",
    description: "Retorna todos os membros com seus papéis.",
    successDescription: "Lista de membros retornada",
    method: "GET",
    schemas: ListMembersControllerSchemas,
    extraSchemas: {
      ListMemberItem: ListMemberItemSchema,
      ListMembersResponse: ListMembersResponseSchema,
    },
  },
  {
    path: "/team/create-member",
    operationId: "createMember",
    tag: "Team",
    summary: "Cria membro diretamente",
    description: "Cria um usuário e o vincula à organização com o papel especificado.",
    successDescription: "Membro criado",
    method: "POST",
    schemas: CreateMemberControllerSchemas,
    extraSchemas: { CreateMemberResponse: CreateMemberResponseSchema },
  },
  {
    path: "/team/create-invite",
    operationId: "createInvite",
    tag: "Team",
    summary: "Gera link de convite",
    description: "Cria um convite com token e retorna a URL para envio.",
    successDescription: "Convite criado",
    method: "POST",
    schemas: CreateInviteControllerSchemas,
    extraSchemas: { CreateInviteResponse: CreateInviteResponseSchema },
  },
  {
    path: "/team/get-invite",
    operationId: "getInvite",
    tag: "Team",
    summary: "Busca dados de um convite",
    description: "Retorna informações públicas do convite para exibição na página de aceite.",
    successDescription: "Dados do convite retornados",
    method: "GET",
    schemas: GetInviteControllerSchemas,
    extraSchemas: { GetInviteResponse: GetInviteResponseSchema },
  },
  {
    path: "/team/accept-invite",
    operationId: "acceptInvite",
    tag: "Team",
    summary: "Aceita convite e cria conta",
    description: "Valida o token, cria usuário se necessário, vincula à organização e marca convite como usado.",
    successDescription: "Convite aceito",
    method: "POST",
    schemas: AcceptInviteControllerSchemas,
    extraSchemas: { AcceptInviteResponse: AcceptInviteResponseSchema },
  },
  {
    path: "/team/update-member-role",
    operationId: "updateMemberRole",
    tag: "Team",
    summary: "Atualiza papel de um membro",
    description: "Altera o papel de um membro (ADMIN ou MEMBER). Não permite alterar OWNERs.",
    successDescription: "Papel atualizado",
    method: "POST",
    schemas: UpdateMemberRoleControllerSchemas,
    extraSchemas: { UpdateMemberRoleResponse: UpdateMemberRoleResponseSchema },
  },
  {
    path: "/team/remove-member",
    operationId: "removeMember",
    tag: "Team",
    summary: "Remove um membro",
    description: "Remove o vínculo de um membro da organização. Não permite remover OWNERs.",
    successDescription: "Membro removido",
    method: "POST",
    schemas: RemoveMemberControllerSchemas,
    extraSchemas: { RemoveMemberResponse: RemoveMemberResponseSchema },
  },
  {
    path: "/extract-edital-data",
    operationId: "extractEditalData",
    tag: "Licitacao",
    summary: "Extrai dados de um edital de licitação",
    description: "Recebe um PDF de edital via upload (multipart/form-data), processa via RAG (busca vetorial + LLM) e retorna a licitação estruturada no modelo de domínio.",
    successDescription: "Dados extraídos com sucesso",
    method: "POST",
    schemas: ExtractEditalDataControllerSchemas,
    requestBodyOverride: {
      required: true,
      content: {
        "multipart/form-data": {
          schema: {
            type: "object",
            required: ["file"],
            properties: {
              file: {
                type: "string",
                format: "binary",
                description: "Arquivo PDF do edital de licitação",
              },
            },
          },
        },
      },
    },
  },
  {
    path: "/extract-edital-data/stream",
    operationId: "extractEditalDataStream",
    tag: "Licitacao",
    summary: "Extrai dados de um edital de licitação (Stream SSE)",
    description: "Recebe um PDF de edital via upload (multipart/form-data) e retorna um EventStream (SSE) com o progresso do processamento em tempo real.",
    successDescription: "Stream iniciado",
    method: "POST",
    schemas: ExtractEditalDataStreamControllerSchemas,
    requestBodyOverride: {
      required: true,
      content: {
        "multipart/form-data": {
          schema: {
            type: "object",
            required: ["file"],
            properties: {
              file: {
                type: "string",
                format: "binary",
                description: "Arquivo PDF do edital de licitação",
              },
            },
          },
        },
      },
    },
    responsesOverride: {
      200: {
        description: "Stream SSE iniciado",
        content: {
          "text/event-stream": {
            schema: {
              $ref: "#/components/schemas/ExtractEditalDataStreamResponse",
            },
            example: "data: {\"type\":\"progress\",\"scope\":\"orchestration\",\"step\":\"orchestration.parse\",\"message\":\"Arquivo recebido, processando...\",\"percent\":8,\"pipelinePercent\":8}\n\n",
          },
        },
      },
    },
  },
];
