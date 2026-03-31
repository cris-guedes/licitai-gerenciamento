"use client"

import { Field, SectionTitle } from "../shared"

export function TabRequisitos({ d, sectionTitle = "Requisitos" }: { d: any; sectionTitle?: string }) {
  return (
    <div>
      <SectionTitle>{sectionTitle}</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Amparo Legal" value={d?.amparoLegalNome} />
        <Field label="Modo de Disputa" value={d?.modoDisputaNome} />
        <Field label="Tipo de Instrumento" value={d?.tipoInstrumentoNome} />
        <Field label="Registro de Preço" value={d?.srp != null ? (d.srp ? "Sim" : "Não") : null} />
      </div>
    </div>
  )
}
