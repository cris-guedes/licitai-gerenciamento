import { CatLogoService } from "@/server/shared/lib/pncp";
import type { MethodKeys, ServiceParams, ServiceResponse } from "@/server/shared/infra/types";

export class CatLogoProvider extends CatLogoService { }

export namespace CatLogoProvider {
    export type Params<M extends MethodKeys<typeof CatLogoService>> = ServiceParams<typeof CatLogoService, M>;
    export type Response<M extends MethodKeys<typeof CatLogoService>> = ServiceResponse<typeof CatLogoService, M>;
}
