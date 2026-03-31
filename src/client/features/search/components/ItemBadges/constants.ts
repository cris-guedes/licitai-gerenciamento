"use client"

export const SITUACAO_ITEM_CONFIG: Record<number, { bg: string; tooltip: string }> = {
  1: { bg: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", tooltip: "O item está em processo de análise ou aguardando resultado." },
  2: { bg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", tooltip: "O item foi homologado ou adjudicado ao fornecedor vencedor." },
  3: { bg: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400", tooltip: "O item foi cancelado ou anulado pela administração." },
  4: { bg: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", tooltip: "Nenhum fornecedor apresentou proposta válida para este item." },
  5: { bg: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", tooltip: "O item está com o processo temporariamente suspenso." },
}

export const SITUACAO_RESULTADO_TOOLTIP: Record<string, string> = {
  Informado: "Resultado registrado pelo órgão, aguardando homologação formal.",
  Homologado: "Resultado homologado pelo órgão — fornecedor vencedor confirmado.",
  Anulado: "O resultado foi anulado, sem fornecedor vencedor para este item.",
  Cancelado: "O resultado foi cancelado pelo órgão.",
  Deserto: "Nenhum fornecedor apresentou proposta válida para este item.",
  Fracassado: "As propostas recebidas não atenderam aos requisitos do edital.",
}

export const PORTE_TOOLTIP: Record<string, string> = {
  "ME/EPP": "Microempresa ou Empresa de Pequeno Porte — pode ter benefícios de preferência em licitações.",
  Microempresa: "Empresa com receita bruta anual de até R$ 360 mil.",
  "Pequeno Porte": "Empresa com receita bruta anual entre R$ 360 mil e R$ 4,8 milhões.",
  Demais: "Empresa que não se enquadra como ME/EPP. Sem tratamento diferenciado.",
  Cooperativa: "Cooperativa de trabalho — pode ter tratamento diferenciado conforme edital.",
  "Consórcio": "Grupo de empresas que se unem temporariamente para participar da licitação.",
}
