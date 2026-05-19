import { makeCreateContrato } from "../../domain/use-cases/contrato/root/create-contrato/makeCreateContrato";
import { makeListContratos } from "../../domain/use-cases/contrato/root/list-contratos/makeListContratos";
import { makeGetContratoWorkspace } from "../../domain/use-cases/contrato/root/get-contrato-workspace/makeGetContratoWorkspace";
import { makeUpdateContrato } from "../../domain/use-cases/contrato/root/update-contrato/makeUpdateContrato";
import { makeCreateContratoItem } from "../../domain/use-cases/contrato/item/create-contrato-item/makeCreateContratoItem";
import { makeUpdateContratoItem } from "../../domain/use-cases/contrato/item/update-contrato-item/makeUpdateContratoItem";
import { makeDeleteContratoItem } from "../../domain/use-cases/contrato/item/delete-contrato-item/makeDeleteContratoItem";
import { makeCreateEmpenho } from "../../domain/use-cases/contrato/empenho/create-empenho/makeCreateEmpenho";
import { makeListEmpenhos } from "../../domain/use-cases/contrato/empenho/list-empenhos/makeListEmpenhos";
import { makeCreateLocalEntrega } from "../../domain/use-cases/contrato/empenho/create-local-entrega/makeCreateLocalEntrega";
import { makeCreateEntrega } from "../../domain/use-cases/contrato/empenho/create-entrega/makeCreateEntrega";
import { makeUpdateEntregaStatus } from "../../domain/use-cases/contrato/empenho/update-entrega-status/makeUpdateEntregaStatus";
import { CreateContratoControllerSchemas } from "../../domain/use-cases/contrato/root/create-contrato/CreateContratoControllerSchemas";
import { ListContratosControllerSchemas } from "../../domain/use-cases/contrato/root/list-contratos/ListContratosControllerSchemas";
import { GetContratoWorkspaceControllerSchemas } from "../../domain/use-cases/contrato/root/get-contrato-workspace/GetContratoWorkspaceControllerSchemas";
import { UpdateContratoControllerSchemas } from "../../domain/use-cases/contrato/root/update-contrato/UpdateContratoControllerSchemas";
import { CreateContratoItemControllerSchemas } from "../../domain/use-cases/contrato/item/create-contrato-item/CreateContratoItemControllerSchemas";
import { UpdateContratoItemControllerSchemas } from "../../domain/use-cases/contrato/item/update-contrato-item/UpdateContratoItemControllerSchemas";
import { DeleteContratoItemControllerSchemas } from "../../domain/use-cases/contrato/item/delete-contrato-item/DeleteContratoItemControllerSchemas";
import { CreateEmpenhoControllerSchemas } from "../../domain/use-cases/contrato/empenho/create-empenho/CreateEmpenhoControllerSchemas";
import { ListEmpenhosControllerSchemas } from "../../domain/use-cases/contrato/empenho/list-empenhos/ListEmpenhosControllerSchemas";
import { CreateLocalEntregaControllerSchemas } from "../../domain/use-cases/contrato/empenho/create-local-entrega/CreateLocalEntregaControllerSchemas";
import { CreateEntregaControllerSchemas } from "../../domain/use-cases/contrato/empenho/create-entrega/CreateEntregaControllerSchemas";
import { UpdateEntregaStatusControllerSchemas } from "../../domain/use-cases/contrato/empenho/update-entrega-status/UpdateEntregaStatusControllerSchemas";
import { authMiddleware } from "../middlewares/auth";
import type { RouteConfig } from "../adapters/http-adapter";

