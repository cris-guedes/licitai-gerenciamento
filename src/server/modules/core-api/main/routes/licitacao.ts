import type { RouteConfig } from "../adapters/http-adapter";
import { authMiddleware } from "../middlewares/auth";
import {
    makeDeleteLicitacaoDraft,
} from "../../domain/use-cases/licitacao/delete-licitacao-draft/makeDeleteLicitacaoDraft";
import {
    makeExtractEditalData,
    makeExtractEditalDataStream,
} from "../../domain/use-cases/licitacao/extract-edital-data/makeExtractEditalDataStream";
import {
    makeExtractEditalDataPostEmbeding,
    makeExtractEditalDataPostEmbedingStream,
} from "../../domain/use-cases/licitacao/extract-edital-data-post-embeding/makeExtractEditalDataPostEmbeding";
import { makeDeleteLicitacaoDocument } from "../../domain/use-cases/licitacao/delete-licitacao-document/makeDeleteLicitacaoDocument";
import { makeCreateCompanyWorkflowNode } from "../../domain/use-cases/licitacao/create-company-workflow-node/makeCreateCompanyWorkflowNode";
import { makeCreateCompanyWorkflowTransition } from "../../domain/use-cases/licitacao/create-company-workflow-transition/makeCreateCompanyWorkflowTransition";
import { makeDeleteCompanyWorkflowNode } from "../../domain/use-cases/licitacao/delete-company-workflow-node/makeDeleteCompanyWorkflowNode";
import { makeDeleteCompanyWorkflowTransition } from "../../domain/use-cases/licitacao/delete-company-workflow-transition/makeDeleteCompanyWorkflowTransition";
import { makeFinalizeOportunidadeRegistration } from "../../domain/use-cases/licitacao/finalize-oportunidade-registration/makeFinalizeOportunidadeRegistration";
import { makeGetCompanyWorkflow } from "../../domain/use-cases/licitacao/get-company-workflow/makeGetCompanyWorkflow";
import { makeGetLicitacaoWorkspace } from "../../domain/use-cases/licitacao/get-licitacao-workspace/makeGetLicitacaoWorkspace";
import { makeListLicitacaoDrafts } from "../../domain/use-cases/licitacao/list-licitacao-drafts/makeListLicitacaoDrafts";
import { makeListOportunidadesBoard } from "../../domain/use-cases/licitacao/list-oportunidades-board/makeListOportunidadesBoard";
import { makeMoveOportunidadeWorkflow } from "../../domain/use-cases/licitacao/move-oportunidade-workflow/makeMoveOportunidadeWorkflow";
import { makeUpdateCompanyWorkflowNode } from "../../domain/use-cases/licitacao/update-company-workflow-node/makeUpdateCompanyWorkflowNode";
import { makeUpdateCompanyWorkflowTransition } from "../../domain/use-cases/licitacao/update-company-workflow-transition/makeUpdateCompanyWorkflowTransition";
import { makeUpdateOportunidadeBoardItem } from "../../domain/use-cases/licitacao/update-oportunidade-board-item/makeUpdateOportunidadeBoardItem";
import { makeUploadEditalDocument } from "../../domain/use-cases/licitacao/upload-edital-document/makeUploadEditalDocument";
import { makeUploadLicitacaoDocumentStream } from "../../domain/use-cases/licitacao/upload-licitacao-document-stream/makeUploadLicitacaoDocumentStream";

export const licitacaoRoutes: Record<string, RouteConfig> = {
    "get-company-workflow": { make: makeGetCompanyWorkflow, method: "GET", preHandlers: [authMiddleware] },
    "list-licitacao-drafts": { make: makeListLicitacaoDrafts, method: "GET", preHandlers: [authMiddleware] },
    "list-oportunidades-board": { make: makeListOportunidadesBoard, method: "GET", preHandlers: [authMiddleware] },
    "move-oportunidade-workflow": { make: makeMoveOportunidadeWorkflow, method: "POST", preHandlers: [authMiddleware] },
    "update-oportunidade-board-item": { make: makeUpdateOportunidadeBoardItem, method: "POST", preHandlers: [authMiddleware] },
    "create-company-workflow-node": { make: makeCreateCompanyWorkflowNode, method: "POST", preHandlers: [authMiddleware] },
    "update-company-workflow-node": { make: makeUpdateCompanyWorkflowNode, method: "POST", preHandlers: [authMiddleware] },
    "delete-company-workflow-node": { make: makeDeleteCompanyWorkflowNode, method: "POST", preHandlers: [authMiddleware] },
    "create-company-workflow-transition": { make: makeCreateCompanyWorkflowTransition, method: "POST", preHandlers: [authMiddleware] },
    "update-company-workflow-transition": { make: makeUpdateCompanyWorkflowTransition, method: "POST", preHandlers: [authMiddleware] },
    "delete-company-workflow-transition": { make: makeDeleteCompanyWorkflowTransition, method: "POST", preHandlers: [authMiddleware] },
    "get-licitacao-workspace": { make: makeGetLicitacaoWorkspace, method: "GET", preHandlers: [authMiddleware] },
    "upload-edital-document": { make: makeUploadEditalDocument, method: "POST", preHandlers: [authMiddleware] },
    "upload-licitacao-document/stream": { makeStream: makeUploadLicitacaoDocumentStream, method: "POST", preHandlers: [authMiddleware] },
    "delete-licitacao-draft": { make: makeDeleteLicitacaoDraft, method: "POST", preHandlers: [authMiddleware] },
    "delete-licitacao-document": { make: makeDeleteLicitacaoDocument, method: "POST", preHandlers: [authMiddleware] },
    "finalize-oportunidade-registration": { make: makeFinalizeOportunidadeRegistration, method: "POST", preHandlers: [authMiddleware] },
    "extract-edital-data": { make: makeExtractEditalData, method: "POST", preHandlers: [authMiddleware] },
    "extract-edital-data/stream": { makeStream: makeExtractEditalDataStream, method: "POST", preHandlers: [authMiddleware] },
    "extract-edital-data-post-embeding": { make: makeExtractEditalDataPostEmbeding, method: "POST", preHandlers: [authMiddleware] },
    "extract-edital-data-post-embeding/stream": { makeStream: makeExtractEditalDataPostEmbedingStream, method: "POST", preHandlers: [authMiddleware] },
};
