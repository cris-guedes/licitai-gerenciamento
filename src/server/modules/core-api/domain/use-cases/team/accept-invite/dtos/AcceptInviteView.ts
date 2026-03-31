export type AcceptInviteView = {
    email: string;
};

export class AcceptInviteMapper {
    static toView(email: string): AcceptInviteView {
        return { email };
    }
}
