/* eslint-disable @typescript-eslint/no-namespace */
import { Buffer } from "buffer";
import { z } from "zod";

export const UploadEditalDocumentBodySchema = z.object({
    companyId: z.string().min(1).describe("ID da empresa dona do edital enviado."),
    fileBuffer: z.instanceof(Buffer).describe("Conteúdo binário do arquivo enviado no campo 'file'."),
    fileFilename: z.string().min(1).describe("Nome original do arquivo enviado no campo 'file'."),
    fileMimeType: z.string().optional().describe("MIME type informado pelo cliente para o arquivo enviado."),
    fileSize: z.number().int().nonnegative().describe("Tamanho do arquivo enviado em bytes."),
});

export const UploadEditalDocumentResponseSchema = z.object({
    licitacaoId: z.string().describe("ID interno do processo licitatório criado para acompanhar o fluxo global da licitação."),
    licitacaoStatus: z.enum(["IN_PROGRESS"]).describe("Status global inicial do processo licitatório após o upload do edital."),
    editalId: z.string().describe("ID interno do edital criado para concentrar os dados ricos e documentos do certame."),
    editalStatus: z.enum(["IN_PROGRESS"]).describe("Status inicial do edital criado junto ao processo licitatório."),
    documentId: z.string().describe("ID interno do documento armazenado."),
    documentType: z.literal("edital").describe("Tipo de documento aceito neste fluxo inicial."),
    originalName: z.string().describe("Nome original do arquivo enviado."),
    mimeType: z.string().describe("MIME type persistido para o documento."),
    sizeBytes: z.number().describe("Tamanho do arquivo armazenado em bytes."),
    status: z.enum(["READY"]).describe("Status final do documento após o upload simples."),
    documentUrl: z.string().describe("URL pública do documento armazenado para preview e consumo posterior."),
    previewUrl: z.string().describe("URL utilizada pelo frontend para renderizar o preview do edital."),
    previewUrlExpiresAt: z.string().describe("Data/hora ISO de expiração da URL temporária de preview do documento."),
    uploadedAt: z.string().describe("Data/hora ISO em que o documento foi persistido."),
});

export namespace UploadEditalDocumentControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().optional().describe("Bearer token do usuário autenticado."),
    }).optional();

    export const Body = UploadEditalDocumentBodySchema;
    export const Query = z.null();
    export const Params = z.null();
    export const Response = UploadEditalDocumentResponseSchema;

    export type Input = z.infer<typeof UploadEditalDocumentBodySchema>;
}
