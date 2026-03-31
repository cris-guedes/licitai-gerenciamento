export type RemoveMemberView = {
    success: true;
};

export class RemoveMemberMapper {
    static toView(): RemoveMemberView {
        return { success: true };
    }
}
