"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/client/main/lib/utils"
import { StepCnpj } from "./StepCnpj"
import { StepIdentificacao } from "./StepIdentificacao"
import { StepLocalizacao } from "./StepLocalizacao"
import { StepAtividade } from "./StepAtividade"
import { useSubmitOnboarding } from "../hooks/use-onboarding"
import type { FetchCompanyByCnpjResponse } from "@/client/main/infra/apis/api-core/models/FetchCompanyByCnpjResponse"
import type { IdentificacaoData, LocalizacaoData, AtividadeData } from "../schemas/onboarding.schema"

const STEPS = ["CNPJ", "Identificação", "Localização", "Atividade"]

function StepProgress({ current }: { current: number }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground font-medium">
        Passo {current} de {STEPS.length}
      </p>
      <div className="flex gap-1.5">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              i + 1 <= current ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <Loader2 className="size-10 animate-spin text-primary" />
      <p className="text-sm font-medium text-muted-foreground">Finalizando cadastro...</p>
    </div>
  )
}

function SuccessScreen({ onContinue }: { onContinue: () => void }) {
  useEffect(() => {
    toast.success("Empresa cadastrada com sucesso!")
    const timer = setTimeout(onContinue, 1000)
    return () => clearTimeout(timer)
  }, [onContinue])

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-emerald-50">
        <CheckCircle2 className="size-10 text-emerald-600" />
      </div>

      <div className="space-y-1.5">
        <h2 className="text-2xl font-black text-primary tracking-tight">Cadastro concluído!</h2>
        <p className="text-sm text-muted-foreground">
          Aguarde, você será redirecionado...
        </p>
      </div>
    </div>
  )
}

type Step = 1 | 2 | 3 | 4

export function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep]                   = useState<Step>(1)
  const [rawCnpj, setRawCnpj]             = useState("")
  const [company, setCompany]             = useState<FetchCompanyByCnpjResponse | null>(null)
  const [identificacao, setIdentificacao] = useState<IdentificacaoData | null>(null)
  const [localizacao, setLocalizacao]     = useState<LocalizacaoData | null>(null)

  const submitMutation = useSubmitOnboarding()

  function handleAtividadeSubmit(values: AtividadeData) {
    const cnaeNum = values.cnae_fiscal ? parseInt(values.cnae_fiscal, 10) : undefined

    submitMutation.mutate({
      cnpj:                    rawCnpj,
      razao_social:            identificacao!.razao_social,
      nome_fantasia:           identificacao!.nome_fantasia,
      cep:                     localizacao?.cep,
      logradouro:              localizacao?.logradouro,
      numero:                  localizacao?.numero,
      complemento:             localizacao?.complemento,
      bairro:                  localizacao?.bairro,
      municipio:               localizacao?.municipio,
      uf:                      localizacao?.uf,
      cnae_fiscal:             Number.isNaN(cnaeNum) ? undefined : cnaeNum,
      cnae_fiscal_descricao:   values.cnae_fiscal_descricao,
      cnaes_secundarios:       values.cnaes_secundarios,
      situacao_cadastral:      company?.situacao_cadastral,
      natureza_juridica:       company?.natureza_juridica,
      data_abertura:           company?.data_abertura,
      porte:                   company?.porte,
      data_situacao_cadastral: company?.data_situacao_cadastral,
      telefone_1:              company?.telefone_1,
      email_empresa:           company?.email,
      capital_social:          company?.capital_social,
      opcao_pelo_simples:      company?.opcao_pelo_simples,
      opcao_pelo_mei:          company?.opcao_pelo_mei,
    })
  }

  if (submitMutation.isPending) return <LoadingScreen />
  if (submitMutation.isSuccess) {
    const { organizationId, companyId } = submitMutation.data
    return <SuccessScreen onContinue={() => router.push(`/org/${organizationId}/${companyId}`)} />
  }

  return (
    <div className="space-y-6">
      <StepProgress current={step} />

      {step === 1 && (
        <StepCnpj
          onNext={(cnpj, data) => {
            setRawCnpj(cnpj)
            setCompany(data)
            setStep(2)
          }}
        />
      )}

      {step === 2 && (
        <StepIdentificacao
          defaultValues={{
            razao_social:  company?.razao_social  ?? "",
            nome_fantasia: company?.nome_fantasia ?? null,
          }}
          onBack={() => setStep(1)}
          onNext={(values) => { setIdentificacao(values); setStep(3) }}
        />
      )}

      {step === 3 && (
        <StepLocalizacao
          defaultValues={{
            cep:         company?.cep,
            logradouro:  company?.logradouro,
            numero:      company?.numero,
            complemento: company?.complemento,
            bairro:      company?.bairro,
            municipio:   company?.municipio,
            uf:          company?.uf,
          }}
          onBack={() => setStep(2)}
          onNext={(values) => { setLocalizacao(values); setStep(4) }}
        />
      )}

      {step === 4 && (
        <StepAtividade
          defaultValues={{
            cnae_fiscal:           company?.cnae_fiscal?.toString(),
            cnae_fiscal_descricao: company?.cnae_fiscal_descricao,
            cnaes_secundarios:     company?.cnaes_secundarios,
          }}
          situacaoCadastral={company?.situacao_cadastral}
          onBack={() => setStep(3)}
          onSubmit={handleAtividadeSubmit}
          isPending={submitMutation.isPending}
          isError={submitMutation.isError}
        />
      )}
    </div>
  )
}
