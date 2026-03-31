export type GetInviteView = {
    orgName:     string;
    companyName: string;
    email:       string;
    role:        string;
    expiresAt:   Date;
};

export class GetInviteMapper {
    static toView(data: {
        organization: { name: string };
        company:      { razao_social: string; nome_fantasia: string | null };
        email:        string;
        role:         string;
        expiresAt:    Date;
    }): GetInviteView {
        return {
            orgName:     data.organization.name,
            companyName: data.company.nome_fantasia ?? data.company.razao_social,
            email:       data.email,
            role:        data.role,
            expiresAt:   data.expiresAt,
        };
    }
}
