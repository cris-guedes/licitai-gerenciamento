export type CreateMemberView = {
    membershipId: string;
};

export class CreateMemberMapper {
    static toView(membershipId: string): CreateMemberView {
        return { membershipId };
    }
}
