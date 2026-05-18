import type { OportunidadeStatus } from "@prisma/client";
import type { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import { parseLicitacaoDraftPreview } from "./draftPreview";

export type OportunidadeBoardNodeView = {
    id: string;
    key: string;
    label: string;
    color: string | null;
    path: string;
    isInitial: boolean;
    isTerminal: boolean;
};

export type OportunidadeBoardItemView = {
    oportunidadeId: string;
    oportunidadeStatus: OportunidadeStatus;
    licitacaoId: string | null;
    editalId: string | null;
    workflowDefinitionId: string | null;
    title: string;
    numero: string | null;
    modalidade: string | null;
    objetoResumo: string | null;
    valorEstimado: string | null;
    valorHomologado: string | null;
    orgaoNome: string | null;
    responsavel: {
        id: string;
        name: string;
        email: string;
    } | null;
    workflow: {
        currentNode: OportunidadeBoardNodeView | null;
        phase: OportunidadeBoardNodeView | null;
        status: OportunidadeBoardNodeView | null;
        situation: OportunidadeBoardNodeView | null;
        updatedAt: string | null;
    };
    tasksSummary: {
        total: number;
        open: number;
        done: number;
    };
    latestNote: {
        content: string;
        authorName: string;
        createdAt: string;
    } | null;
    notesCount: number;
    itemCount: number;
    createdAt: string;
    updatedAt: string;
    canMove: boolean;
};

export class OportunidadeBoardViewMapper {
    static toItemView(params: {
        oportunidade: PrismaOportunidadeRepository.OportunidadeBoardRecord;
        currentUserId: string;
    }): OportunidadeBoardItemView {
        const { oportunidade, currentUserId } = params;
        const draftPreview = parseLicitacaoDraftPreview(oportunidade.metadata ?? oportunidade.licitacao?.metadados ?? null);
        const title = draftPreview?.displayName
            ?? oportunidade.edital?.objeto
            ?? oportunidade.licitacao?.objetoResumo
            ?? oportunidade.edital?.numero
            ?? oportunidade.licitacao?.numeroLicitacao
            ?? "Oportunidade sem título";
        const openTasks = oportunidade.tasks.filter(task => task.status === "OPEN").length;
        const doneTasks = oportunidade.tasks.filter(task => task.status === "DONE").length;
        const latestNote = oportunidade.notes[0] ?? null;

        return {
            oportunidadeId: oportunidade.id,
            oportunidadeStatus: oportunidade.status,
            licitacaoId: oportunidade.licitacaoId,
            editalId: oportunidade.editalId,
            workflowDefinitionId: oportunidade.workflowDefinitionId,
            title,
            numero: oportunidade.edital?.numero ?? oportunidade.licitacao?.numeroLicitacao ?? null,
            modalidade: oportunidade.edital?.modalidade ?? oportunidade.licitacao?.modalidadeNome ?? null,
            objetoResumo: oportunidade.edital?.objeto ?? oportunidade.licitacao?.objetoResumo ?? null,
            valorEstimado: oportunidade.edital?.valorEstimado?.toString?.()
                ?? oportunidade.licitacao?.valorEstimadoTotal?.toString?.()
                ?? null,
            valorHomologado: oportunidade.licitacao?.valorHomologadoTotal?.toString?.() ?? null,
            orgaoNome: oportunidade.edital?.orgaoRazaoSocial ?? oportunidade.licitacao?.orgaoGerenciador?.razaoSocial ?? null,
            responsavel: oportunidade.responsavel
                ? {
                    id: oportunidade.responsavel.id,
                    name: oportunidade.responsavel.name,
                    email: oportunidade.responsavel.email,
                }
                : null,
            workflow: {
                currentNode: this.toNodeView(oportunidade.currentNode),
                phase: this.toNodeView(oportunidade.currentPhaseNode),
                status: this.toNodeView(oportunidade.currentStatusNode),
                situation: this.toNodeView(oportunidade.currentSituationNode),
                updatedAt: oportunidade.workflowUpdatedAt?.toISOString() ?? null,
            },
            tasksSummary: {
                total: oportunidade.tasks.length,
                open: openTasks,
                done: doneTasks,
            },
            latestNote: latestNote
                ? {
                    content: latestNote.content,
                    authorName: latestNote.createdBy.name,
                    createdAt: latestNote.createdAt.toISOString(),
                }
                : null,
            notesCount: oportunidade._count.notes,
            itemCount: oportunidade._count.itens,
            createdAt: oportunidade.createdAt.toISOString(),
            updatedAt: oportunidade.updatedAt.toISOString(),
            canMove: oportunidade.responsavelUserId === currentUserId,
        };
    }

    private static toNodeView(
        node: PrismaOportunidadeRepository.OportunidadeBoardRecord["currentNode"] | null
            | PrismaOportunidadeRepository.OportunidadeBoardRecord["currentPhaseNode"]
            | PrismaOportunidadeRepository.OportunidadeBoardRecord["currentStatusNode"]
            | PrismaOportunidadeRepository.OportunidadeBoardRecord["currentSituationNode"],
    ): OportunidadeBoardNodeView | null {
        if (!node) return null;

        return {
            id: node.id,
            key: node.key,
            label: node.label,
            color: node.color,
            path: node.path,
            isInitial: node.isInitial,
            isTerminal: node.isTerminal,
        };
    }
}
