export interface CreateLocalEntregaDTO {
    companyId: string;
    contratoId: string;
    empenhoId: string;
    
    orgaoNome?: string | null;
    logradouro: string;
    numero?: string | null;
    complemento?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    estado?: string | null;
    cep?: string | null;
    
    contatoNome?: string | null;
    contatoTelefone?: string | null;
    contatoEmail?: string | null;
    observacoes?: string | null;
}
