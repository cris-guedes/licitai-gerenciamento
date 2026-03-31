"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import type { CompanyProfile } from "@/client/main/infra/apis/api-core/models/CompanyProfile"
import { Button } from "@/client/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/client/components/ui/dialog"
import { CompanyFormFields } from "../CompanyFormFields"
import { companyProfileFormSchema, type CompanyProfileFormValues } from "../../../schemas/company-profile.schema"

type Props = {
  open: boolean
  company: CompanyProfile | null
  isPending: boolean
  onClose: () => void
  onSubmit: (values: CompanyProfileFormValues) => void
}

function toFormValues(company: CompanyProfile | null): CompanyProfileFormValues {
  return {
    cnpj: company?.cnpj ?? "",
    razao_social: company?.razao_social ?? "",
    nome_fantasia: company?.nome_fantasia ?? "",
    email_empresa: company?.email_empresa ?? "",
    telefone_1: company?.telefone_1 ?? "",
    situacao_cadastral: company?.situacao_cadastral ?? "",
    data_situacao_cadastral: company?.data_situacao_cadastral ?? "",
    data_abertura: company?.data_abertura ?? "",
    porte: company?.porte ?? "",
    natureza_juridica: company?.natureza_juridica ?? "",
    cnae_fiscal_descricao: company?.cnae_fiscal_descricao ?? "",
    logradouro: company?.logradouro ?? "",
    numero: company?.numero ?? "",
    complemento: company?.complemento ?? "",
    bairro: company?.bairro ?? "",
    municipio: company?.municipio ?? "",
    uf: company?.uf ?? "",
    cep: company?.cep ?? "",
    capital_social: company?.capital_social != null ? String(company.capital_social) : "",
  }
}

export function CompanyEditDialog({ open, company, isPending, onClose, onSubmit }: Props) {
  const form = useForm<CompanyProfileFormValues>({
    resolver: zodResolver(companyProfileFormSchema),
    defaultValues: toFormValues(company),
  })

  useEffect(() => {
    form.reset(toFormValues(company))
  }, [company, form])

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Editar empresa</DialogTitle>
          <DialogDescription>
            Atualize os dados cadastrais de {company?.nome_fantasia ?? company?.razao_social ?? "esta empresa"}.
          </DialogDescription>
        </DialogHeader>

        <form
          id="edit-company-form"
          className="max-h-[65vh] overflow-y-auto space-y-6 pr-1"
          onSubmit={form.handleSubmit((values) => onSubmit(values))}
        >
          <CompanyFormFields register={form.register} errors={form.formState.errors} />
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="edit-company-form" disabled={isPending || !company}>
            {isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
