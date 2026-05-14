import { EmpenhoEntregaStatus } from "@prisma/client";

export interface UpdateEntregaStatusDTO {
    companyId: string;
    contratoId: string;
    empenhoId: string;
    entregaId: string;
    
    status: EmpenhoEntregaStatus;
    dataEntrega?: Date | null;
    observacoes?: string | null;
}
