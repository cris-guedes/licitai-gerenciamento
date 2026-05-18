import { ContratoEmpenho } from "@/server/modules/core-api/domain/entities";

export type ListEmpenhosView = {
    data: ContratoEmpenho[];
    totalRegistros: number;
};

export class ListEmpenhosMapper {
    static toView(data: ContratoEmpenho[]): ListEmpenhosView {
        return {
            data,
            totalRegistros: data.length,
        };
    }
}
