import type { DocumentAnalysisStatus, DocumentAnalysisType, DocumentStatus, DocumentType, EditalStatus, EditalTipoVersao, LicitacaoSourceSystem, LicitacaoStatus, Prisma } from "@prisma/client";
import type { PrismaDocumentAnalysisRepository } from "@/server/shared/infra/repositories/document-analysis.repository";
import type { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import { parseLicitacaoDraftPreview, type LicitacaoDraftPreview } from "./draftPreview";

export type LicitacaoDraftSummaryView = {
    oportunidadeId: string;
    oportunidadeStatus: "DRAFT" | "ACTIVE" | "CANCELLED";
    licitacaoId: string | null;
    licitacaoStatus: LicitacaoStatus | null;
    editalId: string | null;
    editalStatus: EditalStatus | null;
    primaryDocumentName: string | null;
    primaryDocumentType: DocumentType | null;
    draftPreview: LicitacaoDraftPreview | null;
    documentCount: number;
    readyDocuments: number;
    processingDocuments: number;
    failedDocuments: number;
    createdAt: string;
    updatedAt: string;
};

export type LicitacaoWorkspaceAnalysisView = {
    id: string;
    type: DocumentAnalysisType;
    status: DocumentAnalysisStatus;
    markdownContent: string | null;
    result: Prisma.JsonValue | null;
    metrics: Prisma.JsonValue | null;
    errorMessage: string | null;
    startedAt: string | null;
    finishedAt: string | null;
    createdAt: string;
    updatedAt: string;
};

export type LicitacaoWorkspaceDocumentView = {
    id: string;
    type: DocumentType;
    displayName: string | null;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    status: DocumentStatus;
    documentUrl: string;
    previewUrl: string;
    previewUrlExpiresAt: string;
    uploadedAt: string;
    analyses: LicitacaoWorkspaceAnalysisView[];
};

export type LicitacaoWorkspaceCronogramaView = {
    acolhimentoInicio: string | null;
    acolhimentoFim: string | null;
    horaLimite: string | null;
    sessaoPublicaEm: string | null;
    esclarecimentosAte: string | null;
    impugnacaoAte: string | null;
};

export type LicitacaoWorkspaceCertameView = {
    modoDisputa: string | null;
    criterioJulgamento: string | null;
    tipoLance: string | null;
    intervaloLances: string | null;
    duracaoSessaoMinutos: number | null;
    exclusivoMeEpp: boolean | null;
    permiteConsorcio: boolean | null;
    exigeVisitaTecnica: boolean | null;
    permiteAdesao: boolean | null;
    percentualAdesao: string | null;
    regionalidade: string | null;
    difal: boolean | null;
    vigenciaAtaMeses: number | null;
    vigenciaContratoDias: number | null;
};

export type LicitacaoWorkspaceExecucaoView = {
    prazoEntregaDias: string | null;
    localEntrega: string | null;
    tipoEntrega: string | null;
    responsavelInstalacao: string | null;
    prazoPagamentoDias: string | null;
    prazoAceiteDias: string | null;
    validadePropostaDias: string | null;
    garantiaTipo: string | null;
    garantiaMeses: string | null;
    garantiaTempoAtendimentoHoras: string | null;
};

export type LicitacaoWorkspaceItemView = {
    id: string;
    numeroItem: number | null;
    descricao: string | null;
    tipoItem: string | null;
    lote: string | null;
    quantidadeTotal: string | null;
    unidadeMedida: string | null;
    valorUnitarioEstimado: string | null;
    valorTotalEstimado: string | null;
    codigoCatmatCatser: string | null;
    codigoNcmNbs: string | null;
    criterioJulgamentoItem: string | null;
    beneficioTributario: string | null;
    observacao: string | null;
};

export type LicitacaoWorkspaceOrgaoView = {
    id: string;
    papel: string;
    orgao: {
        id: string;
        cnpj: string | null;
        razaoSocial: string | null;
        codigoUnidade: string | null;
        nomeUnidade: string | null;
        municipio: string | null;
        uf: string | null;
        esfera: string | null;
        poder: string | null;
    };
    itens: Array<{
        id: string;
        editalItemId: string;
        numeroItem: number | null;
        descricao: string | null;
        quantidadeSolicitada: string | null;
    }>;
};

export type LicitacaoWorkspaceHabilitacaoView = {
    id: string;
    tipo: string;
    categoria: string;
    obrigatorio: boolean;
    ordem: number | null;
};

export type LicitacaoWorkspaceView = {
    companyId: string;
    oportunidade: {
        id: string;
        status: "DRAFT" | "ACTIVE" | "CANCELLED";
        draftPreview: LicitacaoDraftPreview | null;
        createdAt: string;
        updatedAt: string;
    };
    licitacao: {
        id: string | null;
        status: LicitacaoStatus | null;
        sourceSystem: LicitacaoSourceSystem | null;
        sourceReference: string | null;
        numeroControlePncp: string | null;
        anoCompra: number | null;
        sequencialCompra: number | null;
        numeroLicitacao: string | null;
        processoAdministrativo: string | null;
        modalidadeNome: string | null;
        tipoInstrumentoNome: string | null;
        objetoResumo: string | null;
        situacaoOficial: string | null;
        valorEstimadoTotal: string | null;
        valorHomologadoTotal: string | null;
        dataPublicacao: string | null;
        dataAberturaProposta: string | null;
        dataEncerramentoProposta: string | null;
        linkSistemaOrigem: string | null;
        linkProcessoEletronico: string | null;
        ultimaAtualizacaoOficial: string | null;
        draftPreview: LicitacaoDraftPreview | null;
        createdAt: string;
        updatedAt: string;
    };
    edital: {
        id: string;
        status: EditalStatus;
        versao: number;
        isAtual: boolean;
        tipoVersao: EditalTipoVersao;
        documentoPrincipalId: string | null;
        orgaoCnpj: string | null;
        orgaoRazaoSocial: string | null;
        orgaoEsfera: string | null;
        orgaoPoder: string | null;
        unidadeCodigo: string | null;
        unidadeNome: string | null;
        municipio: string | null;
        uf: string | null;
        numero: string | null;
        processo: string | null;
        modalidade: string | null;
        tipoInstrumento: string | null;
        modoDisputa: string | null;
        objeto: string | null;
        valorEstimado: string | null;
        dataAbertura: string | null;
        dataEncerramento: string | null;
        informacaoComplementar: string | null;
        amparoLegal: string | null;
        srp: boolean;
        cronograma: LicitacaoWorkspaceCronogramaView | null;
        certame: LicitacaoWorkspaceCertameView | null;
        execucao: LicitacaoWorkspaceExecucaoView | null;
        itens: LicitacaoWorkspaceItemView[];
        orgaos: LicitacaoWorkspaceOrgaoView[];
        habilitacoes: LicitacaoWorkspaceHabilitacaoView[];
        createdAt: string;
        updatedAt: string;
    } | null;
    documents: LicitacaoWorkspaceDocumentView[];
};

export class LicitacaoWorkspaceViewMapper {
    static toDraftSummary(
        draft: PrismaOportunidadeRepository.OportunidadeDraftRecord,
    ): LicitacaoDraftSummaryView {
        const draftPreview = parseLicitacaoDraftPreview(draft.metadata ?? draft.licitacao?.metadados ?? null);
        const documents = draft.edital?.documents ?? [];
        const primaryDocument = documents.find(document => document.type === "EDITAL") ?? documents[0] ?? null;

        return {
            oportunidadeId: draft.id,
            oportunidadeStatus: draft.status,
            licitacaoId: draft.licitacao?.id ?? draft.licitacaoId ?? null,
            licitacaoStatus: draft.licitacao?.status ?? null,
            editalId: draft.edital?.id ?? null,
            editalStatus: draft.edital?.status ?? null,
            primaryDocumentName: draftPreview?.displayName ?? primaryDocument?.originalName ?? null,
            primaryDocumentType: primaryDocument?.type ?? null,
            draftPreview,
            documentCount: documents.length,
            readyDocuments: documents.filter(document => document.status === "READY").length,
            processingDocuments: documents.filter(document => document.status === "PROCESSING").length,
            failedDocuments: documents.filter(document => document.status === "FAILED").length,
            createdAt: draft.createdAt.toISOString(),
            updatedAt: draft.updatedAt.toISOString(),
        };
    }

    static toWorkspaceView(params: {
        workspace: PrismaOportunidadeRepository.OportunidadeWorkspaceRecord;
        analysesByDocumentId: Map<string, PrismaDocumentAnalysisRepository.DocumentAnalysisResponse[]>;
        urlsByDocumentId: Map<string, { documentUrl: string; previewUrlExpiresAt: Date }>;
    }): LicitacaoWorkspaceView {
        const draftPreview = parseLicitacaoDraftPreview(params.workspace.metadata ?? params.workspace.licitacao?.metadados ?? null);

        return {
            companyId: params.workspace.companyId,
            oportunidade: {
                id: params.workspace.id,
                status: params.workspace.status,
                draftPreview,
                createdAt: params.workspace.createdAt.toISOString(),
                updatedAt: params.workspace.updatedAt.toISOString(),
            },
            licitacao: {
                id: params.workspace.licitacao?.id ?? null,
                status: params.workspace.licitacao?.status ?? null,
                sourceSystem: params.workspace.licitacao?.sourceSystem ?? null,
                sourceReference: params.workspace.licitacao?.sourceReference ?? null,
                numeroControlePncp: params.workspace.licitacao?.numeroControlePncp ?? null,
                anoCompra: params.workspace.licitacao?.anoCompra ?? null,
                sequencialCompra: params.workspace.licitacao?.sequencialCompra ?? null,
                numeroLicitacao: params.workspace.licitacao?.numeroLicitacao ?? null,
                processoAdministrativo: params.workspace.licitacao?.processoAdministrativo ?? null,
                modalidadeNome: params.workspace.licitacao?.modalidadeNome ?? null,
                tipoInstrumentoNome: params.workspace.licitacao?.tipoInstrumentoNome ?? null,
                objetoResumo: params.workspace.licitacao?.objetoResumo ?? null,
                situacaoOficial: params.workspace.licitacao?.situacaoOficial ?? null,
                valorEstimadoTotal: params.workspace.licitacao?.valorEstimadoTotal?.toString?.() ?? null,
                valorHomologadoTotal: params.workspace.licitacao?.valorHomologadoTotal?.toString?.() ?? null,
                dataPublicacao: params.workspace.licitacao?.dataPublicacao?.toISOString() ?? null,
                dataAberturaProposta: params.workspace.licitacao?.dataAberturaProposta?.toISOString() ?? null,
                dataEncerramentoProposta: params.workspace.licitacao?.dataEncerramentoProposta?.toISOString() ?? null,
                linkSistemaOrigem: params.workspace.licitacao?.linkSistemaOrigem ?? null,
                linkProcessoEletronico: params.workspace.licitacao?.linkProcessoEletronico ?? null,
                ultimaAtualizacaoOficial: params.workspace.licitacao?.ultimaAtualizacaoOficial?.toISOString() ?? null,
                draftPreview,
                createdAt: params.workspace.licitacao?.createdAt.toISOString() ?? params.workspace.createdAt.toISOString(),
                updatedAt: params.workspace.licitacao?.updatedAt.toISOString() ?? params.workspace.updatedAt.toISOString(),
            },
            edital: params.workspace.edital
                ? {
                    id: params.workspace.edital.id,
                    status: params.workspace.edital.status,
                    versao: params.workspace.edital.versao,
                    isAtual: params.workspace.edital.isAtual,
                    tipoVersao: params.workspace.edital.tipoVersao,
                    documentoPrincipalId: params.workspace.edital.documentoPrincipalId,
                    orgaoCnpj: params.workspace.edital.orgaoCnpj,
                    orgaoRazaoSocial: params.workspace.edital.orgaoRazaoSocial,
                    orgaoEsfera: params.workspace.edital.orgaoEsfera,
                    orgaoPoder: params.workspace.edital.orgaoPoder,
                    unidadeCodigo: params.workspace.edital.unidadeCodigo,
                    unidadeNome: params.workspace.edital.unidadeNome,
                    municipio: params.workspace.edital.municipio,
                    uf: params.workspace.edital.uf,
                    numero: params.workspace.edital.numero,
                    processo: params.workspace.edital.processo,
                    modalidade: params.workspace.edital.modalidade,
                    tipoInstrumento: params.workspace.edital.tipoInstrumento,
                    modoDisputa: params.workspace.edital.modoDisputa,
                    objeto: params.workspace.edital.objeto,
                    valorEstimado: params.workspace.edital.valorEstimado?.toString?.() ?? null,
                    dataAbertura: params.workspace.edital.dataAbertura?.toISOString() ?? null,
                    dataEncerramento: params.workspace.edital.dataEncerramento?.toISOString() ?? null,
                    informacaoComplementar: params.workspace.edital.informacaoComplementar,
                    amparoLegal: params.workspace.edital.amparoLegal,
                    srp: params.workspace.edital.srp,
                    cronograma: this.toCronogramaView(params.workspace.edital.cronograma),
                    certame: this.toCertameView(params.workspace.edital.certame),
                    execucao: this.toExecucaoView(params.workspace.edital.dadosExtraidos),
                    itens: params.workspace.edital.itensDetalhados.map(item => this.toItemView(item)),
                    orgaos: params.workspace.edital.orgaos.map(orgao => this.toOrgaoView(orgao)),
                    habilitacoes: params.workspace.edital.habilitacoes.map(habilitacao => ({
                        id: habilitacao.id,
                        tipo: habilitacao.tipo,
                        categoria: habilitacao.categoria,
                        obrigatorio: habilitacao.obrigatorio,
                        ordem: habilitacao.ordem,
                    })),
                    createdAt: params.workspace.edital.createdAt.toISOString(),
                    updatedAt: params.workspace.edital.updatedAt.toISOString(),
                }
                : null,
            documents: (params.workspace.edital?.documents ?? []).map(document => this.toDocumentView({
                document,
                analyses: params.analysesByDocumentId.get(document.id) ?? [],
                urls: params.urlsByDocumentId.get(document.id),
                draftPreview,
            })),
        };
    }

    private static toCronogramaView(
        cronograma: NonNullable<PrismaOportunidadeRepository.OportunidadeWorkspaceRecord["edital"]>["cronograma"] | null | undefined,
    ): LicitacaoWorkspaceCronogramaView | null {
        if (!cronograma) return null;

        return {
            acolhimentoInicio: cronograma.acolhimentoInicio?.toISOString() ?? null,
            acolhimentoFim: cronograma.acolhimentoFim?.toISOString() ?? null,
            horaLimite: cronograma.horaLimite,
            sessaoPublicaEm: cronograma.sessaoPublicaEm?.toISOString() ?? null,
            esclarecimentosAte: cronograma.esclarecimentosAte?.toISOString() ?? null,
            impugnacaoAte: cronograma.impugnacaoAte?.toISOString() ?? null,
        };
    }

    private static toCertameView(
        certame: NonNullable<PrismaOportunidadeRepository.OportunidadeWorkspaceRecord["edital"]>["certame"] | null | undefined,
    ): LicitacaoWorkspaceCertameView | null {
        if (!certame) return null;

        return {
            modoDisputa: certame.modoDisputa,
            criterioJulgamento: certame.criterioJulgamento,
            tipoLance: certame.tipoLance,
            intervaloLances: certame.intervaloLances,
            duracaoSessaoMinutos: certame.duracaoSessaoMinutos,
            exclusivoMeEpp: certame.exclusivoMeEpp,
            permiteConsorcio: certame.permiteConsorcio,
            exigeVisitaTecnica: certame.exigeVisitaTecnica,
            permiteAdesao: certame.permiteAdesao,
            percentualAdesao: certame.percentualAdesao?.toString?.() ?? null,
            regionalidade: certame.regionalidade,
            difal: certame.difal,
            vigenciaAtaMeses: certame.vigenciaAtaMeses,
            vigenciaContratoDias: certame.vigenciaContratoDias,
        };
    }

    private static toExecucaoView(snapshot: Prisma.JsonValue | null | undefined): LicitacaoWorkspaceExecucaoView | null {
        const execucao = this.readObjectPath(snapshot, ["edital", "execucao"]);
        if (!execucao) return null;

        return {
            prazoEntregaDias: this.readStringPath(execucao, ["entrega", "prazoEmDias"]),
            localEntrega: this.readStringPath(execucao, ["entrega", "localEntrega"]),
            tipoEntrega: this.readStringPath(execucao, ["entrega", "tipoEntrega"]),
            responsavelInstalacao: this.readStringPath(execucao, ["entrega", "responsavelInstalacao"]),
            prazoPagamentoDias: this.readStringPath(execucao, ["pagamento", "prazoEmDias"]),
            prazoAceiteDias: this.readStringPath(execucao, ["aceite", "prazoEmDias"]),
            validadePropostaDias: this.readStringPath(execucao, ["validadeProposta"]),
            garantiaTipo: this.readStringPath(execucao, ["garantia", "tipo"]),
            garantiaMeses: this.readStringPath(execucao, ["garantia", "meses"]),
            garantiaTempoAtendimentoHoras: this.readStringPath(execucao, ["garantia", "tempoAtendimentoHoras"]),
        };
    }

    private static toItemView(
        item: NonNullable<PrismaOportunidadeRepository.OportunidadeWorkspaceRecord["edital"]>["itensDetalhados"][number],
    ): LicitacaoWorkspaceItemView {
        return {
            id: item.id,
            numeroItem: item.numeroItem,
            descricao: item.descricao,
            tipoItem: item.tipoItem,
            lote: item.lote,
            quantidadeTotal: item.quantidadeTotal?.toString?.() ?? null,
            unidadeMedida: item.unidadeMedida,
            valorUnitarioEstimado: item.valorUnitarioEstimado?.toString?.() ?? null,
            valorTotalEstimado: item.valorTotalEstimado?.toString?.() ?? null,
            codigoCatmatCatser: item.codigoCatmatCatser,
            codigoNcmNbs: item.codigoNcmNbs,
            criterioJulgamentoItem: item.criterioJulgamentoItem,
            beneficioTributario: item.beneficioTributario,
            observacao: item.observacao,
        };
    }

    private static toOrgaoView(
        orgao: NonNullable<PrismaOportunidadeRepository.OportunidadeWorkspaceRecord["edital"]>["orgaos"][number],
    ): LicitacaoWorkspaceOrgaoView {
        return {
            id: orgao.id,
            papel: orgao.papel,
            orgao: {
                id: orgao.orgao.id,
                cnpj: orgao.orgao.cnpj,
                razaoSocial: orgao.orgao.razaoSocial,
                codigoUnidade: orgao.orgao.codigoUnidade,
                nomeUnidade: orgao.orgao.nomeUnidade,
                municipio: orgao.orgao.municipio,
                uf: orgao.orgao.uf,
                esfera: orgao.orgao.esfera,
                poder: orgao.orgao.poder,
            },
            itens: orgao.itens.map(item => ({
                id: item.id,
                editalItemId: item.editalItemId,
                numeroItem: item.editalItem.numeroItem,
                descricao: item.editalItem.descricao,
                quantidadeSolicitada: item.quantidadeSolicitada?.toString?.() ?? null,
            })),
        };
    }

    private static readObjectPath(value: Prisma.JsonValue | null | undefined, path: string[]): Record<string, unknown> | null {
        let cursor: unknown = value;

        for (const key of path) {
            if (!cursor || typeof cursor !== "object" || Array.isArray(cursor)) return null;
            cursor = (cursor as Record<string, unknown>)[key];
        }

        return cursor && typeof cursor === "object" && !Array.isArray(cursor)
            ? cursor as Record<string, unknown>
            : null;
    }

    private static readStringPath(value: Record<string, unknown>, path: string[]): string | null {
        let cursor: unknown = value;

        for (const key of path) {
            if (!cursor || typeof cursor !== "object" || Array.isArray(cursor)) return null;
            cursor = (cursor as Record<string, unknown>)[key];
        }

        if (cursor === null || cursor === undefined || cursor === "") return null;
        if (typeof cursor === "string") return cursor;
        if (typeof cursor === "number" || typeof cursor === "boolean") return String(cursor);
        return null;
    }

    private static toDocumentView(params: {
        document: PrismaOportunidadeRepository.DraftDocumentRecord;
        analyses: PrismaDocumentAnalysisRepository.DocumentAnalysisResponse[];
        urls?: { documentUrl: string; previewUrlExpiresAt: Date };
        draftPreview: LicitacaoDraftPreview | null;
    }): LicitacaoWorkspaceDocumentView {
        return {
            id: params.document.id,
            type: params.document.type as DocumentType,
            displayName: params.draftPreview?.sourceDocumentId === params.document.id
                ? params.draftPreview.displayName
                : null,
            originalName: params.document.originalName,
            mimeType: params.document.mimeType,
            sizeBytes: params.document.sizeBytes,
            status: params.document.status as DocumentStatus,
            documentUrl: params.urls?.documentUrl ?? "",
            previewUrl: params.urls?.documentUrl ?? "",
            previewUrlExpiresAt: params.urls?.previewUrlExpiresAt.toISOString() ?? new Date(0).toISOString(),
            uploadedAt: params.document.updatedAt.toISOString(),
            analyses: params.analyses.map(analysis => this.toAnalysisView(analysis)),
        };
    }

    private static toAnalysisView(
        analysis: PrismaDocumentAnalysisRepository.DocumentAnalysisResponse,
    ): LicitacaoWorkspaceAnalysisView {
        return {
            id: analysis.id,
            type: analysis.type,
            status: analysis.status,
            markdownContent: analysis.markdownContent,
            result: analysis.result,
            metrics: analysis.metrics,
            errorMessage: analysis.errorMessage,
            startedAt: analysis.startedAt?.toISOString() ?? null,
            finishedAt: analysis.finishedAt?.toISOString() ?? null,
            createdAt: analysis.createdAt.toISOString(),
            updatedAt: analysis.updatedAt.toISOString(),
        };
    }
}
