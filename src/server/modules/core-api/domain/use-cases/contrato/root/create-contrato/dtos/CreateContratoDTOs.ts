export interface CreateContratoDTO {
    companyId: string;
    oportunidadeId: string;
    
    numeroContrato?: string;
    anoContrato?: number;
    processo?: string;
    tipoContrato?: string;
    objetoContrato?: string;

    dataAssinatura?: Date;
    dataVigenciaInicio?: Date;
    dataVigenciaFim?: Date;

    fornecedorCnpjCpf?: string;
    fornecedorNome?: string;

    valorInicial?: number;
    valorGlobal?: number;
    valorTotal?: number;
    status?: "RASCUNHO" | "VIGENTE" | "ENCERRADO" | "RESCINDIDO" | "CANCELADO";

    itens: Array<{
        oportunidadeItemId: string;
        quantidadeContratada?: number;
        valorUnitario?: number;
        valorTotal?: number;
    }>;
}
