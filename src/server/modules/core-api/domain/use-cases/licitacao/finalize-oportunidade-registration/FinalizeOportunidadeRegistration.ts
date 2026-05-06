/* eslint-disable @typescript-eslint/no-namespace */
import { EditalOrgaoPapel, EditalTipoVersao, LicitacaoSourceSystem, OrgaoEsfera, OrgaoPoder } from "@prisma/client";
import type { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import { assertUserCanAccessCompany } from "../../company/_shared/assertCompanyAccess";
import type {
    FinalizeOportunidadeRegistrationDTO,
    FinalizeOportunidadeRegistrationFormDTO,
    FinalizeOportunidadeRegistrationHabilitacaoDTO,
    FinalizeOportunidadeRegistrationItemDTO,
    FinalizeOportunidadeRegistrationOrgaoDTO,
} from "./dtos/FinalizeOportunidadeRegistrationDTOs";
import {
    FinalizeOportunidadeRegistrationMapper,
    type FinalizeOportunidadeRegistrationView,
} from "./dtos/FinalizeOportunidadeRegistrationView";

export class FinalizeOportunidadeRegistration {
    constructor(
        private readonly oportunidadeRepository: PrismaOportunidadeRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: FinalizeOportunidadeRegistration.Params): Promise<FinalizeOportunidadeRegistration.Response> {
        await assertUserCanAccessCompany({
            companyRepository: this.companyRepository,
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            companyId: params.companyId,
        });

        const normalized = this.normalizeForm(params.form);

        const result = await this.oportunidadeRepository.finalizeRegistration({
            companyId: params.companyId,
            oportunidadeId: params.oportunidadeId,
            responsavelUserId: params.createdById ?? params.userId,
            createdById: params.createdById ?? params.userId,
            formSnapshot: params.form as unknown as Record<string, unknown>,
            licitacao: {
                sourceSystem: params.oportunidadeId ? null : LicitacaoSourceSystem.MANUAL,
                sourceReference: normalized.identificadorExterno,
                numeroLicitacao: normalized.numeroLicitacao,
                anoCompra: normalized.ano,
                processoAdministrativo: normalized.processo,
                modalidadeNome: normalized.modalidade,
                objetoResumo: normalized.objeto,
                situacaoOficial: normalized.situacao,
                valorEstimadoTotal: normalized.valorTotalEstimado,
                valorHomologadoTotal: normalized.valorTotalHomologado,
                dataPublicacao: normalized.dataPublicacao,
                dataAberturaProposta: normalized.cronograma.acolhimentoInicio,
                dataEncerramentoProposta: normalized.cronograma.acolhimentoFim,
                linkProcessoEletronico: normalized.linkProcesso,
                ultimaAtualizacaoOficial: normalized.dataUltimaAtualizacao,
            },
            edital: {
                versao: 1,
                isAtual: true,
                tipoVersao: EditalTipoVersao.ORIGINAL,
                numero: normalized.numeroLicitacao,
                processo: normalized.processo,
                modalidade: normalized.modalidade,
                modoDisputa: normalized.certame.modoDisputa,
                amparoLegal: normalized.amparoLegal,
                srp: normalized.srp ?? false,
                objeto: normalized.objeto,
                informacaoComplementar: normalized.informacaoComplementar,
                dataAbertura: normalized.cronograma.sessaoPublicaEm ?? normalized.cronograma.acolhimentoInicio,
                dataEncerramento: normalized.cronograma.acolhimentoFim,
                valorEstimado: normalized.valorTotalEstimado,
                orgaoCnpj: normalized.orgaoGerenciador?.cnpj ?? null,
                orgaoRazaoSocial: normalized.orgaoGerenciador?.razaoSocial ?? null,
                orgaoEsfera: normalized.orgaoGerenciador?.esfera ?? null,
                orgaoPoder: normalized.orgaoGerenciador?.poder ?? null,
                unidadeCodigo: normalized.orgaoGerenciador?.codigoUnidade ?? null,
                unidadeNome: normalized.orgaoGerenciador?.nomeUnidade ?? null,
                municipio: normalized.orgaoGerenciador?.municipio ?? null,
                uf: normalized.orgaoGerenciador?.uf ?? null,
            },
            orgaoGerenciador: normalized.orgaoGerenciador
                ? {
                    ...normalized.orgaoGerenciador,
                    papel: EditalOrgaoPapel.GERENCIADOR,
                }
                : null,
            orgaosParticipantes: normalized.orgaosParticipantes.map(orgao => ({
                ...orgao,
                papel: EditalOrgaoPapel.PARTICIPANTE,
            })),
            cronograma: normalized.cronograma,
            certame: normalized.certame,
            execucao: normalized.execucao,
            itens: normalized.itens,
            habilitacoes: normalized.habilitacoes,
        });

        return FinalizeOportunidadeRegistrationMapper.toView(result);
    }

    private normalizeForm(form: FinalizeOportunidadeRegistrationFormDTO) {
        return {
            numeroLicitacao: this.toNullableString(form.numeroLicitacao),
            ano: this.toNullableInt(form.ano),
            processo: this.toNullableString(form.processo),
            modalidade: this.toNullableString(form.modalidade),
            objeto: this.toNullableString(form.objeto),
            valorTotalEstimado: this.toNullableDecimal(form.valorTotalEstimado),
            valorTotalHomologado: this.toNullableDecimal(form.valorTotalHomologado),
            srp: this.toNullableBoolean(form.srp),
            situacao: this.toNullableString(form.situacao),
            dataPublicacao: this.toNullableDate(form.dataPublicacao),
            dataUltimaAtualizacao: this.toNullableDate(form.dataUltimaAtualizacao),
            linkProcesso: this.toNullableString(form.linkProcesso),
            identificadorExterno: this.toNullableString(form.identificadorExterno),
            amparoLegal: this.toNullableString(form.edital.amparoLegal),
            informacaoComplementar: this.toNullableString(form.edital.informacaoComplementar),
            orgaoGerenciador: this.normalizeOrgao(form.orgaoGerenciador),
            orgaosParticipantes: form.edital.orgaosParticipantes
                .map(orgao => this.normalizeOrgao(orgao))
                .filter((orgao): orgao is NonNullable<typeof orgao> => orgao !== null),
            cronograma: {
                acolhimentoInicio: this.toNullableDate(form.edital.cronograma.acolhimentoInicio),
                acolhimentoFim: this.toNullableDate(form.edital.cronograma.acolhimentoFim),
                horaLimite: this.toNullableString(form.edital.cronograma.horaLimite),
                sessaoPublicaEm: this.toNullableDateTime(
                    form.edital.cronograma.sessaoPublica,
                    form.edital.cronograma.horaSessaoPublica,
                ),
                esclarecimentosAte: this.toNullableDate(form.edital.cronograma.esclarecimentosAte),
                impugnacaoAte: this.toNullableDate(form.edital.cronograma.impugnacaoAte),
            },
            certame: {
                modoDisputa: this.toNullableString(form.edital.certame.modoDisputa),
                criterioJulgamento: this.toNullableString(form.edital.certame.criterioJulgamento),
                tipoLance: this.toNullableString(form.edital.certame.tipoLance),
                intervaloLances: this.toNullableString(form.edital.certame.intervaloLances),
                duracaoSessaoMinutos: this.toNullableInt(form.edital.certame.duracaoSessaoMinutos),
                exclusivoMeEpp: this.toNullableBoolean(form.edital.certame.exclusivoMeEpp),
                permiteConsorcio: this.toNullableBoolean(form.edital.certame.permiteConsorcio),
                exigeVisitaTecnica: this.toNullableBoolean(form.edital.certame.exigeVisitaTecnica),
                regionalidade: this.toNullableString(form.edital.certame.regionalidade),
                permiteAdesao: this.toNullableBoolean(form.edital.certame.permiteAdesao),
                percentualAdesao: this.toNullableDecimal(form.edital.certame.percentualAdesao),
                vigenciaAtaMeses: this.toNullableInt(form.edital.certame.vigenciaAtaMeses),
                vigenciaContratoDias: this.toNullableInt(form.edital.certame.vigenciaContratoDias),
                difal: this.toNullableBoolean(form.edital.certame.difal),
            },
            execucao: {
                prazoEntregaDias: this.toNullableInt(form.edital.execucao.entrega.prazoEmDias),
                localEntrega: this.toNullableString(form.edital.execucao.entrega.localEntrega),
                tipoEntrega: this.toNullableString(form.edital.execucao.entrega.tipoEntrega),
                responsavelInstalacao: this.toNullableString(form.edital.execucao.entrega.responsavelInstalacao),
                prazoPagamentoDias: this.toNullableInt(form.edital.execucao.pagamento.prazoEmDias),
                prazoAceiteDias: this.toNullableInt(form.edital.execucao.aceite.prazoEmDias),
                validadePropostaDias: this.toNullableInt(form.edital.execucao.validadeProposta),
                garantiaTipo: this.toNullableString(form.edital.execucao.garantia.tipo),
                garantiaMeses: this.toNullableInt(form.edital.execucao.garantia.meses),
                garantiaTempoAtendimentoHoras: this.toNullableInt(form.edital.execucao.garantia.tempoAtendimentoHoras),
            },
            itens: form.edital.itens
                .map(item => this.normalizeItem(item))
                .filter((item): item is NonNullable<typeof item> => item !== null),
            habilitacoes: form.edital.habilitacao
                .map(item => this.normalizeHabilitacao(item))
                .filter((item): item is NonNullable<typeof item> => item !== null),
        };
    }

    private normalizeOrgao(input: FinalizeOportunidadeRegistrationOrgaoDTO) {
        const normalized = {
            cnpj: this.toNullableString(input.cnpj),
            razaoSocial: this.toNullableString(input.nome),
            codigoUnidade: this.toNullableString(input.codigoUnidade),
            nomeUnidade: this.toNullableString(input.nomeUnidade),
            municipio: this.toNullableString(input.municipio),
            uf: this.toNullableString(input.uf)?.toUpperCase() ?? null,
            esfera: this.toOrgaoEsfera(input.esfera),
            poder: this.toOrgaoPoder(input.poder),
            itensSolicitados: input.itensSolicitados
                .map(item => ({
                    itemReferenceId: this.toNullableString(item.itemId),
                    quantidadeSolicitada: this.toNullableDecimal(item.quantidade),
                }))
                .filter(item => item.itemReferenceId && item.quantidadeSolicitada !== null),
        };

        const hasMeaningfulData = Boolean(
            normalized.cnpj
            || normalized.razaoSocial
            || normalized.codigoUnidade
            || normalized.nomeUnidade
            || normalized.municipio
            || normalized.uf
            || normalized.esfera
            || normalized.poder
            || normalized.itensSolicitados.length > 0,
        );

        return hasMeaningfulData ? normalized : null;
    }

    private normalizeItem(item: FinalizeOportunidadeRegistrationItemDTO) {
        const normalized = {
            referenceId: item.itemId,
            numeroItem: this.toNullableInt(item.numero),
            descricao: this.toNullableString(item.descricao),
            tipoItem: this.toNullableString(item.tipo),
            lote: this.toNullableString(item.lote),
            quantidadeTotal: this.toNullableDecimal(item.quantidade),
            unidadeMedida: this.toNullableString(item.unidadeMedida),
            valorUnitarioEstimado: this.toNullableDecimal(item.valorUnitarioEstimado),
            valorTotalEstimado: this.toNullableDecimal(item.valorTotal),
            codigoNcmNbs: this.toNullableString(item.codigoNcmNbs),
            descricaoNcmNbs: this.toNullableString(item.descricaoNcmNbs),
            codigoCatmatCatser: this.toNullableString(item.codigoCatmatCatser),
            criterioJulgamentoItem: this.toNullableString(item.criterioJulgamento),
            beneficioTributario: this.toNullableString(item.beneficioTributario),
            observacao: this.toNullableString(item.observacao),
        };

        const hasMeaningfulData = Boolean(
            normalized.numeroItem !== null
            || normalized.descricao
            || normalized.tipoItem
            || normalized.lote
            || normalized.quantidadeTotal !== null
            || normalized.unidadeMedida
            || normalized.valorUnitarioEstimado !== null
            || normalized.valorTotalEstimado !== null
            || normalized.codigoNcmNbs
            || normalized.descricaoNcmNbs
            || normalized.codigoCatmatCatser
            || normalized.criterioJulgamentoItem
            || normalized.beneficioTributario
            || normalized.observacao,
        );

        return hasMeaningfulData ? normalized : null;
    }

    private normalizeHabilitacao(item: FinalizeOportunidadeRegistrationHabilitacaoDTO) {
        const tipo = this.toNullableString(item.tipo);
        const categoria = this.toNullableString(item.categoria);
        const obrigatorio = this.toNullableBoolean(item.obrigatorio);

        if (!tipo && !categoria && obrigatorio === null) {
            return null;
        }

        return {
            tipo,
            categoria,
            obrigatorio,
        };
    }

    private toNullableString(value: string | null | undefined) {
        const normalized = value?.trim();
        return normalized ? normalized : null;
    }

    private toNullableInt(value: string | number | null | undefined) {
        if (value === null || value === undefined || value === "") return null;
        const parsed = Number(value);
        if (!Number.isFinite(parsed)) return null;
        return Math.trunc(parsed);
    }

    private toNullableDecimal(value: string | number | null | undefined) {
        if (value === null || value === undefined || value === "") return null;
        const parsed = Number(String(value).replace(",", "."));
        return Number.isFinite(parsed) ? parsed : null;
    }

    private toNullableBoolean(value: string | boolean | null | undefined) {
        if (value === null || value === undefined || value === "") return null;
        if (value === true || value === "true") return true;
        if (value === false || value === "false") return false;
        return null;
    }

    private toNullableDate(value: string | null | undefined) {
        const normalized = this.toNullableString(value);
        if (!normalized) return null;
        const date = new Date(`${normalized}T00:00:00.000Z`);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    private toNullableDateTime(dateValue: string | null | undefined, timeValue: string | null | undefined) {
        const normalizedDate = this.toNullableString(dateValue);
        if (!normalizedDate) return null;

        const normalizedTime = this.toNullableString(timeValue) ?? "00:00";
        const isoLike = `${normalizedDate}T${normalizedTime.length === 5 ? normalizedTime : "00:00"}:00`;
        const date = new Date(isoLike);

        return Number.isNaN(date.getTime()) ? this.toNullableDate(normalizedDate) : date;
    }

    private toOrgaoEsfera(value: string | null | undefined) {
        switch (this.toNullableString(value)) {
            case "federal":
                return OrgaoEsfera.FEDERAL;
            case "estadual":
                return OrgaoEsfera.ESTADUAL;
            case "municipal":
                return OrgaoEsfera.MUNICIPAL;
            default:
                return null;
        }
    }

    private toOrgaoPoder(value: string | null | undefined) {
        switch (this.toNullableString(value)) {
            case "executivo":
                return OrgaoPoder.EXECUTIVO;
            case "legislativo":
                return OrgaoPoder.LEGISLATIVO;
            case "judiciario":
                return OrgaoPoder.JUDICIARIO;
            default:
                return null;
        }
    }
}

export namespace FinalizeOportunidadeRegistration {
    export type Params = FinalizeOportunidadeRegistrationDTO;
    export type Response = FinalizeOportunidadeRegistrationView;
}
