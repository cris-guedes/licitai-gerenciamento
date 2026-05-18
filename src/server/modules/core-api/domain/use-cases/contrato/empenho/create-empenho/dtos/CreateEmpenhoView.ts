import { ContratoEmpenho } from "@/server/modules/core-api/domain/entities";

export type CreateEmpenhoView = ContratoEmpenho;

export class CreateEmpenhoMapper {
    static toView(data: ContratoEmpenho): CreateEmpenhoView {
        return data;
    }
}
