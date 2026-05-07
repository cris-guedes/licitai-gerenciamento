/* eslint-disable @typescript-eslint/no-namespace */
import { Prisma } from "@prisma/client";
import { prisma } from "../db/client";
import { buildDefaultOportunidadeWorkflowDefinition } from "../workflows/default-oportunidade-workflow";

type WorkflowDbClient = Pick<typeof prisma, "workflowDefinition" | "workflowNodeKind" | "workflowNode" | "workflowTransition">;

export class PrismaWorkflowRepository {
    async ensureDefaultWorkflowForCompany(
        params: PrismaWorkflowRepository.EnsureDefaultWorkflowForCompanyParams,
        tx?: Prisma.TransactionClient,
    ): Promise<PrismaWorkflowRepository.WorkflowPlacement> {
        const existing = await this.findActiveDefinitionByCompanyId({ companyId: params.companyId }, tx);
        if (existing) {
            const placement = this.resolveInitialPlacementFromDefinition(existing);
            if (!placement) {
                throw new Error("O workflow ativo da empresa não possui um ponto inicial configurado.");
            }
            return placement;
        }

        return this.createDefaultWorkflowForCompany({ companyId: params.companyId }, tx);
    }

    async findActiveDefinitionByCompanyId(
        params: PrismaWorkflowRepository.FindActiveDefinitionByCompanyIdParams,
        tx?: Prisma.TransactionClient,
    ): Promise<PrismaWorkflowRepository.WorkflowDefinitionWithGraph | null> {
        const db = this.getDb(tx);

        return db.workflowDefinition.findFirst({
            where: {
                companyId: params.companyId,
                isActive: true,
            },
            include: {
                nodeKinds: {
                    orderBy: [
                        { order: "asc" },
                        { createdAt: "asc" },
                    ],
                },
                nodes: {
                    include: {
                        kind: true,
                    },
                    orderBy: [
                        { depth: "asc" },
                        { order: "asc" },
                        { createdAt: "asc" },
                    ],
                },
                transitions: {
                    orderBy: { createdAt: "asc" },
                },
            },
            orderBy: [
                { version: "desc" },
                { createdAt: "desc" },
            ],
        });
    }

    async findDefinitionById(
        params: PrismaWorkflowRepository.FindDefinitionByIdParams,
        tx?: Prisma.TransactionClient,
    ): Promise<PrismaWorkflowRepository.WorkflowDefinitionWithGraph | null> {
        const db = this.getDb(tx);

        return db.workflowDefinition.findFirst({
            where: {
                id: params.id,
                ...(params.companyId ? { companyId: params.companyId } : {}),
            },
            include: {
                nodeKinds: {
                    orderBy: [
                        { order: "asc" },
                        { createdAt: "asc" },
                    ],
                },
                nodes: {
                    include: {
                        kind: true,
                    },
                    orderBy: [
                        { depth: "asc" },
                        { order: "asc" },
                        { createdAt: "asc" },
                    ],
                },
                transitions: {
                    orderBy: { createdAt: "asc" },
                },
            },
        });
    }

    async resolveInitialPlacementForCompany(
        params: PrismaWorkflowRepository.ResolveInitialPlacementForCompanyParams,
        tx?: Prisma.TransactionClient,
    ): Promise<PrismaWorkflowRepository.WorkflowPlacement | null> {
        const definition = await this.findActiveDefinitionByCompanyId({ companyId: params.companyId }, tx);
        if (!definition) return null;
        return this.resolveInitialPlacementFromDefinition(definition);
    }

