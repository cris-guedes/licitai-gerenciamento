/* eslint-disable @typescript-eslint/no-namespace */
import { Prisma } from "@prisma/client";
import { prisma } from "../db/client";
import { buildDefaultOportunidadeWorkflowDefinition } from "../workflows/default-oportunidade-workflow";

type WorkflowDbClient = Pick<typeof prisma, "workflowDefinition" | "workflowNodeKind" | "workflowNode" | "workflowTransition" | "oportunidade">;

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

    async createNode(
        params: PrismaWorkflowRepository.CreateNodeParams,
        tx?: Prisma.TransactionClient,
    ): Promise<PrismaWorkflowRepository.WorkflowDefinitionWithGraph> {
        const db = this.getDb(tx);
        const definition = await this.findDefinitionById({
            id: params.workflowDefinitionId,
            companyId: params.companyId,
        }, tx);

        if (!definition) {
            throw new Error("Workflow da empresa não encontrado.");
        }

        const parentNode = params.parentNodeId
            ? definition.nodes.find(node => node.id === params.parentNodeId)
            : null;

        if (params.parentNodeId && !parentNode) {
            throw new Error("Nó pai do workflow não encontrado.");
        }

        const allowedKinds = definition.nodeKinds
            .filter(kind => kind.parentKindId === (parentNode?.kindId ?? null))
            .sort(this.compareKinds);

        if (allowedKinds.length === 0) {
            throw new Error(parentNode ? "Este nó não aceita filhos." : "O workflow não possui um tipo raiz configurado.");
        }

        const kind = params.kindId
            ? allowedKinds.find(item => item.id === params.kindId)
            : allowedKinds[0];

        if (!kind) {
            throw new Error("Tipo de nó inválido para esta posição do workflow.");
        }

        const siblings = definition.nodes
            .filter(node => node.parentId === (parentNode?.id ?? null) && node.kindId === kind.id)
            .sort(this.compareNodes);
        const order = params.order ?? ((siblings.at(-1)?.order ?? 0) + 1);
        const key = this.buildUniqueNodeKey({
            definition,
            parentPath: parentNode?.path ?? null,
            kindKey: kind.key,
            label: params.label,
        });
        const path = parentNode?.path ? `${parentNode.path}/${kind.key}:${key}` : `${kind.key}:${key}`;
        const isInitial = params.isInitial ?? siblings.length === 0;

        if (isInitial) {
            await db.workflowNode.updateMany({
                where: {
                    workflowDefinitionId: definition.id,
                    parentId: parentNode?.id ?? null,
                    kindId: kind.id,
                    isInitial: true,
                },
                data: { isInitial: false },
            });
        }

        await db.workflowNode.create({
            data: {
                workflowDefinitionId: definition.id,
                kindId: kind.id,
                parentId: parentNode?.id ?? null,
                key,
                label: params.label.trim(),
                description: params.description?.trim() || null,
                order,
                depth: parentNode ? parentNode.depth + 1 : 0,
                path,
                color: params.color?.trim() || null,
                isInitial,
                isTerminal: params.isTerminal ?? false,
                metadata: this.buildNodeMetadata({
                    path,
                    order,
                    depth: parentNode ? parentNode.depth + 1 : 0,
                    nodeIndex: definition.nodes.length,
                    position: params.position,
                }),
            },
        });

        return this.requireUpdatedDefinition({
            workflowDefinitionId: params.workflowDefinitionId,
            companyId: params.companyId,
        }, tx);
    }

    async updateNodePresentation(
        params: PrismaWorkflowRepository.UpdateNodePresentationParams,
        tx?: Prisma.TransactionClient,
    ): Promise<PrismaWorkflowRepository.WorkflowDefinitionWithGraph> {
        const db = this.getDb(tx);
        const definition = await this.findDefinitionById({
            id: params.workflowDefinitionId,
            companyId: params.companyId,
        }, tx);

        if (!definition) {
            throw new Error("Workflow da empresa não encontrado.");
        }

        const node = definition.nodes.find(item => item.id === params.nodeId);
        if (!node) {
            throw new Error("Nó do workflow não encontrado.");
        }

        await db.workflowNode.update({
            where: { id: node.id },
            data: {
                ...(params.label !== undefined ? { label: params.label.trim() } : {}),
                ...(params.description !== undefined ? { description: params.description?.trim() || null } : {}),
                ...(params.color !== undefined ? { color: params.color?.trim() || null } : {}),
                ...(params.isInitial !== undefined ? { isInitial: params.isInitial } : {}),
                ...(params.isTerminal !== undefined ? { isTerminal: params.isTerminal } : {}),
                ...(params.order !== undefined ? { order: params.order } : {}),
                ...(params.position ? { metadata: this.mergeReactFlowPosition(node.metadata, params.position) } : {}),
            },
        });

        if (params.isInitial) {
            await db.workflowNode.updateMany({
                where: {
                    workflowDefinitionId: definition.id,
                    parentId: node.parentId,
                    kindId: node.kindId,
                    id: { not: node.id },
                    isInitial: true,
                },
                data: { isInitial: false },
            });
        }

        return this.requireUpdatedDefinition({
            workflowDefinitionId: params.workflowDefinitionId,
            companyId: params.companyId,
        }, tx);
    }

    async deleteNode(
        params: PrismaWorkflowRepository.DeleteNodeParams,
        tx?: Prisma.TransactionClient,
    ): Promise<PrismaWorkflowRepository.WorkflowDefinitionWithGraph> {
        const db = this.getDb(tx);
        const definition = await this.findDefinitionById({
            id: params.workflowDefinitionId,
            companyId: params.companyId,
        }, tx);

        if (!definition) {
            throw new Error("Workflow da empresa não encontrado.");
        }

        const node = definition.nodes.find(item => item.id === params.nodeId);
        if (!node) {
            throw new Error("Nó do workflow não encontrado.");
        }

        const deletedNodeIds = definition.nodes
            .filter(item => item.id === node.id || item.path.startsWith(`${node.path}/`))
            .map(item => item.id);
        const linkedOportunidades = await db.oportunidade.count({
            where: {
                companyId: params.companyId,
                workflowDefinitionId: definition.id,
                OR: [
                    { currentNodeId: { in: deletedNodeIds } },
                    { currentPhaseNodeId: { in: deletedNodeIds } },
                    { currentStatusNodeId: { in: deletedNodeIds } },
                    { currentSituationNodeId: { in: deletedNodeIds } },
                ],
            },
        });

        if (linkedOportunidades > 0) {
            throw new Error("Não é possível excluir um nó usado por oportunidades ativas.");
        }

        const remainingRootNodes = definition.nodes.filter(item => item.parentId === null && !deletedNodeIds.includes(item.id));
        if (node.parentId === null && remainingRootNodes.length === 0) {
            throw new Error("O workflow precisa manter pelo menos uma fase raiz.");
        }

        await db.workflowNode.delete({
            where: { id: node.id },
        });

        if (node.isInitial) {
            const nextInitial = definition.nodes
                .filter(item =>
                    item.parentId === node.parentId
                    && item.kindId === node.kindId
                    && !deletedNodeIds.includes(item.id))
                .sort(this.compareNodes)[0];

            if (nextInitial) {
                await db.workflowNode.update({
                    where: { id: nextInitial.id },
                    data: { isInitial: true },
                });
            }
        }

        return this.requireUpdatedDefinition({
            workflowDefinitionId: params.workflowDefinitionId,
            companyId: params.companyId,
        }, tx);
    }

    async createTransition(
        params: PrismaWorkflowRepository.CreateTransitionParams,
        tx?: Prisma.TransactionClient,
    ): Promise<PrismaWorkflowRepository.WorkflowDefinitionWithGraph> {
        const db = this.getDb(tx);
        const definition = await this.findDefinitionById({
            id: params.workflowDefinitionId,
            companyId: params.companyId,
        }, tx);

        if (!definition) {
            throw new Error("Workflow da empresa não encontrado.");
        }

        if (params.fromNodeId === params.toNodeId) {
            throw new Error("A transição precisa ligar dois nós diferentes.");
        }

        const fromNode = definition.nodes.find(node => node.id === params.fromNodeId);
        const toNode = definition.nodes.find(node => node.id === params.toNodeId);
        if (!fromNode || !toNode) {
            throw new Error("Origem ou destino da transição não encontrado.");
        }

        const existing = definition.transitions.find(transition =>
            transition.fromNodeId === fromNode.id && transition.toNodeId === toNode.id);
        if (existing) {
            throw new Error("Esta transição já existe no workflow.");
        }

        await db.workflowTransition.create({
            data: {
                workflowDefinitionId: definition.id,
                fromNodeId: fromNode.id,
                toNodeId: toNode.id,
                transitionType: params.transitionType?.trim() || null,
                metadata: this.buildTransitionMetadata({
                    transitionType: params.transitionType?.trim() || undefined,
                }),
            },
        });

        return this.requireUpdatedDefinition({
            workflowDefinitionId: params.workflowDefinitionId,
            companyId: params.companyId,
        }, tx);
    }

    async updateTransition(
        params: PrismaWorkflowRepository.UpdateTransitionParams,
        tx?: Prisma.TransactionClient,
    ): Promise<PrismaWorkflowRepository.WorkflowDefinitionWithGraph> {
        const db = this.getDb(tx);
        const definition = await this.findDefinitionById({
            id: params.workflowDefinitionId,
            companyId: params.companyId,
        }, tx);

        if (!definition) {
            throw new Error("Workflow da empresa não encontrado.");
        }

        const transition = definition.transitions.find(item => item.id === params.transitionId);
        if (!transition) {
            throw new Error("Transição do workflow não encontrada.");
        }

        await db.workflowTransition.update({
            where: { id: transition.id },
            data: {
                transitionType: params.transitionType?.trim() || null,
                metadata: this.mergeTransitionLabel(transition.metadata, params.transitionType?.trim() || null),
            },
        });

        return this.requireUpdatedDefinition({
            workflowDefinitionId: params.workflowDefinitionId,
            companyId: params.companyId,
        }, tx);
    }

    async deleteTransition(
        params: PrismaWorkflowRepository.DeleteTransitionParams,
        tx?: Prisma.TransactionClient,
    ): Promise<PrismaWorkflowRepository.WorkflowDefinitionWithGraph> {
        const db = this.getDb(tx);
        const definition = await this.findDefinitionById({
            id: params.workflowDefinitionId,
            companyId: params.companyId,
        }, tx);

        if (!definition) {
            throw new Error("Workflow da empresa não encontrado.");
        }

        const transition = definition.transitions.find(item => item.id === params.transitionId);
        if (!transition) {
            throw new Error("Transição do workflow não encontrada.");
        }

        await db.workflowTransition.delete({
            where: { id: transition.id },
        });

        return this.requireUpdatedDefinition({
            workflowDefinitionId: params.workflowDefinitionId,
            companyId: params.companyId,
        }, tx);
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
        const targetNode = definition.nodes.find(node => node.id === currentNodeId);
        if (!targetNode) return null;

        const currentNode = this.resolveInitialDescendantFromNode(definition, targetNode);

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

        return this.resolvePlacementFromDefinitionAndCurrentNode(definition, initialRoot.id);
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

    private resolveInitialDescendantFromNode(
        definition: PrismaWorkflowRepository.WorkflowDefinitionWithGraph,
        targetNode: PrismaWorkflowRepository.WorkflowDefinitionWithGraph["nodes"][number],
    ) {
        let current = targetNode;

        while (true) {
            const childNodes = definition.nodes
                .filter((node: PrismaWorkflowRepository.WorkflowDefinitionWithGraph["nodes"][number]) => node.parentId === current.id)
                .sort(this.compareNodes);

            const next = childNodes.find(node => node.isInitial) ?? childNodes[0] ?? null;
            if (!next) break;

            current = next;
        }

        return current;
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
        position?: PrismaWorkflowRepository.WorkflowNodePosition | null;
    }) {
        const baseMetadata = params.metadata ?? {};
        const x = 140 + (params.depth * 320);
        const y = 80 + (params.nodeIndex * 70);

        return {
            ...baseMetadata,
            reactFlow: {
                position: params.position ?? { x, y },
                positionSource: params.position ? "manual" : "auto",
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

    private compareKinds(
        a: { order: number; createdAt: Date; id: string },
        b: { order: number; createdAt: Date; id: string },
    ) {
        if (a.order !== b.order) return a.order - b.order;
        if (a.createdAt.getTime() !== b.createdAt.getTime()) return a.createdAt.getTime() - b.createdAt.getTime();
        return a.id.localeCompare(b.id);
    }

    private buildUniqueNodeKey(params: {
        definition: PrismaWorkflowRepository.WorkflowDefinitionWithGraph;
        parentPath: string | null;
        kindKey: string;
        label: string;
    }) {
        const baseKey = this.slugifyNodeKey(params.label);
        let key = baseKey;
        let suffix = 2;

        while (params.definition.nodes.some(node => {
            const path = params.parentPath ? `${params.parentPath}/${params.kindKey}:${key}` : `${params.kindKey}:${key}`;
            return node.path === path;
        })) {
            key = `${baseKey}_${suffix}`;
            suffix += 1;
        }

        return key;
    }

    private slugifyNodeKey(label: string) {
        const normalized = label
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "");

        return normalized || "novo_no";
    }

    private mergeReactFlowPosition(
        metadata: Prisma.JsonValue | null,
        position: PrismaWorkflowRepository.WorkflowNodePosition,
    ) {
        const objectMetadata = this.toObjectMetadata(metadata);
        const reactFlow = this.toObjectMetadata(objectMetadata.reactFlow as Prisma.JsonValue | null);

        return {
            ...objectMetadata,
            reactFlow: {
                ...reactFlow,
                position,
                positionSource: "manual",
            },
        } as Prisma.InputJsonValue;
    }

    private mergeTransitionLabel(
        metadata: Prisma.JsonValue | null,
        label: string | null,
    ) {
        const objectMetadata = this.toObjectMetadata(metadata);
        const reactFlow = this.toObjectMetadata(objectMetadata.reactFlow as Prisma.JsonValue | null);

        return {
            ...objectMetadata,
            reactFlow: {
                ...reactFlow,
                label,
            },
        } as Prisma.InputJsonValue;
    }

    private toObjectMetadata(metadata: Prisma.JsonValue | null | undefined): Record<string, unknown> {
        return metadata && typeof metadata === "object" && !Array.isArray(metadata)
            ? metadata as Record<string, unknown>
            : {};
    }

    private async requireUpdatedDefinition(
        params: {
            workflowDefinitionId: string;
            companyId: string;
        },
        tx?: Prisma.TransactionClient,
    ) {
        const updatedDefinition = await this.findDefinitionById({
            id: params.workflowDefinitionId,
            companyId: params.companyId,
        }, tx);

        if (!updatedDefinition) {
            throw new Error("Não foi possível recarregar o workflow atualizado.");
        }

        return updatedDefinition;
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

    export type WorkflowNodePosition = {
        x: number;
        y: number;
    };

    export type CreateNodeParams = {
        companyId: string;
        workflowDefinitionId: string;
        parentNodeId?: string | null;
        kindId?: string | null;
        label: string;
        description?: string | null;
        color?: string | null;
        isInitial?: boolean;
        isTerminal?: boolean;
        order?: number;
        position?: WorkflowNodePosition | null;
    };

    export type UpdateNodePresentationParams = {
        companyId: string;
        workflowDefinitionId: string;
        nodeId: string;
        label?: string;
        description?: string | null;
        color?: string | null;
        isInitial?: boolean;
        isTerminal?: boolean;
        order?: number;
        position?: WorkflowNodePosition | null;
    };

    export type DeleteNodeParams = {
        companyId: string;
        workflowDefinitionId: string;
        nodeId: string;
    };

    export type CreateTransitionParams = {
        companyId: string;
        workflowDefinitionId: string;
        fromNodeId: string;
        toNodeId: string;
        transitionType?: string | null;
    };

    export type UpdateTransitionParams = {
        companyId: string;
        workflowDefinitionId: string;
        transitionId: string;
        transitionType?: string | null;
    };

    export type DeleteTransitionParams = {
        companyId: string;
        workflowDefinitionId: string;
        transitionId: string;
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
