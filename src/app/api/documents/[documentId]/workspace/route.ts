import { adaptNextDynamicRoute } from "@/server/modules/core-api/main/adapters/next-dynamic-http-adapter";
import { makeGetDocumentWorkspace } from "@/server/modules/core-api/domain/use-cases/document/root/get-document-workspace/makeGetDocumentWorkspace";

type Params = { documentId: string };

export const GET = adaptNextDynamicRoute({
    make: makeGetDocumentWorkspace,
    mapParams: (params: Params) => ({
        documentId: params.documentId,
    }),
});
