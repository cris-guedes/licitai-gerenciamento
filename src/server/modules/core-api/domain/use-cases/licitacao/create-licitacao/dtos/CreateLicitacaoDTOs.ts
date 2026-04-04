export type CreateLicitacaoDTO = {
    orgId: string;
    companyId: string;

    // ── Dados da licitação ──────────────────────────────────
    object: string;
    modality: string;
    contractType?: string | null;
    estimatedValue?: number | null;
    editalNumber?: string | null;
    portal?: string | null;
    sphere?: string | null;
    state?: string | null;
    editalUrl?: string | null;
    publicationDate?: Date | null;
    openingDate?: Date | null;
    proposalDeadline?: Date | null;

    // ── Detalhes do pregão ──────────────────────────────────
    processNumber?: string | null;
    uasg?: string | null;
    proposalDeadlineTime?: string | null;
    bidInterval?: number | null;
    judgmentCriteria?: string | null;
    disputeMode?: string | null;
    proposalValidityDays?: number | null;
    clarificationDeadline?: Date | null;
    regionality?: string | null;
    exclusiveSmallBusiness?: boolean;
    allowsAdhesion?: boolean;

    // ── Regras do edital ────────────────────────────────────
    rules?: {
        deliveryDays?: number | null;
        acceptanceDays?: number | null;
        liquidationDays?: number | null;
        paymentDays?: number | null;
        guaranteeType?: string | null;
        guaranteeMonths?: number | null;
        installation?: string | null;
    } | null;

    // ── Processo e logística ────────────────────────────────
    logistics?: {
        agencyCnpj?: string | null;
        agencyStateRegistration?: string | null;
        deliveryLocation?: string | null;
        zipCode?: string | null;
        street?: string | null;
        number?: string | null;
        neighborhood?: string | null;
        city?: string | null;
        state?: string | null;
        complement?: string | null;
        auctioneerName?: string | null;
        auctioneerContact?: string | null;
        contractManagerName?: string | null;
        contractManagerContact?: string | null;
        notes?: string | null;
    } | null;

    // ── Documentos necessários ──────────────────────────────
    requiredDocuments?: string[];

    // ── Órgãos ─────────────────────────────────────────────
    managingAgencies?: { name: string; cnpj?: string | null }[];
    participatingAgencies?: { name: string; cnpj?: string | null }[];
};
