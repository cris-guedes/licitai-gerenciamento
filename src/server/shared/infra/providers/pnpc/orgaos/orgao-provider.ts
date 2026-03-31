import { RgOService } from "@/server/shared/lib/pncp";
import type { MethodKeys, ServiceParams, ServiceResponse } from "@/server/shared/infra/types";

export class OrgaoProvider extends RgOService { }

export namespace OrgaoProvider {
    export type Params<M extends MethodKeys<typeof RgOService>> = ServiceParams<typeof RgOService, M>;
    export type Response<M extends MethodKeys<typeof RgOService>> = ServiceResponse<typeof RgOService, M>;
}
