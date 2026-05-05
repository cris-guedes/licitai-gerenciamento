import { makeGetDocumentSummary } from "@/server/modules/core-api/domain/use-cases/licitacao/get-document-summary/makeGetDocumentSummary";
import { makeSummarizeDocument } from "@/server/modules/core-api/domain/use-cases/licitacao/summarize-document/makeSummarizeDocument";
import { adaptNextDynamicRoute } from "@/server/modules/core-api/main/adapters/next-dynamic-http-adapter";

type Params = { documentId: string };

export const GET = adaptNextDynamicRoute({
    make: makeGetDocumentSummary,
    mapParams: (params: Params) => ({
        documentId: params.documentId,
    }),
});

export const POST = adaptNextDynamicRoute({
    make: makeSummarizeDocument,
    mapParams: (params: Params) => ({
        documentId: params.documentId,
    }),
});
