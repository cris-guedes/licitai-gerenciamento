import type { RouteConfig } from "../adapters/http-adapter";
import { authMiddleware } from "../middlewares/auth";
import { makeRegisterDocument } from "../../domain/use-cases/document/register-document/makeRegisterDocument";
import { makeUploadDocument } from "../../domain/use-cases/document/upload-document/makeUploadDocument";
import { makeRunDocumentSummary } from "../../domain/use-cases/document/run-document-summary/makeRunDocumentSummary";

export const documentRoutes: Record<string, RouteConfig> = {
    "document/register": { make: makeRegisterDocument,   method: "POST", preHandlers: [authMiddleware] },
    "document/upload":   { make: makeUploadDocument,     method: "POST", preHandlers: [authMiddleware] },
    "document/summarize": { make: makeRunDocumentSummary, method: "POST", preHandlers: [authMiddleware] },
};
