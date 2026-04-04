export interface EditalExtraction {
    editalNumber:           string | null;
    portal:                 string | null;
    sphere:                 string | null;
    state:                  string | null;
    object:                 string | null;
    modality:               string | null;
    contractType:           string | null;
    editalUrl:              string | null;
    estimatedValue:         number | null;
    publicationDate:        string | null;
    openingDate:            string | null;
    proposalDeadline:       string | null;
    processNumber:          string | null;
    uasg:                   string | null;
    proposalDeadlineTime:   string | null;
    bidInterval:            number | null;
    judgmentCriteria:       string | null;
    disputeMode:            string | null;
    proposalValidityDays:   number | null;
    clarificationDeadline:  string | null;
    regionality:            string | null;
    exclusiveSmallBusiness: boolean | null;
    allowsAdhesion:         boolean | null;
    extractedRules: {
        deliveryDays:     number | null;
        acceptanceDays:   number | null;
        liquidationDays:  number | null;
        paymentDays:      number | null;
        guaranteeType:    string | null;
        guaranteeMonths:  number | null;
        installation:     boolean | null;
    } | null;
    extractedRequiredDocuments:    string[];
    extractedManagingAgencies:     { name: string; cnpj: string | null }[];
    extractedParticipatingAgencies: { name: string; cnpj: string | null }[];
}

export interface AiProvider {
    extractEdital(text: string): Promise<EditalExtraction>;
    summarizeDocument(text: string): Promise<string>;
}
