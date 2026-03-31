export type CreateMemberDTO = {
    name:           string;
    email:          string;
    password:       string;
    role:           "ADMIN" | "MEMBER";
    organizationId: string;
    companyId:      string;
};
