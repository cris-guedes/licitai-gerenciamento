import { FonteOrAmentRiaService } from "@/server/shared/lib/pncp";
import type { MethodKeys, ServiceParams, ServiceResponse } from "@/server/shared/infra/types";

export class FonteOrAmentRiaProvider extends FonteOrAmentRiaService { }

export namespace FonteOrAmentRiaProvider {
    export type Params<M extends MethodKeys<typeof FonteOrAmentRiaService>> = ServiceParams<typeof FonteOrAmentRiaService, M>;
    export type Response<M extends MethodKeys<typeof FonteOrAmentRiaService>> = ServiceResponse<typeof FonteOrAmentRiaService, M>;
}
