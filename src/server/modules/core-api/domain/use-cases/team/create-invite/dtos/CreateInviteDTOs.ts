export type CreateInviteDTO = {
    email:          string;
    role:           "ADMIN" | "MEMBER";
    organizationId: string;
    companyId:      string;
    createdById:    string;
};
