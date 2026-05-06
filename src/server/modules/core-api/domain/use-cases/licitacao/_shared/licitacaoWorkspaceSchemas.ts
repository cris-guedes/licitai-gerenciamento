import { z } from "zod";
import { LicitacaoDraftPreviewSchema } from "./draftPreview";

export const LicitacaoDraftSummarySchema = z.object({
    licitacaoId: z.string().describe("ID da licitação em andamento."),
    licitacaoStatus: z.enum(["IN_PROGRESS", "COMPLETED", "CANCELLED"]).describe("Status atual da licitação."),
    editalId: z.string().nullable().describe("ID do edital vinculado ao rascunho."),
    editalStatus: z.enum(["IN_PROGRESS", "COMPLETED", "CANCELLED"]).nullable().describe("Status atual do edital vinculado."),
    primaryDocumentName: z.string().nullable().describe("Nome do documento principal exibido como título do rascunho."),
    primaryDocumentType: z.enum(["EDITAL", "ANEXO", "OUTRO"]).nullable().describe("Tipo do documento principal do rascunho."),
    draftPreview: LicitacaoDraftPreviewSchema.nullable().describe("Prévia leve extraída da primeira página do edital para exibição no workspace."),
    documentCount: z.number().describe("Quantidade total de documentos anexados ao rascunho."),
    readyDocuments: z.number().describe("Quantidade de documentos já prontos para uso."),
    processingDocuments: z.number().describe("Quantidade de documentos ainda em processamento."),
    failedDocuments: z.number().describe("Quantidade de documentos que falharam no processamento."),
    createdAt: z.string().describe("Data ISO de criação da licitação."),
    updatedAt: z.string().describe("Data ISO da última atualização da licitação."),
});

export const LicitacaoWorkspaceAnalysisSchema = z.object({
    id: z.string().describe("ID da análise persistida para o documento."),
    type: z.enum(["EXTRACT_EDITAL", "SUMMARY"]).describe("Tipo da análise gerada para o documento."),
    status: z.enum(["PENDING", "RUNNING", "COMPLETED", "FAILED"]).describe("Status da execução da análise."),
    markdownContent: z.string().nullable().describe("Conteúdo markdown opcional salvo junto da análise."),
    result: z.unknown().nullable().describe("Payload estruturado salvo como resultado da análise."),
    metrics: z.unknown().nullable().describe("Métricas e artefatos associados à execução da análise."),
    errorMessage: z.string().nullable().describe("Mensagem de erro, quando a análise falhou."),
    startedAt: z.string().nullable().describe("Data ISO de início da análise."),
    finishedAt: z.string().nullable().describe("Data ISO de término da análise."),
    createdAt: z.string().describe("Data ISO em que a análise foi criada."),
    updatedAt: z.string().describe("Data ISO da última atualização da análise."),
});

export const LicitacaoWorkspaceDocumentSchema = z.object({
    id: z.string().describe("ID do documento vinculado à licitação."),
    type: z.enum(["EDITAL", "ANEXO", "OUTRO"]).describe("Tipo do documento."),
    displayName: z.string().nullable().describe("Nome amigável opcional para exibição na UI, quando disponível."),
    originalName: z.string().describe("Nome original do arquivo enviado."),
    mimeType: z.string().describe("Mime type do documento."),
    sizeBytes: z.number().describe("Tamanho do arquivo em bytes."),
    status: z.enum(["PROCESSING", "READY", "FAILED"]).describe("Status atual do documento na pipeline."),
    documentUrl: z.string().describe("URL temporária do arquivo para leitura e preview."),
    previewUrl: z.string().describe("URL temporária do preview do documento."),
    previewUrlExpiresAt: z.string().describe("Data ISO de expiração da URL temporária."),
    uploadedAt: z.string().describe("Data ISO da última atualização relevante do documento."),
    analyses: z.array(LicitacaoWorkspaceAnalysisSchema).describe("Últimas análises persistidas para o documento."),
});

export const LicitacaoWorkspaceSchema = z.object({
    licitacao: z.object({
        id: z.string().describe("ID da licitação em andamento."),
        status: z.enum(["IN_PROGRESS", "COMPLETED", "CANCELLED"]).describe("Status atual da licitação."),
        draftPreview: LicitacaoDraftPreviewSchema.nullable().describe("Prévia leve derivada da primeira página do edital principal."),
        createdAt: z.string().describe("Data ISO de criação da licitação."),
        updatedAt: z.string().describe("Data ISO da última atualização da licitação."),
    }),
    edital: z.object({
        id: z.string().describe("ID do edital vinculado."),
        status: z.enum(["IN_PROGRESS", "COMPLETED", "CANCELLED"]).describe("Status atual do edital."),
        createdAt: z.string().describe("Data ISO de criação do edital."),
        updatedAt: z.string().describe("Data ISO da última atualização do edital."),
    }).nullable(),
    documents: z.array(LicitacaoWorkspaceDocumentSchema).describe("Documentos e artefatos do workspace de IA da licitação."),
});
