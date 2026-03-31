/**
 * Formata um valor numérico como moeda BRL.
 * @example formatCurrency(1500) → "R$ 1.500,00"
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

/**
 * Formata uma data ISO para o padrão brasileiro.
 * @example formatDate("2024-03-01") → "01/03/2024"
 */
export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("pt-BR")
}

/**
 * Aplica máscara de CNPJ.
 * @example maskCnpj("12345678000195") → "12.345.678/0001-95"
 */
export function maskCnpj(cnpj: string): string {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")
}
