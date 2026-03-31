
import { AmparoLegalService } from "@/server/shared/lib/pncp";
import type { MethodKeys, ServiceParams, ServiceResponse } from "@/server/shared/infra/types";

export class AmparoLegalProvider extends AmparoLegalService { }

export namespace AmparoLegalProvider {
    export type Params<M extends MethodKeys<typeof AmparoLegalService>> = ServiceParams<typeof AmparoLegalService, M>;
    export type Response<M extends MethodKeys<typeof AmparoLegalService>> = ServiceResponse<typeof AmparoLegalService, M>;
}
