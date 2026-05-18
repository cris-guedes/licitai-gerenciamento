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
import { makeListKnownOrgaos } from "../../domain/use-cases/licitacao/list-known-orgaos/makeListKnownOrgaos";
import { makeListLicitacaoDrafts } from "../../domain/use-cases/licitacao/list-licitacao-drafts/makeListLicitacaoDrafts";
import { makeUpdateCompanyWorkflowNode } from "../../domain/use-cases/licitacao/update-company-workflow-node/makeUpdateCompanyWorkflowNode";
import { makeUpdateCompanyWorkflowTransition } from "../../domain/use-cases/licitacao/update-company-workflow-transition/makeUpdateCompanyWorkflowTransition";
import { makeUploadEditalDocument } from "../../domain/use-cases/licitacao/upload-edital-document/makeUploadEditalDocument";
import { makeUploadLicitacaoDocumentStream } from "../../domain/use-cases/licitacao/upload-licitacao-document-stream/makeUploadLicitacaoDocumentStream";
import { makeGetOportunidadeWorkspace } from "../../domain/use-cases/oportunidade/root/get-oportunidade-workspace/makeGetOportunidadeWorkspace";
import { makeListOportunidadesBoard } from "../../domain/use-cases/oportunidade/board/list-oportunidades-board/makeListOportunidadesBoard";
import { makeMoveOportunidadeWorkflow } from "../../domain/use-cases/oportunidade/workflow/move-oportunidade-workflow/makeMoveOportunidadeWorkflow";
import { makeUpdateOportunidadeBoardItem } from "../../domain/use-cases/oportunidade/workflow/update-oportunidade-board-item/makeUpdateOportunidadeBoardItem";
import { makeCreateOportunidadeTask } from "../../domain/use-cases/oportunidade/details/create-oportunidade-task/makeCreateOportunidadeTask";
import { makeToggleOportunidadeTask } from "../../domain/use-cases/oportunidade/details/toggle-oportunidade-task/makeToggleOportunidadeTask";
import { makeDeleteOportunidadeTask } from "../../domain/use-cases/oportunidade/details/delete-oportunidade-task/makeDeleteOportunidadeTask";
import { makeCreateOportunidadeNote } from "../../domain/use-cases/oportunidade/details/create-oportunidade-note/makeCreateOportunidadeNote";
import { makeDeleteOportunidadeNote } from "../../domain/use-cases/oportunidade/details/delete-oportunidade-note/makeDeleteOportunidadeNote";
import { makeUpdateOportunidadeDetails } from "../../domain/use-cases/oportunidade/details/update-oportunidade-details/makeUpdateOportunidadeDetails";
import { makeUpdateOportunidadeItem } from "../../domain/use-cases/oportunidade/items/update-oportunidade-item/makeUpdateOportunidadeItem";
import { makeCreateOportunidadeItem } from "../../domain/use-cases/oportunidade/items/create-oportunidade-item/makeCreateOportunidadeItem";
import { makeDeleteOportunidadeItem } from "../../domain/use-cases/oportunidade/items/delete-oportunidade-item/makeDeleteOportunidadeItem";

export const licitacaoRoutes: Record<string, RouteConfig> = {
    "get-company-workflow": { make: makeGetCompanyWorkflow, method: "GET", preHandlers: [authMiddleware] },
    "list-known-orgaos": { make: makeListKnownOrgaos, method: "GET", preHandlers: [authMiddleware] },
    "list-licitacao-drafts": { make: makeListLicitacaoDrafts, method: "GET", preHandlers: [authMiddleware] },
    "list-oportunidades-board": { make: makeListOportunidadesBoard, method: "GET", preHandlers: [authMiddleware] },
    "move-oportunidade-workflow": { make: makeMoveOportunidadeWorkflow, method: "POST", preHandlers: [authMiddleware] },
    "update-oportunidade-board-item": { make: makeUpdateOportunidadeBoardItem, method: "POST", preHandlers: [authMiddleware] },
    "update-oportunidade-details": { make: makeUpdateOportunidadeDetails, method: "POST", preHandlers: [authMiddleware] },
    "update-oportunidade-item": { make: makeUpdateOportunidadeItem, method: "POST", preHandlers: [authMiddleware] },
    "create-oportunidade-item": { make: makeCreateOportunidadeItem, method: "POST", preHandlers: [authMiddleware] },
    "delete-oportunidade-item": { make: makeDeleteOportunidadeItem, method: "POST", preHandlers: [authMiddleware] },
    "create-oportunidade-task": { make: makeCreateOportunidadeTask, method: "POST", preHandlers: [authMiddleware] },
    "toggle-oportunidade-task": { make: makeToggleOportunidadeTask, method: "POST", preHandlers: [authMiddleware] },
    "delete-oportunidade-task": { make: makeDeleteOportunidadeTask, method: "POST", preHandlers: [authMiddleware] },
    "create-oportunidade-note": { make: makeCreateOportunidadeNote, method: "POST", preHandlers: [authMiddleware] },
    "delete-oportunidade-note": { make: makeDeleteOportunidadeNote, method: "POST", preHandlers: [authMiddleware] },
    "create-company-workflow-node": { make: makeCreateCompanyWorkflowNode, method: "POST", preHandlers: [authMiddleware] },
    "update-company-workflow-node": { make: makeUpdateCompanyWorkflowNode, method: "POST", preHandlers: [authMiddleware] },
    "delete-company-workflow-node": { make: makeDeleteCompanyWorkflowNode, method: "POST", preHandlers: [authMiddleware] },
    "create-company-workflow-transition": { make: makeCreateCompanyWorkflowTransition, method: "POST", preHandlers: [authMiddleware] },
    "update-company-workflow-transition": { make: makeUpdateCompanyWorkflowTransition, method: "POST", preHandlers: [authMiddleware] },
    "delete-company-workflow-transition": { make: makeDeleteCompanyWorkflowTransition, method: "POST", preHandlers: [authMiddleware] },
    "get-oportunidade-workspace": { make: makeGetOportunidadeWorkspace, method: "GET", preHandlers: [authMiddleware] },
    "get-licitacao-workspace": { make: makeGetOportunidadeWorkspace, method: "GET", preHandlers: [authMiddleware] },
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
