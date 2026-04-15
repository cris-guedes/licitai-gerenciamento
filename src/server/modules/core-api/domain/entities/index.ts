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

// ─── Documento do processo ────────────────────────────────────────────────────
export type { Edital }              from "./Edital";

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
