import type { RouteConfig } from "../adapters/http-adapter";
import { authMiddleware } from "../middlewares/auth";
import {
    makeExtractEditalData,
    makeExtractEditalDataStream,
} from "../../domain/use-cases/licitacao/extract-edital-data/makeExtractEditalDataStream";
import {
    makeExtractEditalDataPostEmbeding,
    makeExtractEditalDataPostEmbedingStream,
} from "../../domain/use-cases/licitacao/extract-edital-data-post-embeding/makeExtractEditalDataPostEmbeding";
import { makeDeleteLicitacaoDocument } from "../../domain/use-cases/licitacao/delete-licitacao-document/makeDeleteLicitacaoDocument";
import { makeUploadEditalDocument } from "../../domain/use-cases/licitacao/upload-edital-document/makeUploadEditalDocument";
import { makeUploadLicitacaoDocumentStream } from "../../domain/use-cases/licitacao/upload-licitacao-document-stream/makeUploadLicitacaoDocumentStream";

export const licitacaoRoutes: Record<string, RouteConfig> = {
    "upload-edital-document": { make: makeUploadEditalDocument, method: "POST", preHandlers: [authMiddleware] },
    "upload-licitacao-document/stream": { makeStream: makeUploadLicitacaoDocumentStream, method: "POST", preHandlers: [authMiddleware] },
    "delete-licitacao-document": { make: makeDeleteLicitacaoDocument, method: "POST", preHandlers: [authMiddleware] },
    "extract-edital-data": { make: makeExtractEditalData, method: "POST", preHandlers: [authMiddleware] },
    "extract-edital-data/stream": { makeStream: makeExtractEditalDataStream, method: "POST", preHandlers: [authMiddleware] },
    "extract-edital-data-post-embeding": { make: makeExtractEditalDataPostEmbeding, method: "POST", preHandlers: [authMiddleware] },
    "extract-edital-data-post-embeding/stream": { makeStream: makeExtractEditalDataPostEmbedingStream, method: "POST", preHandlers: [authMiddleware] },
};
