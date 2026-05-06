export type FinalizeOportunidadeRegistrationView = {
    oportunidadeId: string;
    oportunidadeStatus: "ACTIVE";
    licitacaoId: string;
    licitacaoStatus: "COMPLETED";
    editalId: string;
    editalStatus: "COMPLETED";
};

export class FinalizeOportunidadeRegistrationMapper {
    static toView(params: FinalizeOportunidadeRegistrationView): FinalizeOportunidadeRegistrationView {
        return params;
    }
}
