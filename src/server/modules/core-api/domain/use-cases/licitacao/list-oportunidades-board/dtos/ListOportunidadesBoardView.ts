import type { OportunidadeBoardItemView } from "../../_shared/oportunidadeBoardView";

export type ListOportunidadesBoardView = {
    items: OportunidadeBoardItemView[];
    total: number;
    columnSummaries: Array<{
        phaseNodeId: string;
        itemCount: number;
        valorEstimadoTotal: string;
    }>;
    filterOptions: {
        responsaveis: Array<{
            id: string;
            name: string;
            email: string;
        }>;
        situations: Array<{
            id: string;
            label: string;
        }>;
        valueRange: {
            min: string | null;
            max: string | null;
        };
    };
};
