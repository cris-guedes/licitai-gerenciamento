import { ModalidadeService } from "@/server/shared/lib/pncp";
import type { MethodKeys, ServiceParams, ServiceResponse } from "@/server/shared/infra/types";

export class ModalidadeProvider extends ModalidadeService { }

export namespace ModalidadeProvider {
    export type Params<M extends MethodKeys<typeof ModalidadeService>> = ServiceParams<typeof ModalidadeService, M>;
    export type Response<M extends MethodKeys<typeof ModalidadeService>> = ServiceResponse<typeof ModalidadeService, M>;
}
