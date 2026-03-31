import { DefaultService } from "@/server/shared/lib/pncp-historico"

export class ContratacaoHistoricoProvider {
  static consultarHistorico({ cnpj, ano, sequencial }: { cnpj: string; ano: number; sequencial: number }) {
    return DefaultService.consultarHistoricoCompra({ cnpj, ano, sequencial })
  }
}