export const contratosRoutes: Record<string, RouteConfig> = {
    // ─── Contratos (Root) ──────────────────────────────────────────────────
    "contratos": {
        method: "POST",
        preHandlers: [authMiddleware],
        make: makeCreateContrato,
        schema: {
            tags: ["Contratos"],
            summary: "Criar novo contrato",
            description: "Cria um contrato a partir de uma oportunidade ganha",
            headers: CreateContratoControllerSchemas.Headers,
            body: CreateContratoControllerSchemas.Body,
            response: CreateContratoControllerSchemas.Response,
        },
    },
    "contratos/list": {
        method: "GET",
        preHandlers: [authMiddleware],
        make: makeListContratos,
        schema: {
            tags: ["Contratos"],
            summary: "Listar contratos",
            description: "Lista os contratos da empresa",
            headers: ListContratosControllerSchemas.Headers,
            query: ListContratosControllerSchemas.Query,
            response: ListContratosControllerSchemas.Response,
        },
    },
    "contratos/workspace": {
        method: "GET",
        preHandlers: [authMiddleware],
        make: makeGetContratoWorkspace,
        schema: {
            tags: ["Contratos"],
            summary: "Obter Workspace do Contrato",
            description: "Obtém todos os detalhes do contrato, itens, empenhos e pipeline",
            headers: GetContratoWorkspaceControllerSchemas.Headers,
            query: GetContratoWorkspaceControllerSchemas.Query,
            response: GetContratoWorkspaceControllerSchemas.Response,
        },
    },
    "contratos/update": {
        method: "POST",
        preHandlers: [authMiddleware],
        make: makeUpdateContrato,
        schema: {
            tags: ["Contratos"],
            summary: "Atualizar contrato",
            description: "Atualiza dados cadastrais e status de um contrato",
            headers: UpdateContratoControllerSchemas.Headers,
            body: UpdateContratoControllerSchemas.Body,
            response: UpdateContratoControllerSchemas.Response,
        },
    },
    "contratos/itens": {
        method: "POST",
        preHandlers: [authMiddleware],
        make: makeCreateContratoItem,
        schema: {
            tags: ["Contratos", "Itens do Contrato"],
            summary: "Adicionar item ao contrato",
            description: "Vincula ao contrato um item ativo da oportunidade de origem",
            headers: CreateContratoItemControllerSchemas.Headers,
            body: CreateContratoItemControllerSchemas.Body,
            response: CreateContratoItemControllerSchemas.Response,
        },
    },
    "contratos/itens/update": {
        method: "POST",
        preHandlers: [authMiddleware],
        make: makeUpdateContratoItem,
        schema: {
            tags: ["Contratos", "Itens do Contrato"],
            summary: "Atualizar item do contrato",
            description: "Atualiza quantidade e valores de um item vinculado ao contrato",
            headers: UpdateContratoItemControllerSchemas.Headers,
            body: UpdateContratoItemControllerSchemas.Body,
            response: UpdateContratoItemControllerSchemas.Response,
        },
    },
    "contratos/itens/delete": {
        method: "POST",
        preHandlers: [authMiddleware],
        make: makeDeleteContratoItem,
        schema: {
            tags: ["Contratos", "Itens do Contrato"],
            summary: "Remover item do contrato",
            description: "Remove item do contrato quando ele ainda não possui empenhos vinculados",
            headers: DeleteContratoItemControllerSchemas.Headers,
            body: DeleteContratoItemControllerSchemas.Body,
            response: DeleteContratoItemControllerSchemas.Response,
        },
    },

    // ─── Empenhos ──────────────────────────────────────────────────────────
    "contratos/empenhos": {
        method: "POST",
        preHandlers: [authMiddleware],
        make: makeCreateEmpenho,
        schema: {
            tags: ["Contratos", "Empenhos"],
            summary: "Criar novo empenho",
            description: "Cria uma nota de empenho vinculada a um contrato, deduzindo do saldo",
            headers: CreateEmpenhoControllerSchemas.Headers,
            body: CreateEmpenhoControllerSchemas.Body,
            response: CreateEmpenhoControllerSchemas.Response,
        },
    },
    "contratos/empenhos/list": {
        method: "GET",
        preHandlers: [authMiddleware],
        make: makeListEmpenhos,
        schema: {
            tags: ["Contratos", "Empenhos"],
            summary: "Listar empenhos do contrato",
            description: "Lista todas as notas de empenho registradas em um contrato",
            headers: ListEmpenhosControllerSchemas.Headers,
            query: ListEmpenhosControllerSchemas.Query,
            response: ListEmpenhosControllerSchemas.Response,
        },
    },
    "contratos/empenhos/locais": {
        method: "POST",
        preHandlers: [authMiddleware],
        make: makeCreateLocalEntrega,
        schema: {
            tags: ["Empenhos"],
            summary: "Adicionar Local de Entrega",
            description: "Adiciona um local de entrega à nota de empenho",
            headers: CreateLocalEntregaControllerSchemas.Headers,
            body: CreateLocalEntregaControllerSchemas.Body,
            response: CreateLocalEntregaControllerSchemas.Response,
        },
    },
    "contratos/empenhos/entregas": {
        method: "POST",
        preHandlers: [authMiddleware],
        make: makeCreateEntrega,
        schema: {
            tags: ["Empenhos (Entregas)"],
            summary: "Criar Entrega (Pipeline Logístico)",
            description: "Adiciona uma nova entrega pendente para um item de empenho",
            headers: CreateEntregaControllerSchemas.Headers,
            body: CreateEntregaControllerSchemas.Body,
            response: CreateEntregaControllerSchemas.Response,
        },
    },
    "contratos/empenhos/entregas/status": {
        method: "POST",
        preHandlers: [authMiddleware],
        make: makeUpdateEntregaStatus,
        schema: {
            tags: ["Empenhos (Entregas)"],
            summary: "Atualizar Status da Entrega",
            description: "Avança a entrega no pipeline (ENTREGUE, ACEITE, PAGO)",
            headers: UpdateEntregaStatusControllerSchemas.Headers,
            body: UpdateEntregaStatusControllerSchemas.Body,
            response: UpdateEntregaStatusControllerSchemas.Response,
        },
    },
};
