import type { Prisma } from "@prisma/client";
import type { PrismaWorkflowRepository } from "@/server/shared/infra/repositories/workflow.repository";

export type WorkflowNodeKindView = {
    id: string;
    key: string;
    label: string;
    description: string | null;
    order: number;
    parentKindId: string | null;
    color: string | null;
    metadata: Prisma.JsonValue | null;
    createdAt: string;
    updatedAt: string;
};

export type WorkflowNodeView = {
    id: string;
    kindId: string;
    parentId: string | null;
    key: string;
    label: string;
    description: string | null;
    order: number;
    depth: number;
    path: string;
    color: string | null;
    isInitial: boolean;
    isTerminal: boolean;
    metadata: Prisma.JsonValue | null;
    createdAt: string;
    updatedAt: string;
    kind: {
        id: string;
        key: string;
        label: string;
        order: number;
        parentKindId: string | null;
        color: string | null;
    };
};

export type WorkflowTransitionView = {
    id: string;
    fromNodeId: string;
    toNodeId: string;
    transitionType: string | null;
    metadata: Prisma.JsonValue | null;
    createdAt: string;
    updatedAt: string;
};

export type WorkflowDefinitionView = {
    id: string;
    companyId: string;
    name: string;
    slug: string;
    version: number;
    isActive: boolean;
    metadata: Prisma.JsonValue | null;
    createdAt: string;
    updatedAt: string;
    nodeKinds: WorkflowNodeKindView[];
    nodes: WorkflowNodeView[];
    transitions: WorkflowTransitionView[];
};

export class WorkflowViewMapper {
    static toView(
        definition: PrismaWorkflowRepository.WorkflowDefinitionWithGraph,
    ): WorkflowDefinitionView {
        return {
            id: definition.id,
            companyId: definition.companyId,
            name: definition.name,
            slug: definition.slug,
            version: definition.version,
            isActive: definition.isActive,
            metadata: definition.metadata,
            createdAt: definition.createdAt.toISOString(),
            updatedAt: definition.updatedAt.toISOString(),
            nodeKinds: definition.nodeKinds.map(kind => ({
                id: kind.id,
                key: kind.key,
                label: kind.label,
                description: kind.description,
                order: kind.order,
                parentKindId: kind.parentKindId,
                color: kind.color,
                metadata: kind.metadata,
                createdAt: kind.createdAt.toISOString(),
                updatedAt: kind.updatedAt.toISOString(),
            })),
            nodes: definition.nodes.map(node => ({
                id: node.id,
                kindId: node.kindId,
                parentId: node.parentId,
                key: node.key,
                label: node.label,
                description: node.description,
                order: node.order,
                depth: node.depth,
                path: node.path,
                color: node.color,
                isInitial: node.isInitial,
                isTerminal: node.isTerminal,
                metadata: node.metadata,
                createdAt: node.createdAt.toISOString(),
                updatedAt: node.updatedAt.toISOString(),
                kind: {
                    id: node.kind.id,
                    key: node.kind.key,
                    label: node.kind.label,
                    order: node.kind.order,
                    parentKindId: node.kind.parentKindId,
                    color: node.kind.color,
                },
            })),
            transitions: definition.transitions.map(transition => ({
                id: transition.id,
                fromNodeId: transition.fromNodeId,
                toNodeId: transition.toNodeId,
                transitionType: transition.transitionType,
                metadata: transition.metadata,
                createdAt: transition.createdAt.toISOString(),
                updatedAt: transition.updatedAt.toISOString(),
            })),
        };
    }
}
