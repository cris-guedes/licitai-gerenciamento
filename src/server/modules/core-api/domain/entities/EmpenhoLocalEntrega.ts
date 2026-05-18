export type EmpenhoLocalEntrega = {
    id: string;
    empenhoId: string;

    descricao: string | null;
    endereco: string | null;
    municipio: string | null;
    uf: string | null;
    responsavel: string | null;
    telefone: string | null;

    createdAt: Date;
    updatedAt: Date;
};
