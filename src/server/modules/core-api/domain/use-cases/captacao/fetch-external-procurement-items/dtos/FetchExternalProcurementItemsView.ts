export type FetchExternalProcurementItemsView = {
    items: any[]
    total: number
}

export class FetchExternalProcurementItemsMapper {
    static toView(data: any[], total: number): FetchExternalProcurementItemsView {
        return {
            items: data,
            total,
        }
    }
}
