import { AlignLeft, Briefcase, FileText, History, Package, ScrollText } from "lucide-react"

export const ESFERA_LABELS: Record<string, string> = {
  F: "Federal",
  E: "Estadual",
  M: "Municipal",
  D: "Distrital",
  N: "N/A",
}

export const PODER_LABELS: Record<string, string> = {
  E: "Executivo",
  L: "Legislativo",
  J: "Judiciário",
  N: "N/A",
}

export const MATERIAL_LABELS: Record<string, string> = {
  M: "Material",
  S: "Serviço",
}

export const TABS = [
  { id: "visao-geral", label: "Visão Geral", icon: AlignLeft },
  { id: "itens", label: "Itens", icon: Package },
  { id: "documentos", label: "Documentos", icon: FileText },
  { id: "historico", label: "Histórico", icon: History },
  { id: "contratos", label: "Contratos", icon: Briefcase },
  { id: "atas", label: "Atas", icon: ScrollText },
] as const

export type TabId = (typeof TABS)[number]["id"]
