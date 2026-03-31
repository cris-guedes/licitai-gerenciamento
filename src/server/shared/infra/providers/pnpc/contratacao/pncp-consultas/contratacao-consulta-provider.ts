import { PncpPortalClient } from "@/server/shared/lib/pncp-consultas"

const client = new PncpPortalClient()

export class ContratacaoConsultaProvider {
  static consultarCompra({ cnpj, ano, sequencial }: { cnpj: string; ano: number; sequencial: number }) {
    return client.contrataO.consultarCompra({ cnpj, ano, sequencial })
  }
}