    async createDefaultWorkflowForCompany(
        params: PrismaWorkflowRepository.CreateDefaultWorkflowForCompanyParams,
        tx?: Prisma.TransactionClient,
    ): Promise<PrismaWorkflowRepository.WorkflowPlacement> {
        const db = this.getDb(tx);
        const seed = buildDefaultOportunidadeWorkflowDefinition();

        const definition = await db.workflowDefinition.create({
            data: {
                companyId: params.companyId,
                name: seed.name,
                slug: seed.slug,
                version: 1,
                isActive: true,
                metadata: seed.metadata as Prisma.InputJsonValue,
            },
        });

        const kindIdByKey = new Map<string, string>();
        for (const kind of seed.nodeKinds) {
            const createdKind = await db.workflowNodeKind.create({
                data: {
                    workflowDefinitionId: definition.id,
                    key: kind.key,
                    label: kind.label,
                    description: kind.description ?? null,
                    order: kind.order,
                    parentKindId: kind.parentKindKey ? kindIdByKey.get(kind.parentKindKey) ?? null : null,
                    color: kind.color ?? null,
                    metadata: kind.metadata ? kind.metadata as Prisma.InputJsonValue : undefined,
                },
            });

            kindIdByKey.set(kind.key, createdKind.id);
        }

        const nodeIdByPath = new Map<string, string>();
        for (const [nodeIndex, node] of seed.nodes.entries()) {
            const createdNode = await db.workflowNode.create({
                data: {
                    workflowDefinitionId: definition.id,
                    kindId: this.requireMapValue(kindIdByKey, node.kindKey, `kind ${node.kindKey}`),
                    parentId: node.parentPath ? this.requireMapValue(nodeIdByPath, node.parentPath, `node parent ${node.parentPath}`) : null,
                    key: node.key,
                    label: node.label,
                    description: node.description ?? null,
                    order: node.order,
                    depth: node.parentPath ? node.parentPath.split("/").length : 0,
                    path: this.buildNodePath(node),
                    color: node.color ?? null,
                    isInitial: node.isInitial ?? false,
                    isTerminal: node.isTerminal ?? false,
                    metadata: this.buildNodeMetadata({
                        path: this.buildNodePath(node),
                        order: node.order,
                        depth: node.parentPath ? node.parentPath.split("/").length : 0,
                        nodeIndex,
                        metadata: node.metadata,
                    }),
                },
            });

            nodeIdByPath.set(this.buildNodePath(node), createdNode.id);
        }

        for (const transition of seed.transitions) {
            await db.workflowTransition.create({
                data: {
                    workflowDefinitionId: definition.id,
                    fromNodeId: this.requireMapValue(nodeIdByPath, transition.fromPath, `transition source ${transition.fromPath}`),
                    toNodeId: this.requireMapValue(nodeIdByPath, transition.toPath, `transition target ${transition.toPath}`),
                    transitionType: transition.transitionType ?? null,
                    metadata: this.buildTransitionMetadata(transition),
                },
            });
        }

        const createdDefinition = await this.findActiveDefinitionByCompanyId({ companyId: params.companyId }, tx);
        if (!createdDefinition) {
            throw new Error("Falha ao carregar o workflow padrão criado para a empresa.");
        }

        const placement = this.resolveInitialPlacementFromDefinition(createdDefinition);
        if (!placement) {
            throw new Error("O workflow padrão criado não possui um ponto inicial configurado.");
        }

        return placement;
    }

    resolvePlacementFromDefinitionAndCurrentNode(
        definition: PrismaWorkflowRepository.WorkflowDefinitionWithGraph,
        currentNodeId: string,
    ): PrismaWorkflowRepository.WorkflowPlacement | null {
        const currentNode = definition.nodes.find(node => node.id === currentNodeId);
        if (!currentNode) return null;

        const metadata = this.getWorkflowMetadata(definition.metadata);
        const ancestry = this.getNodeAncestry(definition, currentNode);
        const currentPhaseNode = ancestry.find(node => node.kind.key === metadata.boardColumnKindKey) ?? null;
        const currentStatusNode = ancestry.find(node => node.kind.key === metadata.primaryBadgeKindKey) ?? null;
        const currentSituationNode = ancestry.find(node => node.kind.key === metadata.secondaryBadgeKindKey) ?? null;

        return {
            workflowDefinitionId: definition.id,
            currentNodeId: currentNode.id,
            currentPhaseNodeId: currentPhaseNode?.id ?? null,
            currentStatusNodeId: currentStatusNode?.id ?? null,
            currentSituationNodeId: currentSituationNode?.id ?? null,
        };
    }

    private resolveInitialPlacementFromDefinition(
        definition: PrismaWorkflowRepository.WorkflowDefinitionWithGraph,
    ): PrismaWorkflowRepository.WorkflowPlacement | null {
        const rootNodes = definition.nodes
            .filter((node: PrismaWorkflowRepository.WorkflowDefinitionWithGraph["nodes"][number]) => node.parentId === null)
            .sort(this.compareNodes);

        const initialRoot = rootNodes.find(node => node.isInitial) ?? rootNodes[0];
        if (!initialRoot) return null;

        let current = initialRoot;

        while (true) {
            const childNodes = definition.nodes
                .filter((node: PrismaWorkflowRepository.WorkflowDefinitionWithGraph["nodes"][number]) => node.parentId === current.id)
                .sort(this.compareNodes);

            const next = childNodes.find(node => node.isInitial) ?? null;
            if (!next) break;

            current = next;
        }

        return this.resolvePlacementFromDefinitionAndCurrentNode(definition, current.id);
    }

