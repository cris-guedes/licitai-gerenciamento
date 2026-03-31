import { CategoriaDeItemService } from "@/server/shared/lib/pncp";
import type { MethodKeys, ServiceParams, ServiceResponse } from "@/server/shared/infra/types";

export class CategoriaDeItemProvider extends CategoriaDeItemService { }

export namespace CategoriaDeItemProvider {
    export type Params<M extends MethodKeys<typeof CategoriaDeItemService>> = ServiceParams<typeof CategoriaDeItemService, M>;
    export type Response<M extends MethodKeys<typeof CategoriaDeItemService>> = ServiceResponse<typeof CategoriaDeItemService, M>;
}
