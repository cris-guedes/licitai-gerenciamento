
import type { MethodKeys, ServiceParams, ServiceResponse } from "@/server/shared/infra/types";
import { DefaultService } from "@/server/shared/lib/pncp-search";

export class PncpSearchProvider extends DefaultService { }

export namespace PncpSearchProvider {
    export type Params<M extends MethodKeys<typeof DefaultService>> = ServiceParams<typeof DefaultService, M>;
    export type Response<M extends MethodKeys<typeof DefaultService>> = ServiceResponse<typeof DefaultService, M>;
}
