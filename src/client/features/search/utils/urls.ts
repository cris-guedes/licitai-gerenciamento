/** Ensures a URL is absolute. If it has no protocol, prepend https://. */
export function toAbsoluteUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url
  if (url.startsWith("/")) return `https://pncp.gov.br${url}`
  return `https://${url}`
}

/**
 * Constructs the correct PNCP portal URL for an edital/contratação direta.
 * The `item_url` returned by the search API uses `/compras/` which is invalid.
 * Correct format: https://pncp.gov.br/app/editais/{cnpj}/{ano}/{numero_sequencial}
 */
export function buildPncpUrl(item: {
  orgao_cnpj?: string
  ano?: string
  numero_sequencial?: string
  document_type?: string
}): string | null {
  const { orgao_cnpj, ano, numero_sequencial, document_type } = item
  if (!orgao_cnpj || !ano || !numero_sequencial) return null
  const section =
    document_type === "dispensa" || document_type === "inexigibilidade"
      ? "contratacoes-diretas"
      : "editais"
  return `https://pncp.gov.br/app/${section}/${orgao_cnpj}/${ano}/${numero_sequencial}`
}

/**
 * PNCP URL for a specific contract/empenho.
 * Format: https://pncp.gov.br/app/contratos/{cnpj}/{anoContrato}/{sequencialContrato}
 */
export function buildContractPncpUrl(
  cnpj: string | undefined,
  anoContrato: number | undefined,
  sequencialContrato: number | undefined,
): string | null {
  if (!cnpj || !anoContrato || !sequencialContrato) return null
  return `https://pncp.gov.br/app/contratos/${cnpj}/${anoContrato}/${sequencialContrato}`
}

/**
 * cnpj.biz URL to look up a company by CNPJ.
 * Only works for CNPJ (14 digits); returns null for CPF or missing values.
 */
export function buildCnpjBizUrl(cnpjOuCpf: string | undefined): string | null {
  if (!cnpjOuCpf) return null
  const digits = cnpjOuCpf.replace(/\D/g, "")
  if (digits.length !== 14) return null
  return `https://cnpj.biz/${digits}`
}

/**
 * PNCP URL for a specific ata de registro de preço.
 * Format: https://pncp.gov.br/app/atas/{cnpj}/{anoCompra}/{sequencialCompra}/{sequencialAta}
 */
export function buildAtaPncpUrl(
  cnpj: string | undefined,
  anoCompra: number | undefined,
  sequencialCompra: number | undefined,
  sequencialAta: number | undefined,
): string | null {
  if (!cnpj || !anoCompra || !sequencialCompra || !sequencialAta) return null
  return `https://pncp.gov.br/app/atas/${cnpj}/${anoCompra}/${sequencialCompra}/${sequencialAta}`
}

/**
 * Portal da Transparência URL to query sanctions for a given CNPJ/CPF.
 * Only digits are used (strips formatting).
 */
export function buildSancoesUrl(cnpjOuCpf: string | undefined): string | null {
  if (!cnpjOuCpf) return null
  const digits = cnpjOuCpf.replace(/\D/g, "")
  if (!digits) return null
  return `https://portaldatransparencia.gov.br/sancoes/consulta?cadastro=1&cadastro=2&cpfCnpj=${digits}&ordenarPor=nomeSancionado&direcao=asc`
}
