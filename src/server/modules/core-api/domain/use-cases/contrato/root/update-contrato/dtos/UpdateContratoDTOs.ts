export interface UpdateContratoDTO {
    companyId: string;
    contratoId: string;

    numeroContrato?: string | null;
    anoContrato?: number | null;
    processo?: string | null;
    tipoContrato?: string | null;
    objetoContrato?: string | null;

    dataAssinatura?: Date | null;
    dataVigenciaInicio?: Date | null;
    dataVigenciaFim?: Date | null;

    fornecedorCnpjCpf?: string | null;
    fornecedorNome?: string | null;

    valorInicial?: number | null;
    valorGlobal?: number | null;
    valorTotal?: number | null;
    status?: "RASCUNHO" | "VIGENTE" | "ENCERRADO" | "RESCINDIDO" | "CANCELADO";
}
