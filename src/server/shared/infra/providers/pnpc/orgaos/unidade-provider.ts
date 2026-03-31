import { UnidadeService } from "@/server/shared/lib/pncp";
import type { MethodKeys, ServiceParams, ServiceResponse } from "@/server/shared/infra/types";

export class UnidadeProvider extends UnidadeService { }

export namespace UnidadeProvider {
    export type Params<M extends MethodKeys<typeof UnidadeService>> = ServiceParams<typeof UnidadeService, M>;
    export type Response<M extends MethodKeys<typeof UnidadeService>> = ServiceResponse<typeof UnidadeService, M>;
}
