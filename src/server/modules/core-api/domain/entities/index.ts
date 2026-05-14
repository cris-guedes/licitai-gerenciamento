/**
 * Barrel de exportação das entidades de domínio.
 *
 * Importe a partir daqui para evitar caminhos relativos longos:
 *
 * @example
 * import type { Licitacao, Edital, ItemLicitado } from "@/server/modules/core-api/domain/entities";
 */

// ─── Aggregate root ───────────────────────────────────────────────────────────
export type { Licitacao, SituacaoLicitacao } from "./Licitacao";
export type { Oportunidade, OportunidadeStatus } from "./Oportunidade";
export type { OportunidadeItem } from "./OportunidadeItem";

// ─── Documento do processo ────────────────────────────────────────────────────
export type { Edital }              from "./Edital";
export type {
    EditalAnalysis,
    EditalAnalysisType,
    EditalAnalysisStatus,
}                                    from "./EditalAnalysis";

// ─── Partes do edital ─────────────────────────────────────────────────────────
export type { OrgaoPublico }        from "./OrgaoPublico";
export type { ItemLicitado }        from "./ItemLicitado";
export type { CronogramaLicitacao } from "./CronogramaLicitacao";
export type { RegrasCertame }       from "./RegrasCertame";
export type {
    ExecucaoContratual,
    EntregaContratual,
    PrazoContratual,
    GarantiaContratual,
}                                   from "./ExecucaoContratual";
export type { DocumentoHabilitacao } from "./DocumentoHabilitacao";

// ─── Execução e Contratos ─────────────────────────────────────────────────────
export type { Contrato, ContratoStatus } from "./Contrato";
export type { ContratoItem } from "./ContratoItem";
export type { ContratoEmpenho, ContratoEmpenhoStatus } from "./ContratoEmpenho";
export type { EmpenhoItem } from "./EmpenhoItem";
export type { EmpenhoLocalEntrega } from "./EmpenhoLocalEntrega";
export type { EmpenhoEntrega, EmpenhoEntregaStatus } from "./EmpenhoEntrega";
