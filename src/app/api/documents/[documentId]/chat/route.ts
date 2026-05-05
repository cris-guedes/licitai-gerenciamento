import { adaptNextDynamicRoute } from "@/server/modules/core-api/main/adapters/next-dynamic-http-adapter";
import { makeClearDocumentChat } from "@/server/modules/core-api/domain/use-cases/licitacao/clear-document-chat/makeClearDocumentChat";
import { makeGetDocumentChat } from "@/server/modules/core-api/domain/use-cases/licitacao/get-document-chat/makeGetDocumentChat";

type Params = { documentId: string };

export const GET = adaptNextDynamicRoute({
    make: makeGetDocumentChat,
    mapParams: (params: Params) => ({
        documentId: params.documentId,
    }),
});

export const DELETE = adaptNextDynamicRoute({
    make: makeClearDocumentChat,
    mapParams: (params: Params) => ({
        documentId: params.documentId,
    }),
});
