export type UpdateMemberRoleView = {
    membershipId: string;
    role:         string;
};

export class UpdateMemberRoleMapper {
    static toView(data: { id: string; role: string }): UpdateMemberRoleView {
        return {
            membershipId: data.id,
            role:         data.role,
        };
    }
}
