"use client"

const CRITERIO_TOOLTIP: Record<string, string> = {
  "menor preço": "Vence o fornecedor com o menor preço ofertado.",
  "menor preco": "Vence o fornecedor com o menor preço ofertado.",
  "maior desconto": "Vence o fornecedor com o maior desconto sobre o preço de referência do edital.",
  "técnica e preço": "A proposta vencedora considera qualidade técnica e preço em conjunto.",
  "tecnica e preco": "A proposta vencedora considera qualidade técnica e preço em conjunto.",
  "melhor técnica": "Vence a proposta com maior qualidade técnica; o preço é fixado pelo edital.",
  "melhor tecnica": "Vence a proposta com maior qualidade técnica; o preço é fixado pelo edital.",
  "maior lance": "Utilizado em leilões — vence o fornecedor com o maior lance.",
}

const BENEFICIO_TOOLTIP: Record<string, string> = {
  exclusivo: "Item destinado exclusivamente a Microempresas e Empresas de Pequeno Porte (ME/EPP).",
  "cota reservada": "Parcela do item reservada exclusivamente para Microempresas e Empresas de Pequeno Porte (ME/EPP).",
}

export function getCriterioBadgeClass(nome?: string): string {
  if (!nome) return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"

  const normalized = nome.toLowerCase()
  if (normalized.includes("menor preço") || normalized.includes("menor preco")) return "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
  if (normalized.includes("maior desconto")) return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400"
  if (normalized.includes("técnica e preço") || normalized.includes("tecnica e preco")) return "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
  if (normalized.includes("melhor técnica") || normalized.includes("melhor tecnica")) return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
  if (normalized.includes("maior lance")) return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
  return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
}

export function getCriterioTooltip(nome: string): string {
  const normalized = nome.toLowerCase()
  for (const [key, tip] of Object.entries(CRITERIO_TOOLTIP)) {
    if (normalized.includes(key)) return tip
  }
  return "Critério utilizado para classificar e selecionar a proposta vencedora."
}

export function getBeneficioBadgeClass(nome?: string): string {
  if (!nome) return "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
  return nome.toLowerCase().includes("exclusivo")
    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
    : "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
}

export function getBeneficioTooltip(nome: string): string {
  const normalized = nome.toLowerCase()
  for (const [key, tip] of Object.entries(BENEFICIO_TOOLTIP)) {
    if (normalized.includes(key)) return tip
  }
  return "Benefício aplicável a Microempresas e Empresas de Pequeno Porte (ME/EPP)."
}

export function isNaoSeAplica(nome?: string): boolean {
  if (!nome) return false
  const normalized = nome.toLowerCase()
  return normalized.includes("não se aplica") || normalized.includes("nao se aplica") || normalized.includes("sem benefício") || normalized.includes("sem beneficio")
}
