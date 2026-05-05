import { NextRequest } from "next/server";
import { makeAskDocumentChat } from "@/server/modules/core-api/domain/use-cases/licitacao/ask-document-chat/makeAskDocumentChat";
import { adaptNextDynamicRoute } from "@/server/modules/core-api/main/adapters/next-dynamic-http-adapter";

type Params = { documentId: string };

async function parseBody(request: NextRequest) {
    return request.json().catch(() => null);
}

export const POST = adaptNextDynamicRoute({
    make: makeAskDocumentChat,
    parseBody,
    mapParams: (params: Params) => ({
        documentId: params.documentId,
    }),
});
