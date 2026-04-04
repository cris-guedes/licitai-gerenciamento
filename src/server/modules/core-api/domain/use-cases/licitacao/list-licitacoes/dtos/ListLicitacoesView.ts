import type { PrismaEditalRepository } from "@/server/shared/infra/repositories/edital.repository";

export type LicitacaoListItemView = PrismaEditalRepository.LicitacaoListItem;

export type ListLicitacoesView = {
    licitacoes: LicitacaoListItemView[];
};

export class ListLicitacoesMapper {
    static toView(items: PrismaEditalRepository.LicitacaoListItem[]): ListLicitacoesView {
        return { licitacoes: items };
    }
}
