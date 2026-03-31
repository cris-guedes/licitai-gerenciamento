"use client"

import { Badge } from "@/client/components/ui/badge"
import type { CompanyProfile } from "@/client/main/infra/apis/api-core/models/CompanyProfile"
import { Button } from "@/client/components/ui/button"
import { Card, CardContent } from "@/client/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/client/components/ui/tabs"
import { Building2, CalendarClock, CheckCircle2, CircleDollarSign, FileText, Landmark, Mail, MapPin, Phone, Pencil, Trash2 } from "lucide-react"

type Props = {
  company: CompanyProfile | null
  isPending: boolean
  canDelete: boolean
  onEdit: () => void
  onDelete: () => void
}

function DisplayField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value?: string | number | null | boolean
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background p-4">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
        <Icon className="size-3" />
        {label}
      </div>
      <p className="mt-2 text-sm font-medium text-foreground">
        {value === null || value === undefined || value === "" ? (
          <span className="text-muted-foreground/60 italic font-normal">Não informado</span>
        ) : String(value)}
      </p>
    </div>
  )
}

function getSecondaryCnaes(company: CompanyProfile): Array<{ codigo: number; descricao: string }> {
  const value = (company as unknown as { cnaes_secundarios?: unknown }).cnaes_secundarios

  if (!Array.isArray(value)) return []

  return value.flatMap((item) => {
    if (
      item &&
      typeof item === "object" &&
      "codigo" in item &&
      "descricao" in item &&
      typeof item.codigo === "number" &&
      typeof item.descricao === "string"
    ) {
      return [{ codigo: item.codigo, descricao: item.descricao }]
    }

    return []
  })
}

export function CompanyProfileForm({ company, isPending, canDelete, onEdit, onDelete }: Props) {
  const secondaryCnaes = company ? getSecondaryCnaes(company) : []

  if (!company) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-card/60 p-10 text-center text-sm text-muted-foreground">
        Selecione uma empresa para visualizar o perfil.
      </div>
    )
  }

  return (
    <Card className="overflow-hidden border-border/60 bg-card shadow-sm">
      {/* Company header */}
      <div className="flex items-center justify-between gap-4 border-b border-border/60 bg-muted/20 px-5 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
            <Building2 className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-bold text-foreground">
              {company.nome_fantasia ?? company.razao_social}
            </p>
            {company.nome_fantasia && (
              <p className="truncate text-xs text-muted-foreground">{company.razao_social}</p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden sm:flex items-center gap-2">
            <Badge variant="outline" className="rounded-full px-2.5 py-1 font-mono text-xs">
              {company.cnpj}
            </Badge>
            {(company.municipio || company.uf) && (
              <Badge variant="outline" className="rounded-full px-2.5 py-1 text-xs">
                <MapPin className="size-3" />
                {company.municipio}{company.uf ? `, ${company.uf}` : ""}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 border-l border-border/60 pl-3 ml-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-destructive hover:bg-destructive/8 hover:text-destructive"
              onClick={onDelete}
              disabled={!canDelete || isPending}
            >
              <Trash2 className="size-3.5" />
              <span className="hidden sm:inline">Excluir</span>
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 gap-1.5"
              onClick={onEdit}
              disabled={isPending}
            >
              <Pencil className="size-3.5" />
              Editar
            </Button>
          </div>
        </div>
      </div>

      <CardContent className="p-5">
        <Tabs defaultValue="visao-geral" className="gap-4">
          <TabsList variant="line" className="w-full justify-start">
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="atividade">Atividade Econômica</TabsTrigger>
            <TabsTrigger value="endereco">Endereço</TabsTrigger>
          </TabsList>

          <TabsContent value="visao-geral" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              <DisplayField icon={FileText} label="CNPJ" value={company.cnpj} />
              <DisplayField icon={Building2} label="Razão social" value={company.razao_social} />
              <DisplayField icon={Building2} label="Nome fantasia" value={company.nome_fantasia} />
              <DisplayField icon={Mail} label="E-mail" value={company.email_empresa} />
              <DisplayField icon={Phone} label="Telefone" value={company.telefone_1} />
              <DisplayField icon={CircleDollarSign} label="Capital social" value={company.capital_social != null ? `R$ ${company.capital_social.toLocaleString("pt-BR")}` : null} />
              <DisplayField icon={Landmark} label="Porte" value={company.porte} />
              <DisplayField icon={Landmark} label="Natureza jurídica" value={company.natureza_juridica} />
              <DisplayField icon={CheckCircle2} label="Situação cadastral" value={company.situacao_cadastral} />
              <DisplayField icon={CalendarClock} label="Data de abertura" value={company.data_abertura} />
              <DisplayField icon={CalendarClock} label="Data da situação" value={company.data_situacao_cadastral} />
              <DisplayField icon={CheckCircle2} label="Optante pelo Simples" value={company.opcao_pelo_simples == null ? null : company.opcao_pelo_simples ? "Sim" : "Não"} />
              <DisplayField icon={CheckCircle2} label="Optante pelo MEI" value={company.opcao_pelo_mei == null ? null : company.opcao_pelo_mei ? "Sim" : "Não"} />
            </div>
          </TabsContent>

          <TabsContent value="atividade" className="mt-4">
            <div className="rounded-xl border border-border/60 bg-background p-5 space-y-5">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[160px_minmax(0,1fr)]">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">CNAE principal</p>
                  <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm font-semibold font-mono text-foreground">
                    {company.cnae_fiscal ?? "—"}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Descrição</p>
                  <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-foreground">
                    {company.cnae_fiscal_descricao ?? "Não informado"}
                  </div>
                </div>
              </div>

              {secondaryCnaes.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">CNAEs secundários</p>
                  <div className="flex flex-wrap gap-2">
                    {secondaryCnaes.map((cnae) => (
                      <span
                        key={cnae.codigo}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground"
                        title={cnae.descricao}
                      >
                        <span className="font-mono font-semibold text-foreground">{cnae.codigo}</span>
                        <span className="max-w-[220px] truncate">{cnae.descricao}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border/60 px-4 py-5 text-sm text-muted-foreground text-center">
                  Nenhum CNAE secundário disponível.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="endereco" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              <DisplayField icon={MapPin} label="Logradouro" value={company.logradouro} />
              <DisplayField icon={MapPin} label="Número" value={company.numero} />
              <DisplayField icon={MapPin} label="Complemento" value={company.complemento} />
              <DisplayField icon={MapPin} label="Bairro" value={company.bairro} />
              <DisplayField icon={MapPin} label="Município" value={company.municipio} />
              <DisplayField icon={MapPin} label="UF" value={company.uf} />
              <DisplayField icon={MapPin} label="CEP" value={company.cep} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
