import { Contrato } from "@/server/modules/core-api/domain/entities";
import { ContratoMapper, type ContratoView } from "../../create-contrato/dtos/CreateContratoView";

export type ListContratosView = {
    data: ContratoView[];
    totalRegistros: number;
};

export class ListContratosMapper {
    static toView(data: Contrato[]): ListContratosView {
        return {
            data: data.map(contrato => ContratoMapper.toView(contrato)),
            totalRegistros: data.length,
        };
    }
}
