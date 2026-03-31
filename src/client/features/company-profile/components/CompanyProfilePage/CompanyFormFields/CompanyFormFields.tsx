"use client"

import { Input } from "@/client/components/ui/input"
import { Label } from "@/client/components/ui/label"
import type { FieldErrors, UseFormRegister } from "react-hook-form"
import type { CompanyProfileFormValues } from "../../../schemas/company-profile.schema"

type Props = {
  register: UseFormRegister<CompanyProfileFormValues>
  errors: FieldErrors<CompanyProfileFormValues>
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-destructive mt-1">{message}</p>
}

export function CompanyFormFields({ register, errors }: Props) {
  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-[22px] border border-border/60 bg-background/80 p-5">
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.18em] text-primary/80">Identificação</h3>
          <p className="mt-1 text-xs text-muted-foreground">Dados principais exibidos em toda a plataforma.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input id="cnpj" className="h-11 rounded-xl bg-background" placeholder="00000000000191" {...register("cnpj")} />
            <FieldError message={errors.cnpj?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="razao_social">Razão social</Label>
            <Input id="razao_social" className="h-11 rounded-xl bg-background" placeholder="Empresa Exemplo LTDA" {...register("razao_social")} />
            <FieldError message={errors.razao_social?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome_fantasia">Nome fantasia</Label>
            <Input id="nome_fantasia" className="h-11 rounded-xl bg-background" placeholder="Nome fantasia" {...register("nome_fantasia")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email_empresa">E-mail</Label>
            <Input id="email_empresa" type="email" className="h-11 rounded-xl bg-background" placeholder="contato@empresa.com" {...register("email_empresa")} />
            <FieldError message={errors.email_empresa?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone_1">Telefone</Label>
            <Input id="telefone_1" className="h-11 rounded-xl bg-background" placeholder="(45) 99999-9999" {...register("telefone_1")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="situacao_cadastral">Situação cadastral</Label>
            <Input id="situacao_cadastral" className="h-11 rounded-xl bg-background" placeholder="Ativa" {...register("situacao_cadastral")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_abertura">Data de abertura</Label>
            <Input id="data_abertura" className="h-11 rounded-xl bg-background" placeholder="2020-01-01" {...register("data_abertura")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_situacao_cadastral">Data da situação cadastral</Label>
            <Input id="data_situacao_cadastral" className="h-11 rounded-xl bg-background" placeholder="2024-01-01" {...register("data_situacao_cadastral")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capital_social">Capital social</Label>
            <Input id="capital_social" type="number" step="0.01" className="h-11 rounded-xl bg-background" placeholder="0,00" {...register("capital_social")} />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-[22px] border border-border/60 bg-background/80 p-5">
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.18em] text-primary/80">Classificação</h3>
          <p className="mt-1 text-xs text-muted-foreground">Informações legais e operacionais do cadastro empresarial.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="porte">Porte</Label>
            <Input id="porte" className="h-11 rounded-xl bg-background" placeholder="Pequeno porte" {...register("porte")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="natureza_juridica">Natureza jurídica</Label>
            <Input id="natureza_juridica" className="h-11 rounded-xl bg-background" placeholder="Sociedade Empresária Limitada" {...register("natureza_juridica")} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="cnae_fiscal_descricao">CNAE principal</Label>
            <Input id="cnae_fiscal_descricao" className="h-11 rounded-xl bg-background" placeholder="Atividade principal" {...register("cnae_fiscal_descricao")} />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-[22px] border border-border/60 bg-background/80 p-5">
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.18em] text-primary/80">Endereço</h3>
          <p className="mt-1 text-xs text-muted-foreground">Localização usada em documentos, cadastros e futuras integrações.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="logradouro">Logradouro</Label>
            <Input id="logradouro" className="h-11 rounded-xl bg-background" placeholder="Rua Exemplo" {...register("logradouro")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="numero">Número</Label>
            <Input id="numero" className="h-11 rounded-xl bg-background" placeholder="123" {...register("numero")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="complemento">Complemento</Label>
            <Input id="complemento" className="h-11 rounded-xl bg-background" placeholder="Sala 2" {...register("complemento")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bairro">Bairro</Label>
            <Input id="bairro" className="h-11 rounded-xl bg-background" placeholder="Centro" {...register("bairro")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="municipio">Município</Label>
            <Input id="municipio" className="h-11 rounded-xl bg-background" placeholder="Foz do Iguaçu" {...register("municipio")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="uf">UF</Label>
            <Input id="uf" className="h-11 rounded-xl bg-background" placeholder="PR" maxLength={2} {...register("uf")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cep">CEP</Label>
            <Input id="cep" className="h-11 rounded-xl bg-background" placeholder="85851-000" {...register("cep")} />
          </div>
        </div>
      </section>
    </div>
  )
}
