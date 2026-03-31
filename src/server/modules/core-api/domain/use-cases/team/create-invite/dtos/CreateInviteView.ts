export type CreateInviteView = {
    inviteUrl: string;
};

export class CreateInviteMapper {
    static toView(inviteUrl: string): CreateInviteView {
        return { inviteUrl };
    }
}
