export type ListMemberView = {
    membershipId: string;
    userId:       string;
    name:         string;
    email:        string;
    role:         string;
    createdAt:    Date;
};

export type ListMembersView = {
    members: ListMemberView[];
};

export class ListMembersMapper {
    static toView(members: Array<{
        id:        string;
        role:      string;
        userId:    string;
        createdAt: Date;
        user:      { id: string; name: string; email: string };
    }>): ListMembersView {
        return {
            members: members.map((m) => ({
                membershipId: m.id,
                userId:       m.userId,
                name:         m.user.name,
                email:        m.user.email,
                role:         m.role,
                createdAt:    m.createdAt,
            })),
        };
    }
}
