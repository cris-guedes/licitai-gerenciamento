export interface UpdateOportunidadeDetailsDTO {
    companyId: string;
    oportunidadeId: string;
    numero?: string | null;
    processo?: string | null;
    modalidade?: string | null;
    orgaoNome?: string | null;
    objetoResumo?: string | null;
    valorEstimado?: string | number | null;
    dataAbertura?: string | null;
    dataEncerramento?: string | null;
    userId: string;
}
