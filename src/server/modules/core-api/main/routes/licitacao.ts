import type { RouteConfig } from "../adapters/http-adapter";
import { authMiddleware } from "../middlewares/auth";
import { makeCreateLicitacao } from "../../domain/use-cases/licitacao/create-licitacao/makeCreateLicitacao";
import { makeListLicitacoes } from "../../domain/use-cases/licitacao/list-licitacoes/makeListLicitacoes";

export const licitacaoRoutes: Record<string, RouteConfig> = {
    "licitacao/create-licitacao": { make: makeCreateLicitacao, method: "POST", preHandlers: [authMiddleware] },
    "licitacao/list-licitacoes":  { make: makeListLicitacoes,  method: "GET",  preHandlers: [authMiddleware] },
};