    private getWorkflowMetadata(metadata: Prisma.JsonValue | null | undefined) {
        const object = metadata && typeof metadata === "object" && !Array.isArray(metadata)
            ? metadata as Record<string, unknown>
            : {};

        return {
            boardColumnKindKey: typeof object.boardColumnKindKey === "string" ? object.boardColumnKindKey : "phase",
            primaryBadgeKindKey: typeof object.primaryBadgeKindKey === "string" ? object.primaryBadgeKindKey : "status",
            secondaryBadgeKindKey: typeof object.secondaryBadgeKindKey === "string" ? object.secondaryBadgeKindKey : "situation",
        };
    }

    private getNodeAncestry(
        definition: PrismaWorkflowRepository.WorkflowDefinitionWithGraph,
        currentNode: PrismaWorkflowRepository.WorkflowDefinitionWithGraph["nodes"][number],
    ) {
        const ancestry: PrismaWorkflowRepository.WorkflowDefinitionWithGraph["nodes"] = [];
        let cursor: PrismaWorkflowRepository.WorkflowDefinitionWithGraph["nodes"][number] | undefined = currentNode;

        while (cursor) {
            ancestry.push(cursor);
            const parentId: string | null | undefined = cursor.parentId;
            cursor = parentId
                ? definition.nodes.find((node: PrismaWorkflowRepository.WorkflowDefinitionWithGraph["nodes"][number]) => node.id === parentId)
                : undefined;
        }

        return ancestry;
    }

    private buildNodePath(node: { parentPath?: string; kindKey: string; key: string }) {
        const segment = `${node.kindKey}:${node.key}`;
        return node.parentPath ? `${node.parentPath}/${segment}` : segment;
    }

    private buildNodeMetadata(params: {
        path: string;
        order: number;
        depth: number;
        nodeIndex: number;
        metadata?: Record<string, unknown>;
    }) {
        const baseMetadata = params.metadata ?? {};
        const x = 140 + (params.depth * 320);
        const y = 80 + (params.nodeIndex * 70);

        return {
            ...baseMetadata,
            reactFlow: {
                position: { x, y },
            },
        } as Prisma.InputJsonValue;
    }

    private buildTransitionMetadata(transition: {
        transitionType?: string;
        metadata?: Record<string, unknown>;
    }) {
        const baseMetadata = transition.metadata ?? {};

        return {
            ...baseMetadata,
            reactFlow: {
                label: transition.transitionType ?? null,
            },
        } as Prisma.InputJsonValue;
    }

    private compareNodes(
        a: { order: number; createdAt: Date; id: string },
        b: { order: number; createdAt: Date; id: string },
    ) {
        if (a.order !== b.order) return a.order - b.order;
        if (a.createdAt.getTime() !== b.createdAt.getTime()) return a.createdAt.getTime() - b.createdAt.getTime();
        return a.id.localeCompare(b.id);
    }

    private getDb(tx?: Prisma.TransactionClient): WorkflowDbClient {
        return (tx ?? prisma) as WorkflowDbClient;
    }

    private requireMapValue(map: Map<string, string>, key: string, label: string) {
        const value = map.get(key);
        if (!value) {
            throw new Error(`Não foi possível localizar ${label} ao montar o workflow padrão.`);
        }
        return value;
    }
}

export namespace PrismaWorkflowRepository {
    export type EnsureDefaultWorkflowForCompanyParams = {
        companyId: string;
    };

    export type CreateDefaultWorkflowForCompanyParams = {
        companyId: string;
    };

    export type FindActiveDefinitionByCompanyIdParams = {
        companyId: string;
    };

    export type ResolveInitialPlacementForCompanyParams = {
        companyId: string;
    };

    export type FindDefinitionByIdParams = {
        id: string;
        companyId?: string;
    };

    export type WorkflowPlacement = {
        workflowDefinitionId: string;
        currentNodeId: string;
        currentPhaseNodeId: string | null;
        currentStatusNodeId: string | null;
        currentSituationNodeId: string | null;
    };

    export type WorkflowDefinitionWithGraph = Prisma.WorkflowDefinitionGetPayload<{
        include: {
            nodeKinds: true;
            nodes: {
                include: {
                    kind: true;
                };
            };
            transitions: true;
        };
    }>;
}
