/* eslint-disable @typescript-eslint/no-namespace */
import { EditalItemTipo, EditalOrgaoPapel, EditalStatus, EditalTipoVersao, LicitacaoSourceSystem, LicitacaoStatus, OportunidadeItemStatus, OportunidadeStatus, OportunidadeTaskStatus, Prisma, type Edital, type Licitacao, type Oportunidade } from "@prisma/client";
import type { PrismaDocumentRepository } from "./document.repository";
import { prisma } from "../db/client";

export class PrismaOportunidadeRepository {
    private readonly boardInclude = {
        licitacao: {
            include: {
                orgaoGerenciador: true,
            },
        },
        edital: true,
        responsavel: true,
        currentNode: true,
        currentPhaseNode: true,
        currentStatusNode: true,
        currentSituationNode: true,
        tasks: {
            select: {
                status: true,
            },
        },
        notes: {
            select: {
                content: true,
                createdAt: true,
                createdBy: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 1,
        },
        _count: {
            select: {
                itens: true,
                notes: true,
            },
        },
    } satisfies Prisma.OportunidadeInclude;

    async createDraft(
        params: PrismaOportunidadeRepository.CreateDraftParams,
    ): Promise<PrismaOportunidadeRepository.OportunidadeResponse> {
        return prisma.oportunidade.create({
            data: {
                id: params.id,
                companyId: params.companyId,
                responsavelUserId: params.responsavelUserId,
                status: params.status,
                metadata: this.toJsonInput(params.metadata),
            },
        });
    }

    async createDraftWithLicitacaoEdital(
        params: PrismaOportunidadeRepository.CreateDraftWithLicitacaoEditalParams,
    ): Promise<PrismaOportunidadeRepository.CreateDraftWithLicitacaoEditalResponse> {
        return prisma.$transaction(async tx => {
            const oportunidade = await tx.oportunidade.create({
                data: {
                    id: params.oportunidade.id,
                    companyId: params.oportunidade.companyId,
                    responsavelUserId: params.oportunidade.responsavelUserId,
                    status: params.oportunidade.status,
                    metadata: params.oportunidade.metadata ?? undefined,
                },
            });

            const licitacao = await tx.licitacao.create({
                data: {
                    id: params.licitacao.id,
                    companyId: params.licitacao.companyId,
                    createdById: params.licitacao.createdById,
                    status: params.licitacao.status,
                    metadados: params.licitacao.metadados ?? undefined,
                },
            });

            const edital = await tx.edital.create({
                data: {
                    id: params.edital.id,
                    licitacaoId: licitacao.id,
                    companyId: params.edital.companyId,
                    createdById: params.edital.createdById,
                    status: params.edital.status,
                },
            });

            const updatedOportunidade = await tx.oportunidade.update({
                where: { id: oportunidade.id },
                data: {
                    licitacaoId: licitacao.id,
                    editalId: edital.id,
                },
            });

            return {
                oportunidade: updatedOportunidade,
                licitacao,
                edital,
            };
        });
    }

    async createDraftWithLicitacaoEditalAndDocument(
        params: PrismaOportunidadeRepository.CreateDraftWithLicitacaoEditalAndDocumentParams,
    ): Promise<PrismaOportunidadeRepository.CreateDraftWithLicitacaoEditalAndDocumentResponse> {
        return prisma.$transaction(async tx => {
            const oportunidade = await tx.oportunidade.create({
                data: {
                    id: params.oportunidade.id,
                    companyId: params.oportunidade.companyId,
                    responsavelUserId: params.oportunidade.responsavelUserId,
                    status: params.oportunidade.status,
                    metadata: params.oportunidade.metadata ?? undefined,
                },
            });

            const licitacao = await tx.licitacao.create({
                data: {
                    id: params.licitacao.id,
                    companyId: params.licitacao.companyId,
                    createdById: params.licitacao.createdById,
                    status: params.licitacao.status,
                    metadados: params.licitacao.metadados ?? undefined,
                },
            });

            const edital = await tx.edital.create({
                data: {
                    id: params.edital.id,
                    licitacaoId: licitacao.id,
                    companyId: params.edital.companyId,
                    createdById: params.edital.createdById,
                    status: params.edital.status,
                },
            });

            const document = await tx.document.create({
                data: {
                    ...params.document,
                    editalId: edital.id,
                },
            });

            const updatedOportunidade = await tx.oportunidade.update({
                where: { id: oportunidade.id },
                data: {
                    licitacaoId: licitacao.id,
                    editalId: edital.id,
                },
            });

            return {
                oportunidade: updatedOportunidade,
                licitacao,
                edital,
                document,
            };
        });
    }

    async findById(
        params: PrismaOportunidadeRepository.FindByIdParams,
    ): Promise<PrismaOportunidadeRepository.OportunidadeResponse | null> {
        return prisma.oportunidade.findFirst({
            where: {
                id: params.id,
                ...(params.companyId ? { companyId: params.companyId } : {}),
            },
        });
    }

    async listItemsByOportunidadeId(
        params: PrismaOportunidadeRepository.ListItemsByOportunidadeIdParams,
    ): Promise<PrismaOportunidadeRepository.OportunidadeItemRecord[]> {
        return prisma.oportunidadeItem.findMany({
            where: {
                oportunidadeId: params.oportunidadeId,
                oportunidade: {
                    companyId: params.companyId,
                },
                ...(params.selectedOnly ? { isSelected: true } : {}),
            },
            include: {
                editalItem: true,
                companyItem: true,
                pricing: true,
                disputa: true,
            },
            orderBy: [
                { editalItem: { numeroItem: "asc" } },
                { createdAt: "asc" },
            ],
        });
    }

    async findItemById(
        params: PrismaOportunidadeRepository.FindItemByIdParams,
    ): Promise<PrismaOportunidadeRepository.OportunidadeItemRecord | null> {
        return prisma.oportunidadeItem.findFirst({
            where: {
                id: params.oportunidadeItemId,
                oportunidadeId: params.oportunidadeId,
                oportunidade: {
                    companyId: params.companyId,
                },
            },
            include: {
                editalItem: true,
                companyItem: true,
                pricing: true,
                disputa: true,
            },
        });
    }

    async listDraftsByCompanyId(
        params: PrismaOportunidadeRepository.ListDraftsByCompanyIdParams,
    ): Promise<PrismaOportunidadeRepository.OportunidadeDraftRecord[]> {
        return prisma.oportunidade.findMany({
            where: {
                companyId: params.companyId,
                status: OportunidadeStatus.DRAFT,
            },
            include: {
                licitacao: true,
                edital: {
                    include: {
                        cronograma: true,
                        certame: true,
                        documents: {
                            orderBy: [
                                { createdAt: "asc" },
                                { originalName: "asc" },
                            ],
                        },
                        habilitacoes: {
                            orderBy: [
                                { ordem: "asc" },
                                { createdAt: "asc" },
                            ],
                        },
                        itensDetalhados: {
                            orderBy: [
                                { numeroItem: "asc" },
                                { createdAt: "asc" },
                            ],
                        },
                        orgaos: {
                            include: {
                                orgao: true,
                                itens: {
                                    include: {
                                        editalItem: true,
                                    },
                                    orderBy: [
                                        { editalItem: { numeroItem: "asc" } },
                                        { createdAt: "asc" },
                                    ],
                                },
                            },
                            orderBy: [
                                { papel: "asc" },
                                { createdAt: "asc" },
                            ],
                        },
                    },
                },
            },
            orderBy: { updatedAt: "desc" },
        });
    }

    async listKnownOrgaosByCompanyId(
        params: PrismaOportunidadeRepository.ListKnownOrgaosByCompanyIdParams,
    ): Promise<PrismaOportunidadeRepository.KnownOrgaoRecord[]> {
        const records = await prisma.orgaoPublico.findMany({
            where: {
                OR: [
                    {
                        licitacoesGerenciadas: {
                            some: {
                                companyId: params.companyId,
                            },
                        },
                    },
                    {
                        editalOrgaos: {
                            some: {
                                edital: {
                                    companyId: params.companyId,
                                },
                            },
                        },
                    },
                ],
            },
            select: {
                id: true,
                cnpj: true,
                razaoSocial: true,
                codigoUnidade: true,
                nomeUnidade: true,
                municipio: true,
                uf: true,
                esfera: true,
                poder: true,
                createdAt: true,
            },
            orderBy: [
                { razaoSocial: "asc" },
                { nomeUnidade: "asc" },
                { createdAt: "desc" },
            ],
        });

        const deduped = new Map<string, PrismaOportunidadeRepository.KnownOrgaoRecord>();

        for (const record of records) {
            const normalized = this.toKnownOrgaoRecord(record);
            if (!normalized) continue;

            const dedupeKey = [
                normalized.cnpj,
                normalized.nome,
                normalized.codigoUnidade,
                normalized.nomeUnidade,
                normalized.municipio,
                normalized.uf,
            ]
                .map(value => value.trim().toLowerCase())
                .join("|");

            if (!deduped.has(dedupeKey)) {
                deduped.set(dedupeKey, normalized);
            }
        }

        return Array.from(deduped.values()).sort((left, right) => {
            const leftLabel = left.nome || left.nomeUnidade || left.municipio || left.cnpj;
            const rightLabel = right.nome || right.nomeUnidade || right.municipio || right.cnpj;
            return leftLabel.localeCompare(rightLabel, "pt-BR", { sensitivity: "base" });
        });
    }

    async findWorkspaceById(
        params: PrismaOportunidadeRepository.FindWorkspaceByIdParams,
    ): Promise<PrismaOportunidadeRepository.OportunidadeWorkspaceRecord | null> {
        return prisma.oportunidade.findFirst({
            where: {
                id: params.oportunidadeId,
                companyId: params.companyId,
            },
            include: {
                licitacao: true,
                edital: {
                    include: {
                        cronograma: true,
                        certame: true,
                        documents: {
                            orderBy: [
                                { createdAt: "asc" },
                                { originalName: "asc" },
                            ],
                        },
                        habilitacoes: {
                            orderBy: [
                                { ordem: "asc" },
                                { createdAt: "asc" },
                            ],
                        },
                        itensDetalhados: {
                            orderBy: [
                                { numeroItem: "asc" },
                                { createdAt: "asc" },
                            ],
                        },
                        orgaos: {
                            include: {
                                orgao: true,
                                itens: {
                                    include: {
                                        editalItem: true,
                                    },
                                    orderBy: [
                                        { editalItem: { numeroItem: "asc" } },
                                        { createdAt: "asc" },
                                    ],
                                },
                            },
                            orderBy: [
                                { papel: "asc" },
                                { createdAt: "asc" },
                            ],
                        },
                    },
                },
                tasks: {
                    include: {
                        createdBy: true,
                    },
                    orderBy: [
                        { status: "asc" },
                        { dueAt: "asc" },
                        { createdAt: "asc" },
                    ],
                },
                notes: {
                    include: {
                        createdBy: true,
                    },
                    orderBy: [
                        { createdAt: "desc" },
                    ],
                },
                itens: {
                    include: {
                        editalItem: true,
                        companyItem: true,
                        pricing: true,
                        disputa: true,
                    },
                    orderBy: [
                        { editalItem: { numeroItem: "asc" } },
                        { createdAt: "asc" },
                    ],
                },
            },
        });
    }

    async listBoardByCompanyId(
        params: PrismaOportunidadeRepository.ListBoardByCompanyIdParams,
    ): Promise<PrismaOportunidadeRepository.OportunidadeBoardRecord[]> {
        const q = params.q?.trim();
        const andFilters: Prisma.OportunidadeWhereInput[] = [];

        if (q) {
            andFilters.push({
                OR: [
                    {
                        edital: {
                            is: {
                                numero: { contains: q, mode: "insensitive" },
                            },
                        },
                    },
                    {
                        edital: {
                            is: {
                                objeto: { contains: q, mode: "insensitive" },
                            },
                        },
                    },
                    {
                        edital: {
                            is: {
                                orgaoRazaoSocial: { contains: q, mode: "insensitive" },
                            },
                        },
                    },
                    {
                        licitacao: {
                            is: {
                                numeroLicitacao: { contains: q, mode: "insensitive" },
                            },
                        },
                    },
                    {
                        licitacao: {
                            is: {
                                objetoResumo: { contains: q, mode: "insensitive" },
                            },
                        },
                    },
                    {
                        licitacao: {
                            is: {
                                orgaoGerenciador: {
                                    is: {
                                        razaoSocial: { contains: q, mode: "insensitive" },
                                    },
                                },
                            },
                        },
                    },
                    {
                        responsavel: {
                            is: {
                                name: { contains: q, mode: "insensitive" },
                            },
                        },
                    },
                    {
                        responsavel: {
                            is: {
                                email: { contains: q, mode: "insensitive" },
                            },
                        },
                    },
                ],
            });
        }

        if (params.valorEstimadoMin !== undefined || params.valorEstimadoMax !== undefined) {
            const valueRange: Prisma.DecimalNullableFilter = {
                ...(params.valorEstimadoMin !== undefined ? { gte: params.valorEstimadoMin } : {}),
                ...(params.valorEstimadoMax !== undefined ? { lte: params.valorEstimadoMax } : {}),
            };

            andFilters.push({
                OR: [
                    {
                        edital: {
                            is: {
                                valorEstimado: valueRange,
                            },
                        },
                    },
                    {
                        licitacao: {
                            is: {
                                valorEstimadoTotal: valueRange,
                            },
                        },
                    },
                ],
            });
        }

        return prisma.oportunidade.findMany({
            where: {
                companyId: params.companyId,
                status: OportunidadeStatus.ACTIVE,
                ...(params.workflowNodeIds && params.workflowNodeIds.length > 0 ? { currentNodeId: { in: params.workflowNodeIds } } : {}),
                ...(params.currentPhaseNodeId ? { currentPhaseNodeId: params.currentPhaseNodeId } : {}),
                ...(params.currentStatusNodeId ? { currentStatusNodeId: params.currentStatusNodeId } : {}),
                ...(params.currentSituationNodeId ? { currentSituationNodeId: params.currentSituationNodeId } : {}),
                ...(params.responsavelUserId ? { responsavelUserId: params.responsavelUserId } : {}),
                ...(andFilters.length > 0 ? { AND: andFilters } : {}),
            },
            include: this.boardInclude,
            orderBy: [
                { workflowUpdatedAt: "desc" },
                { updatedAt: "desc" },
            ],
        });
    }

    async findBoardById(
        params: PrismaOportunidadeRepository.FindBoardByIdParams,
    ): Promise<PrismaOportunidadeRepository.OportunidadeBoardRecord | null> {
        return prisma.oportunidade.findFirst({
            where: {
                id: params.oportunidadeId,
                companyId: params.companyId,
            },
            include: this.boardInclude,
        });
    }

    async update(
        params: PrismaOportunidadeRepository.UpdateParams,
    ): Promise<PrismaOportunidadeRepository.OportunidadeResponse> {
        return prisma.oportunidade.update({
            where: { id: params.id },
            data: {
                ...params.data,
                metadata: this.toJsonInput(params.data.metadata),
            },
        });
    }

    async updateDetails(
        params: PrismaOportunidadeRepository.UpdateDetailsParams,
    ): Promise<PrismaOportunidadeRepository.OportunidadeBoardRecord> {
        return prisma.$transaction(async tx => {
            const oportunidade = await tx.oportunidade.findFirst({
                where: {
                    id: params.oportunidadeId,
                    companyId: params.companyId,
                },
                include: {
                    licitacao: true,
                    edital: true,
                },
            });

            if (!oportunidade) {
                throw new Error("Oportunidade não encontrada.");
            }

            const licitacaoData = this.toLicitacaoDetailsUpdateData(params.data);
            const editalData = this.toEditalDetailsUpdateData(params.data);

            if (oportunidade.licitacaoId && Object.keys(licitacaoData).length > 0) {
                await tx.licitacao.update({
                    where: { id: oportunidade.licitacaoId },
                    data: licitacaoData,
                });
            }

            if (oportunidade.editalId && Object.keys(editalData).length > 0) {
                await tx.edital.update({
                    where: { id: oportunidade.editalId },
                    data: editalData,
                });
            }

            if (params.data.metadata !== undefined) {
                await tx.oportunidade.update({
                    where: { id: oportunidade.id },
                    data: {
                        metadata: this.toJsonInput(params.data.metadata),
                    },
                });
            }

            const updated = await tx.oportunidade.findFirst({
                where: {
                    id: params.oportunidadeId,
                    companyId: params.companyId,
                },
                include: this.boardInclude,
            });

            if (!updated) {
                throw new Error("Não foi possível recarregar a oportunidade após a atualização.");
            }

            return updated;
        });
    }

    async createItemManagement(
        params: PrismaOportunidadeRepository.CreateItemManagementParams,
    ): Promise<PrismaOportunidadeRepository.OportunidadeItemRecord> {
        return prisma.$transaction(async tx => {
            const oportunidade = await tx.oportunidade.findUnique({
                where: { id: params.oportunidadeId },
                select: { editalId: true },
            });

            if (!oportunidade || !oportunidade.editalId) {
                throw new Error("Oportunidade ou Edital não encontrado.");
            }

            const editalItem = await tx.editalItem.create({
                data: {
                    editalId: oportunidade.editalId,
                    numeroItem: params.data.numeroItem,
                    descricao: params.data.descricao,
                    quantidadeTotal: params.data.quantidadeTotal,
                    valorUnitarioEstimado: params.data.valorUnitarioEstimado,
                    valorTotalEstimado: params.data.valorTotalEstimado,
                    unidadeMedida: params.data.unidadeMedida,
                },
            });

            return tx.oportunidadeItem.create({
                data: {
                    oportunidadeId: params.oportunidadeId,
                    editalItemId: editalItem.id,
                    isSelected: true,
                    status: "PENDING_PRICING",
                },
                include: {
                    editalItem: true,
                    companyItem: true,
                    pricing: true,
                    disputa: true,
                },
            });
        });
    }

    async deleteItemManagement(
        params: PrismaOportunidadeRepository.DeleteItemManagementParams,
    ): Promise<void> {
        await prisma.$transaction(async tx => {
            const item = await tx.oportunidadeItem.findUnique({
                where: { id: params.oportunidadeItemId },
                select: { editalItemId: true },
            });

            if (!item) {
                return;
            }

            await tx.oportunidadeItem.delete({
                where: { id: params.oportunidadeItemId },
            });

            await tx.editalItem.delete({
                where: { id: item.editalItemId },
            });
        });
    }

    async updateItemManagement(
        params: PrismaOportunidadeRepository.UpdateItemManagementParams,
    ): Promise<PrismaOportunidadeRepository.OportunidadeItemRecord> {
        return prisma.$transaction(async tx => {
            if (params.data.editalItem) {
                const item = await tx.oportunidadeItem.findUnique({
                    where: { id: params.oportunidadeItemId },
                    select: { editalItemId: true },
                });

                if (!item) {
                    throw new Error("Item da oportunidade não encontrado.");
                }

                await tx.editalItem.update({
                    where: { id: item.editalItemId },
                    data: params.data.editalItem,
                });
            }

            return tx.oportunidadeItem.update({
                where: { id: params.oportunidadeItemId },
                data: {
                    ...(params.data.companyItemId !== undefined ? { companyItemId: params.data.companyItemId } : {}),
                    ...(params.data.isSelected !== undefined ? { isSelected: params.data.isSelected } : {}),
                    ...(params.data.status !== undefined ? { status: params.data.status } : {}),
                    ...(params.data.observacaoInterna !== undefined ? { observacaoInterna: params.data.observacaoInterna } : {}),
                    ...(params.data.pricing
                        ? {
                            pricing: {
                                upsert: {
                                    create: params.data.pricing,
                                    update: params.data.pricing,
                                },
                            },
                        }
                        : {}),
                    ...(params.data.disputa
                        ? {
                            disputa: {
                                upsert: {
                                    create: params.data.disputa,
                                    update: params.data.disputa,
                                },
                            },
                        }
                        : {}),
                },
                include: {
                    editalItem: true,
                    companyItem: true,
                    pricing: true,
                    disputa: true,
                },
            });
        });
    }

    async createTask(
        params: PrismaOportunidadeRepository.CreateTaskParams,
    ): Promise<PrismaOportunidadeRepository.OportunidadeTaskRecord> {
        return prisma.oportunidadeTask.create({
            data: {
                oportunidadeId: params.oportunidadeId,
                companyId: params.companyId,
                createdById: params.createdById,
                title: params.title,
                dueAt: params.dueAt ?? undefined,
                status: OportunidadeTaskStatus.OPEN,
            },
            include: {
                createdBy: true,
            },
        });
    }

    async findTaskById(
        params: PrismaOportunidadeRepository.FindTaskByIdParams,
    ): Promise<PrismaOportunidadeRepository.OportunidadeTaskRecord | null> {
        return prisma.oportunidadeTask.findFirst({
            where: {
                id: params.taskId,
                oportunidadeId: params.oportunidadeId,
                companyId: params.companyId,
            },
            include: {
                createdBy: true,
            },
        });
    }

    async updateTaskStatus(
        params: PrismaOportunidadeRepository.UpdateTaskStatusParams,
    ): Promise<PrismaOportunidadeRepository.OportunidadeTaskRecord> {
        return prisma.oportunidadeTask.update({
            where: { id: params.taskId },
            data: {
                status: params.status,
                completedAt: params.status === OportunidadeTaskStatus.DONE ? params.completedAt ?? new Date() : null,
            },
            include: {
                createdBy: true,
            },
        });
    }

    async deleteTaskById(
        params: PrismaOportunidadeRepository.DeleteTaskByIdParams,
    ): Promise<PrismaOportunidadeRepository.OportunidadeTaskRecord> {
        return prisma.oportunidadeTask.delete({
            where: { id: params.taskId },
            include: {
                createdBy: true,
            },
        });
    }

    async createNote(
        params: PrismaOportunidadeRepository.CreateNoteParams,
    ): Promise<PrismaOportunidadeRepository.OportunidadeNoteRecord> {
        return prisma.oportunidadeNote.create({
            data: {
                oportunidadeId: params.oportunidadeId,
                companyId: params.companyId,
                createdById: params.createdById,
                content: params.content,
            },
            include: {
                createdBy: true,
            },
        });
    }

    async findNoteById(
        params: PrismaOportunidadeRepository.FindNoteByIdParams,
    ): Promise<PrismaOportunidadeRepository.OportunidadeNoteRecord | null> {
        return prisma.oportunidadeNote.findFirst({
            where: {
                id: params.noteId,
                oportunidadeId: params.oportunidadeId,
                companyId: params.companyId,
            },
            include: {
                createdBy: true,
            },
        });
    }

    async deleteNoteById(
        params: PrismaOportunidadeRepository.DeleteNoteByIdParams,
    ): Promise<PrismaOportunidadeRepository.OportunidadeNoteRecord> {
        return prisma.oportunidadeNote.delete({
            where: { id: params.noteId },
            include: {
                createdBy: true,
            },
        });
    }

    async deleteDraftById(
        params: PrismaOportunidadeRepository.DeleteDraftByIdParams,
    ): Promise<PrismaOportunidadeRepository.OportunidadeResponse> {
        return prisma.$transaction(async tx => {
            if (params.documentIds.length > 0) {
                await tx.document.deleteMany({
                    where: {
                        id: { in: params.documentIds },
                    },
                });
            }

            if (params.licitacaoId) {
                await tx.licitacao.delete({
                    where: { id: params.licitacaoId },
                });
            } else {
                await tx.oportunidade.delete({
                    where: { id: params.oportunidadeId },
                });
            }

            return {
                id: params.oportunidadeId,
                companyId: params.companyId,
                licitacaoId: params.licitacaoId ?? null,
                editalId: params.editalId ?? null,
                workflowDefinitionId: null,
                currentNodeId: null,
                currentPhaseNodeId: null,
                currentStatusNodeId: null,
                currentSituationNodeId: null,
                responsavelUserId: params.responsavelUserId ?? null,
                status: OportunidadeStatus.DRAFT,
                metadata: null,
                workflowUpdatedAt: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        });
    }

    async finalizeRegistration(
        params: PrismaOportunidadeRepository.FinalizeRegistrationParams,
    ): Promise<PrismaOportunidadeRepository.FinalizeRegistrationResponse> {
        return prisma.$transaction(async tx => {
            const existingOpportunity = params.oportunidadeId
                ? await tx.oportunidade.findFirst({
                    where: {
                        id: params.oportunidadeId,
                        companyId: params.companyId,
                    },
                    include: {
                        licitacao: true,
                        edital: {
                            include: {
                                documents: {
                                    orderBy: [
                                        { createdAt: "asc" },
                                        { originalName: "asc" },
                                    ],
                                },
                            },
                        },
                    },
                })
                : null;

            if (params.oportunidadeId && !existingOpportunity) {
                throw new Error("Rascunho não encontrado.");
            }

            if (existingOpportunity && existingOpportunity.status !== OportunidadeStatus.DRAFT) {
                throw new Error("A oportunidade informada não está mais em rascunho.");
            }

            const oportunidade = existingOpportunity ?? await tx.oportunidade.create({
                data: {
                    companyId: params.companyId,
                    responsavelUserId: params.responsavelUserId,
                    status: OportunidadeStatus.DRAFT,
                },
            });

            const licitacao = existingOpportunity?.licitacao ?? await tx.licitacao.create({
                data: {
                    companyId: params.companyId,
                    createdById: params.createdById,
                    status: LicitacaoStatus.IN_PROGRESS,
                },
            });

            const edital = existingOpportunity?.edital ?? await tx.edital.create({
                data: {
                    companyId: params.companyId,
                    createdById: params.createdById,
                    licitacaoId: licitacao.id,
                    status: EditalStatus.IN_PROGRESS,
                },
            });

            if (!existingOpportunity || existingOpportunity.licitacaoId !== licitacao.id || existingOpportunity.editalId !== edital.id) {
                await tx.oportunidade.update({
                    where: { id: oportunidade.id },
                    data: {
                        licitacaoId: licitacao.id,
                        editalId: edital.id,
                    },
                });
            }

            const documentoPrincipal = existingOpportunity?.edital?.documents.find(document => document.type === "EDITAL")
                ?? existingOpportunity?.edital?.documents[0]
                ?? null;

            let orgaoGerenciadorId = licitacao.orgaoGerenciadorId;
            if (params.orgaoGerenciador) {
                if (orgaoGerenciadorId) {
                    await tx.orgaoPublico.update({
                        where: { id: orgaoGerenciadorId },
                        data: this.toOrgaoPublicoData(params.orgaoGerenciador),
                    });
                } else {
                    const createdOrgaoGerenciador = await tx.orgaoPublico.create({
                        data: this.toOrgaoPublicoData(params.orgaoGerenciador),
                    });
                    orgaoGerenciadorId = createdOrgaoGerenciador.id;
                }
            }

            await tx.oportunidadeItem.deleteMany({
                where: { oportunidadeId: oportunidade.id },
            });

            const existingEditalOrgaos = await tx.editalOrgao.findMany({
                where: { editalId: edital.id },
                select: { id: true },
            });

            if (existingEditalOrgaos.length > 0) {
                await tx.editalOrgaoItem.deleteMany({
                    where: {
                        editalOrgaoId: {
                            in: existingEditalOrgaos.map(orgao => orgao.id),
                        },
                    },
                });
            }

            await tx.editalOrgao.deleteMany({
                where: { editalId: edital.id },
            });
            await tx.editalItem.deleteMany({
                where: { editalId: edital.id },
            });
            await tx.editalHabilitacaoExigencia.deleteMany({
                where: { editalId: edital.id },
            });
            await tx.editalCronograma.deleteMany({
                where: { editalId: edital.id },
            });
            await tx.editalCertame.deleteMany({
                where: { editalId: edital.id },
            });

            await tx.licitacao.update({
                where: { id: licitacao.id },
                data: {
                    status: LicitacaoStatus.COMPLETED,
                    sourceSystem: params.licitacao.sourceSystem ?? licitacao.sourceSystem ?? LicitacaoSourceSystem.MANUAL,
                    sourceReference: params.licitacao.sourceReference,
                    anoCompra: params.licitacao.anoCompra,
                    numeroLicitacao: params.licitacao.numeroLicitacao,
                    processoAdministrativo: params.licitacao.processoAdministrativo,
                    modalidadeNome: params.licitacao.modalidadeNome,
                    objetoResumo: params.licitacao.objetoResumo,
                    situacaoOficial: params.licitacao.situacaoOficial,
                    valorEstimadoTotal: params.licitacao.valorEstimadoTotal,
                    valorHomologadoTotal: params.licitacao.valorHomologadoTotal,
                    dataPublicacao: params.licitacao.dataPublicacao,
                    dataAberturaProposta: params.licitacao.dataAberturaProposta,
                    dataEncerramentoProposta: params.licitacao.dataEncerramentoProposta,
                    linkProcessoEletronico: params.licitacao.linkProcessoEletronico,
                    ultimaAtualizacaoOficial: params.licitacao.ultimaAtualizacaoOficial,
                    orgaoGerenciadorId,
                },
            });

            await tx.edital.update({
                where: { id: edital.id },
                data: {
                    status: EditalStatus.COMPLETED,
                    versao: params.edital.versao,
                    isAtual: params.edital.isAtual,
                    tipoVersao: params.edital.tipoVersao,
                    documentoPrincipalId: documentoPrincipal?.id ?? null,
                    orgaoCnpj: params.edital.orgaoCnpj,
                    orgaoRazaoSocial: params.edital.orgaoRazaoSocial,
                    orgaoEsfera: params.edital.orgaoEsfera,
                    orgaoPoder: params.edital.orgaoPoder,
                    unidadeCodigo: params.edital.unidadeCodigo,
                    unidadeNome: params.edital.unidadeNome,
                    municipio: params.edital.municipio,
                    uf: params.edital.uf,
                    numero: params.edital.numero,
                    processo: params.edital.processo,
                    modalidade: params.edital.modalidade,
                    modoDisputa: params.edital.modoDisputa,
                    amparoLegal: params.edital.amparoLegal,
                    srp: params.edital.srp,
                    objeto: params.edital.objeto,
                    informacaoComplementar: params.edital.informacaoComplementar,
                    dataAbertura: params.edital.dataAbertura,
                    dataEncerramento: params.edital.dataEncerramento,
                    valorEstimado: params.edital.valorEstimado,
                    dadosExtraidos: this.toJsonInput(params.formSnapshot as Prisma.InputJsonValue),
                },
            });

            await tx.editalCronograma.create({
                data: {
                    editalId: edital.id,
                    acolhimentoInicio: params.cronograma.acolhimentoInicio,
                    acolhimentoFim: params.cronograma.acolhimentoFim,
                    horaLimite: params.cronograma.horaLimite,
                    sessaoPublicaEm: params.cronograma.sessaoPublicaEm,
                    esclarecimentosAte: params.cronograma.esclarecimentosAte,
                    impugnacaoAte: params.cronograma.impugnacaoAte,
                },
            });

            await tx.editalCertame.create({
                data: {
                    editalId: edital.id,
                    modoDisputa: params.certame.modoDisputa,
                    criterioJulgamento: params.certame.criterioJulgamento,
                    tipoLance: params.certame.tipoLance,
                    intervaloLances: params.certame.intervaloLances,
                    duracaoSessaoMinutos: params.certame.duracaoSessaoMinutos,
                    exclusivoMeEpp: params.certame.exclusivoMeEpp,
                    permiteConsorcio: params.certame.permiteConsorcio,
                    exigeVisitaTecnica: params.certame.exigeVisitaTecnica,
                    permiteAdesao: params.certame.permiteAdesao,
                    percentualAdesao: params.certame.percentualAdesao,
                    regionalidade: params.certame.regionalidade,
                    difal: params.certame.difal,
                    vigenciaAtaMeses: params.certame.vigenciaAtaMeses,
                    vigenciaContratoDias: params.certame.vigenciaContratoDias,
                },
            });

            const editalOrgaoByReference = new Map<string, string>();
            if (params.orgaoGerenciador && orgaoGerenciadorId) {
                const editalOrgaoGerenciador = await tx.editalOrgao.create({
                    data: {
                        editalId: edital.id,
                        orgaoId: orgaoGerenciadorId,
                        papel: EditalOrgaoPapel.GERENCIADOR,
                    },
                });
                editalOrgaoByReference.set("orgao-gerenciador", editalOrgaoGerenciador.id);
            }

            for (const [index, orgaoParticipante] of params.orgaosParticipantes.entries()) {
                const orgao = await tx.orgaoPublico.create({
                    data: this.toOrgaoPublicoData(orgaoParticipante),
                });

                const editalOrgao = await tx.editalOrgao.create({
                    data: {
                        editalId: edital.id,
                        orgaoId: orgao.id,
                        papel: EditalOrgaoPapel.PARTICIPANTE,
                    },
                });

                editalOrgaoByReference.set(`orgao-participante-${index}`, editalOrgao.id);
            }

            const editalItemIdByReference = new Map<string, string>();
            for (const item of params.itens) {
                const createdItem = await tx.editalItem.create({
                    data: {
                        editalId: edital.id,
                        numeroItem: item.numeroItem,
                        descricao: item.descricao,
                        tipoItem: this.toEditalItemTipo(item.tipoItem),
                        lote: item.lote,
                        quantidadeTotal: item.quantidadeTotal,
                        unidadeMedida: item.unidadeMedida,
                        valorUnitarioEstimado: item.valorUnitarioEstimado,
                        valorTotalEstimado: item.valorTotalEstimado,
                        codigoCatmatCatser: item.codigoCatmatCatser,
                        codigoNcmNbs: item.codigoNcmNbs,
                        criterioJulgamentoItem: item.criterioJulgamentoItem,
                        beneficioTributario: item.beneficioTributario,
                        observacao: item.observacao,
                    },
                });

                editalItemIdByReference.set(item.referenceId, createdItem.id);

                await tx.oportunidadeItem.create({
                    data: {
                        oportunidadeId: oportunidade.id,
                        editalItemId: createdItem.id,
                    },
                });
            }

            if (params.orgaoGerenciador) {
                await this.createDistribuicoesForOrgao({
                    tx,
                    editalOrgaoId: editalOrgaoByReference.get("orgao-gerenciador") ?? null,
                    itemReferences: params.orgaoGerenciador.itensSolicitados,
                    editalItemIdByReference,
                });
            }

            for (const [index, orgaoParticipante] of params.orgaosParticipantes.entries()) {
                await this.createDistribuicoesForOrgao({
                    tx,
                    editalOrgaoId: editalOrgaoByReference.get(`orgao-participante-${index}`) ?? null,
                    itemReferences: orgaoParticipante.itensSolicitados,
                    editalItemIdByReference,
                });
            }

            for (const [index, habilitacao] of params.habilitacoes.entries()) {
                await tx.editalHabilitacaoExigencia.create({
                    data: {
                        editalId: edital.id,
                        tipo: habilitacao.tipo ?? "",
                        categoria: habilitacao.categoria ?? "",
                        obrigatorio: habilitacao.obrigatorio ?? true,
                        ordem: index + 1,
                    },
                });
            }

            const updatedOportunidade = await tx.oportunidade.update({
                where: { id: oportunidade.id },
                data: {
                    licitacaoId: licitacao.id,
                    editalId: edital.id,
                    responsavelUserId: params.responsavelUserId,
                    workflowDefinitionId: params.workflowPlacement.workflowDefinitionId,
                    currentNodeId: params.workflowPlacement.currentNodeId,
                    currentPhaseNodeId: params.workflowPlacement.currentPhaseNodeId,
                    currentStatusNodeId: params.workflowPlacement.currentStatusNodeId,
                    currentSituationNodeId: params.workflowPlacement.currentSituationNodeId,
                    workflowUpdatedAt: new Date(),
                    status: OportunidadeStatus.ACTIVE,
                },
            });

            return {
                oportunidadeId: updatedOportunidade.id,
                oportunidadeStatus: "ACTIVE",
                licitacaoId: licitacao.id,
                licitacaoStatus: LicitacaoStatus.COMPLETED,
                editalId: edital.id,
                editalStatus: EditalStatus.COMPLETED,
            };
        });
    }

    private toJsonInput(value: Prisma.InputJsonValue | null | undefined) {
        if (value === undefined) return undefined;
        if (value === null) return Prisma.JsonNull;
        return value;
    }

    private toLicitacaoDetailsUpdateData(
        data: PrismaOportunidadeRepository.UpdateDetailsData,
    ): Prisma.LicitacaoUpdateInput {
        const updateData: Prisma.LicitacaoUpdateInput = {};

        if (data.numero !== undefined) updateData.numeroLicitacao = data.numero;
        if (data.processo !== undefined) updateData.processoAdministrativo = data.processo;
        if (data.modalidade !== undefined) updateData.modalidadeNome = data.modalidade;
        if (data.objetoResumo !== undefined) updateData.objetoResumo = data.objetoResumo;
        if (data.valorEstimado !== undefined) updateData.valorEstimadoTotal = data.valorEstimado;
        if (data.dataAbertura !== undefined) updateData.dataAberturaProposta = data.dataAbertura;
        if (data.dataEncerramento !== undefined) updateData.dataEncerramentoProposta = data.dataEncerramento;

        return updateData;
    }

    private toEditalDetailsUpdateData(
        data: PrismaOportunidadeRepository.UpdateDetailsData,
    ): Prisma.EditalUpdateInput {
        const updateData: Prisma.EditalUpdateInput = {};

        if (data.numero !== undefined) updateData.numero = data.numero;
        if (data.processo !== undefined) updateData.processo = data.processo;
        if (data.modalidade !== undefined) updateData.modalidade = data.modalidade;
        if (data.orgaoNome !== undefined) updateData.orgaoRazaoSocial = data.orgaoNome;
        if (data.objetoResumo !== undefined) updateData.objeto = data.objetoResumo;
        if (data.valorEstimado !== undefined) updateData.valorEstimado = data.valorEstimado;
        if (data.dataAbertura !== undefined) updateData.dataAbertura = data.dataAbertura;
        if (data.dataEncerramento !== undefined) updateData.dataEncerramento = data.dataEncerramento;

        return updateData;
    }

    private toOrgaoPublicoData(orgao: PrismaOportunidadeRepository.FinalizeRegistrationOrgaoData) {
        return {
            cnpj: orgao.cnpj,
            razaoSocial: orgao.razaoSocial,
            codigoUnidade: orgao.codigoUnidade,
            nomeUnidade: orgao.nomeUnidade,
            municipio: orgao.municipio,
            uf: orgao.uf,
            esfera: orgao.esfera,
            poder: orgao.poder,
        };
    }

    private toKnownOrgaoRecord(record: {
        id: string;
        cnpj: string | null;
        razaoSocial: string | null;
        codigoUnidade: string | null;
        nomeUnidade: string | null;
        municipio: string | null;
        uf: string | null;
        esfera: "FEDERAL" | "ESTADUAL" | "MUNICIPAL" | null;
        poder: "EXECUTIVO" | "LEGISLATIVO" | "JUDICIARIO" | null;
    }): PrismaOportunidadeRepository.KnownOrgaoRecord | null {
        const normalized = {
            id: record.id,
            cnpj: record.cnpj?.trim() ?? "",
            nome: record.razaoSocial?.trim() ?? "",
            codigoUnidade: record.codigoUnidade?.trim() ?? "",
            nomeUnidade: record.nomeUnidade?.trim() ?? "",
            municipio: record.municipio?.trim() ?? "",
            uf: record.uf?.trim().toUpperCase() ?? "",
            esfera: this.toKnownOrgaoEsferaValue(record.esfera),
            poder: this.toKnownOrgaoPoderValue(record.poder),
        };

        const hasMeaningfulData = Boolean(
            normalized.cnpj
            || normalized.nome
            || normalized.codigoUnidade
            || normalized.nomeUnidade
            || normalized.municipio
            || normalized.uf,
        );

        return hasMeaningfulData ? normalized : null;
    }

    private toKnownOrgaoEsferaValue(value: "FEDERAL" | "ESTADUAL" | "MUNICIPAL" | null) {
        switch (value) {
            case "FEDERAL":
                return "federal";
            case "ESTADUAL":
                return "estadual";
            case "MUNICIPAL":
                return "municipal";
            default:
                return "";
        }
    }

    private toKnownOrgaoPoderValue(value: "EXECUTIVO" | "LEGISLATIVO" | "JUDICIARIO" | null) {
        switch (value) {
            case "EXECUTIVO":
                return "executivo";
            case "LEGISLATIVO":
                return "legislativo";
            case "JUDICIARIO":
                return "judiciario";
            default:
                return "";
        }
    }

    private toEditalItemTipo(value: string | null) {
        if (value === "material") return EditalItemTipo.MATERIAL;
        if (value === "servico") return EditalItemTipo.SERVICO;
        return null;
    }

    private async createDistribuicoesForOrgao(params: {
        tx: Prisma.TransactionClient;
        editalOrgaoId: string | null;
        itemReferences: PrismaOportunidadeRepository.FinalizeRegistrationItemSolicitadoData[];
        editalItemIdByReference: Map<string, string>;
    }) {
        if (!params.editalOrgaoId) return;

        for (const itemSolicitado of params.itemReferences) {
            if (!itemSolicitado.itemReferenceId || itemSolicitado.quantidadeSolicitada === null) {
                continue;
            }

            const editalItemId = params.editalItemIdByReference.get(itemSolicitado.itemReferenceId);
            if (!editalItemId) {
                continue;
            }

            await params.tx.editalOrgaoItem.create({
                data: {
                    editalOrgaoId: params.editalOrgaoId,
                    editalItemId,
                    quantidadeSolicitada: itemSolicitado.quantidadeSolicitada,
                },
            });
        }
    }
}

export namespace PrismaOportunidadeRepository {
    export type OportunidadeResponse = Oportunidade;

    export type DraftLicitacaoParams = {
        id: string;
        companyId: string;
        createdById?: string | null;
        status: LicitacaoStatus;
        metadados?: Prisma.InputJsonValue | null;
    };

    export type DraftEditalParams = {
        id: string;
        companyId: string;
        createdById?: string | null;
        status: EditalStatus;
    };

    export type DraftOportunidadeParams = {
        id: string;
        companyId: string;
        responsavelUserId?: string | null;
        status: OportunidadeStatus;
        metadata?: Prisma.InputJsonValue | null;
    };

    export type CreateDraftParams = DraftOportunidadeParams;

    export type CreateDraftWithLicitacaoEditalParams = {
        oportunidade: DraftOportunidadeParams;
        licitacao: DraftLicitacaoParams;
        edital: DraftEditalParams;
    };

    export type CreateDraftWithLicitacaoEditalAndDocumentParams = CreateDraftWithLicitacaoEditalParams & {
        document: PrismaDocumentRepository.CreateParams;
    };

    export type LicitacaoResponse = Licitacao;

    export type EditalResponse = Edital;

    export type CreateDraftWithLicitacaoEditalResponse = {
        oportunidade: OportunidadeResponse;
        licitacao: LicitacaoResponse;
        edital: EditalResponse;
    };

    export type CreateDraftWithLicitacaoEditalAndDocumentResponse = CreateDraftWithLicitacaoEditalResponse & {
        document: PrismaDocumentRepository.DocumentResponse;
    };

    export type FindByIdParams = {
        id: string;
        companyId?: string;
    };

    export type ListItemsByOportunidadeIdParams = {
        oportunidadeId: string;
        companyId: string;
        selectedOnly?: boolean;
    };

    export type FindItemByIdParams = {
        companyId: string;
        oportunidadeId: string;
        oportunidadeItemId: string;
    };

    export type ListDraftsByCompanyIdParams = {
        companyId: string;
    };

    export type ListKnownOrgaosByCompanyIdParams = {
        companyId: string;
    };

    export type FindWorkspaceByIdParams = {
        oportunidadeId: string;
        companyId: string;
    };

    export type ListBoardByCompanyIdParams = {
        companyId: string;
        workflowNodeIds?: string[];
        currentPhaseNodeId?: string;
        currentStatusNodeId?: string;
        currentSituationNodeId?: string;
        responsavelUserId?: string;
        valorEstimadoMin?: number;
        valorEstimadoMax?: number;
        q?: string;
    };

    export type FindBoardByIdParams = {
        companyId: string;
        oportunidadeId: string;
    };

    export type UpdateData = {
        licitacaoId?: string | null;
        editalId?: string | null;
        workflowDefinitionId?: string | null;
        currentNodeId?: string | null;
        currentPhaseNodeId?: string | null;
        currentStatusNodeId?: string | null;
        currentSituationNodeId?: string | null;
        responsavelUserId?: string | null;
        status?: OportunidadeStatus;
        metadata?: Prisma.InputJsonValue | null;
        workflowUpdatedAt?: Date | null;
    };

    export type UpdateItemManagementData = {
        editalItem?: {
            numeroItem?: number | null;
            descricao?: string | null;
            tipoItem?: EditalItemTipo | null;
            lote?: string | null;
            quantidadeTotal?: number | Prisma.Decimal | null;
            unidadeMedida?: string | null;
            valorUnitarioEstimado?: number | Prisma.Decimal | null;
            valorTotalEstimado?: number | Prisma.Decimal | null;
        };
        companyItemId?: string | null;
        isSelected?: boolean;
        status?: OportunidadeItemStatus;
        observacaoInterna?: string | null;
        pricing?: {
            quantidadeCotada?: number | Prisma.Decimal | null;
            quantidadeAdesao?: number | Prisma.Decimal | null;
            precoOfertaUnitario?: number | Prisma.Decimal | null;
            precoOfertaTotal?: number | Prisma.Decimal | null;
            custoUnitarioSnapshot?: number | Prisma.Decimal | null;
            valorMinimoLance?: number | Prisma.Decimal | null;
            ofertaMarca?: string | null;
            ofertaModelo?: string | null;
            garantiaDescricao?: string | null;
        };
        disputa?: {
            ultimoLance?: number | Prisma.Decimal | null;
            dataUltimoLance?: Date | null;
            situacaoDisputa?: string | null;
            observacaoOperacional?: string | null;
        };
    };

    export type UpdateParams = {
        id: string;
        data: UpdateData;
    };

    export type CreateItemManagementData = {
        numeroItem?: number | null;
        descricao?: string | null;
        quantidadeTotal?: number | Prisma.Decimal | null;
        valorUnitarioEstimado?: number | Prisma.Decimal | null;
        valorTotalEstimado?: number | Prisma.Decimal | null;
        unidadeMedida?: string | null;
    };

    export type CreateItemManagementParams = {
        oportunidadeId: string;
        data: CreateItemManagementData;
    };

    export type DeleteItemManagementParams = {
        oportunidadeItemId: string;
    };

    export type UpdateItemManagementParams = {
        oportunidadeItemId: string;
        data: UpdateItemManagementData;
    };

    export type UpdateDetailsData = {
        numero?: string | null;
        processo?: string | null;
        modalidade?: string | null;
        orgaoNome?: string | null;
        objetoResumo?: string | null;
        valorEstimado?: number | null;
        dataAbertura?: Date | null;
        dataEncerramento?: Date | null;
        metadata?: Prisma.InputJsonValue | null;
    };

    export type UpdateDetailsParams = {
        companyId: string;
        oportunidadeId: string;
        data: UpdateDetailsData;
    };

    export type CreateTaskParams = {
        companyId: string;
        oportunidadeId: string;
        createdById: string;
        title: string;
        dueAt?: Date | null;
    };

    export type FindTaskByIdParams = {
        companyId: string;
        oportunidadeId: string;
        taskId: string;
    };

    export type UpdateTaskStatusParams = {
        taskId: string;
        status: OportunidadeTaskStatus;
        completedAt?: Date | null;
    };

    export type DeleteTaskByIdParams = {
        taskId: string;
    };

    export type CreateNoteParams = {
        companyId: string;
        oportunidadeId: string;
        createdById: string;
        content: string;
    };

    export type FindNoteByIdParams = {
        companyId: string;
        oportunidadeId: string;
        noteId: string;
    };

    export type DeleteNoteByIdParams = {
        noteId: string;
    };

    export type DeleteDraftByIdParams = {
        oportunidadeId: string;
        companyId: string;
        licitacaoId?: string | null;
        editalId?: string | null;
        responsavelUserId?: string | null;
        documentIds: string[];
    };

    export type DraftDocumentRecord = PrismaDocumentRepository.DocumentResponse;

    export type OportunidadeDraftRecord = OportunidadeResponse & {
        licitacao: LicitacaoResponse | null;
        edital: (EditalResponse & {
            documents: DraftDocumentRecord[];
        }) | null;
    };

    export type OportunidadeWorkspaceRecord = Prisma.OportunidadeGetPayload<{
        include: {
            licitacao: true;
            edital: {
                include: {
                    cronograma: true;
                    certame: true;
                    documents: true;
                    habilitacoes: true;
                    itensDetalhados: true;
                    orgaos: {
                        include: {
                            orgao: true;
                            itens: {
                                include: {
                                    editalItem: true;
                                };
                            };
                        };
                    };
                };
            };
            tasks: {
                include: {
                    createdBy: true;
                };
            };
            notes: {
                include: {
                    createdBy: true;
                };
            };
            itens: {
                include: {
                    editalItem: true;
                    companyItem: true;
                    pricing: true;
                    disputa: true;
                };
            };
        };
    }>;

    export type KnownOrgaoRecord = {
        id: string;
        cnpj: string;
        nome: string;
        codigoUnidade: string;
        nomeUnidade: string;
        municipio: string;
        uf: string;
        esfera: string;
        poder: string;
    };

    export type OportunidadeTaskRecord = Prisma.OportunidadeTaskGetPayload<{
        include: {
            createdBy: true;
        };
    }>;

    export type OportunidadeNoteRecord = Prisma.OportunidadeNoteGetPayload<{
        include: {
            createdBy: true;
        };
    }>;

    export type OportunidadeItemRecord = Prisma.OportunidadeItemGetPayload<{
        include: {
            editalItem: true;
            companyItem: true;
            pricing: true;
            disputa: true;
        };
    }>;

    export type OportunidadeBoardRecord = Prisma.OportunidadeGetPayload<{
        include: {
            licitacao: {
                include: {
                    orgaoGerenciador: true;
                };
            };
            edital: true;
            responsavel: true;
            currentNode: true;
            currentPhaseNode: true;
            currentStatusNode: true;
            currentSituationNode: true;
            tasks: {
                select: {
                    status: true;
                };
            };
            notes: {
                select: {
                    content: true;
                    createdAt: true;
                    createdBy: {
                        select: {
                            name: true;
                        };
                    };
                };
                orderBy: {
                    createdAt: "desc";
                };
                take: 1;
            };
            _count: {
                select: {
                    itens: true;
                    notes: true;
                };
            };
        };
    }>;

    export type FinalizeRegistrationItemSolicitadoData = {
        itemReferenceId: string | null;
        quantidadeSolicitada: number | null;
    };

    export type FinalizeRegistrationOrgaoData = {
        cnpj: string | null;
        razaoSocial: string | null;
        codigoUnidade: string | null;
        nomeUnidade: string | null;
        municipio: string | null;
        uf: string | null;
        esfera: "FEDERAL" | "ESTADUAL" | "MUNICIPAL" | null;
        poder: "EXECUTIVO" | "LEGISLATIVO" | "JUDICIARIO" | null;
        papel: EditalOrgaoPapel;
        itensSolicitados: FinalizeRegistrationItemSolicitadoData[];
    };

    export type FinalizeRegistrationLicitacaoData = {
        sourceSystem: LicitacaoSourceSystem | null;
        sourceReference: string | null;
        numeroLicitacao: string | null;
        anoCompra: number | null;
        processoAdministrativo: string | null;
        modalidadeNome: string | null;
        objetoResumo: string | null;
        situacaoOficial: string | null;
        valorEstimadoTotal: number | null;
        valorHomologadoTotal: number | null;
        dataPublicacao: Date | null;
        dataAberturaProposta: Date | null;
        dataEncerramentoProposta: Date | null;
        linkProcessoEletronico: string | null;
        ultimaAtualizacaoOficial: Date | null;
    };

    export type FinalizeRegistrationEditalData = {
        versao: number;
        isAtual: boolean;
        tipoVersao: EditalTipoVersao;
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
        modoDisputa: string | null;
        amparoLegal: string | null;
        srp: boolean;
        objeto: string | null;
        informacaoComplementar: string | null;
        dataAbertura: Date | null;
        dataEncerramento: Date | null;
        valorEstimado: number | null;
    };

    export type FinalizeRegistrationCronogramaData = {
        acolhimentoInicio: Date | null;
        acolhimentoFim: Date | null;
        horaLimite: string | null;
        sessaoPublicaEm: Date | null;
        esclarecimentosAte: Date | null;
        impugnacaoAte: Date | null;
    };

    export type FinalizeRegistrationCertameData = {
        modoDisputa: string | null;
        criterioJulgamento: string | null;
        tipoLance: string | null;
        intervaloLances: string | null;
        duracaoSessaoMinutos: number | null;
        exclusivoMeEpp: boolean | null;
        permiteConsorcio: boolean | null;
        exigeVisitaTecnica: boolean | null;
        permiteAdesao: boolean | null;
        percentualAdesao: number | null;
        regionalidade: string | null;
        difal: boolean | null;
        vigenciaAtaMeses: number | null;
        vigenciaContratoDias: number | null;
    };

    export type FinalizeRegistrationExecucaoData = {
        prazoEntregaDias: number | null;
        localEntrega: string | null;
        tipoEntrega: string | null;
        responsavelInstalacao: string | null;
        prazoPagamentoDias: number | null;
        prazoAceiteDias: number | null;
        validadePropostaDias: number | null;
        garantiaTipo: string | null;
        garantiaMeses: number | null;
        garantiaTempoAtendimentoHoras: number | null;
    };

    export type FinalizeRegistrationItemData = {
        referenceId: string;
        numeroItem: number | null;
        descricao: string | null;
        tipoItem: string | null;
        lote: string | null;
        quantidadeTotal: number | null;
        unidadeMedida: string | null;
        valorUnitarioEstimado: number | null;
        valorTotalEstimado: number | null;
        codigoCatmatCatser: string | null;
        codigoNcmNbs: string | null;
        criterioJulgamentoItem: string | null;
        beneficioTributario: string | null;
        observacao: string | null;
    };

    export type FinalizeRegistrationHabilitacaoData = {
        tipo: string | null;
        categoria: string | null;
        obrigatorio: boolean | null;
    };

    export type FinalizeRegistrationParams = {
        companyId: string;
        oportunidadeId?: string;
        responsavelUserId: string;
        createdById: string;
        workflowPlacement: {
            workflowDefinitionId: string;
            currentNodeId: string;
            currentPhaseNodeId: string | null;
            currentStatusNodeId: string | null;
            currentSituationNodeId: string | null;
        };
        formSnapshot: Record<string, unknown>;
        licitacao: FinalizeRegistrationLicitacaoData;
        edital: FinalizeRegistrationEditalData;
        orgaoGerenciador: FinalizeRegistrationOrgaoData | null;
        orgaosParticipantes: FinalizeRegistrationOrgaoData[];
        cronograma: FinalizeRegistrationCronogramaData;
        certame: FinalizeRegistrationCertameData;
        execucao: FinalizeRegistrationExecucaoData;
        itens: FinalizeRegistrationItemData[];
        habilitacoes: FinalizeRegistrationHabilitacaoData[];
    };

    export type FinalizeRegistrationResponse = {
        oportunidadeId: string;
        oportunidadeStatus: "ACTIVE";
        licitacaoId: string;
        licitacaoStatus: "COMPLETED";
        editalId: string;
        editalStatus: "COMPLETED";
    };
}
