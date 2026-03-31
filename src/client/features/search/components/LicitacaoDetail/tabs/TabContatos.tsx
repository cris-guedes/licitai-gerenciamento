"use client"

import type { LicitacaoItem } from "@/client/main/infra/apis/api-core/models/LicitacaoItem"
import { ESFERA_LABELS, PODER_LABELS } from "../constants"
import { Field, SectionTitle } from "../shared"

type Props = {
  d: any
  item: LicitacaoItem
}

export function TabContatos({ d, item }: Props) {
  const orgaoNome = d?.orgaoRazaoSocial ?? item.orgao_nome
  const municipioNome = d?.municipioNome ?? item.municipio_nome
  const uf = d?.uf ?? item.uf
  const esfera = d?.orgaoEsferaId
    ? (ESFERA_LABELS[d.orgaoEsferaId] ?? d.orgaoEsferaId)
    : item.esfera_id
      ? (ESFERA_LABELS[item.esfera_id] ?? item.esfera_id)
      : null
  const poder = d?.orgaoPoderI
    ? (PODER_LABELS[d.orgaoPoderI] ?? d.orgaoPoderI)
    : item.poder_id
      ? (PODER_LABELS[item.poder_id] ?? item.poder_id)
      : null

  return (
    <div>
      <SectionTitle>Contatos</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Órgão" value={orgaoNome} />
        <Field label="CNPJ" value={d?.orgaoCnpj ?? item.orgao_cnpj} />
        <Field
          label="Unidade Compradora"
          value={d?.unidadeNome ? `${d.unidadeCodigo ? `${d.unidadeCodigo} — ` : ""}${d.unidadeNome}` : item.unidade_nome ?? null}
        />
        <Field label="Município / UF" value={[municipioNome, uf].filter(Boolean).join(" / ") || null} />
        <Field label="Esfera" value={esfera} />
        <Field label="Poder" value={poder} />
      </div>
    </div>
  )
}
