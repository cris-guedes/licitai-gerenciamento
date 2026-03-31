"use client"

import { useState } from "react"
import { Button } from "@/client/components/ui/button"
import { Input } from "@/client/components/ui/input"
import { cn } from "@/client/main/lib/utils"
import { Search } from "lucide-react"
import { useLookupCnpj } from "../hooks/use-onboarding"
import type { FetchCompanyByCnpjResponse } from "@/client/main/infra/apis/api-core/models/FetchCompanyByCnpjResponse"

interface Props {
  onNext: (cnpj: string, company: FetchCompanyByCnpjResponse) => void
}

export function StepCnpj({ onNext }: Props) {
  const { lookupCnpj, isLookingUp } = useLookupCnpj()
  const [cnpj, setCnpj] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleLookup = async () => {
    const digits = cnpj.replace(/\D/g, "")
    if (digits.length !== 14) {
      setError("Digite um CNPJ válido com 14 dígitos.")
      return
    }
    setError(null)
    try {
      const company = await lookupCnpj(digits)
      onNext(cnpj, company)
    } catch {
      setError("Empresa não encontrada. Verifique o CNPJ e tente novamente.")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLookup()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-primary tracking-tight">
          Dados da empresa
        </h1>
        <p className="text-sm text-muted-foreground">
          Digite o CNPJ para buscar os dados da sua empresa automaticamente.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wide">
          CNPJ <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <Input
            placeholder="00.000.000/0001-00"
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLookingUp}
            className={cn("flex-1", error && "border-red-400 focus-visible:ring-red-400/30")}
            autoFocus
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleLookup}
            disabled={isLookingUp}
            className="h-10 px-3 gap-1.5 text-xs font-bold uppercase tracking-wide shrink-0"
          >
            {isLookingUp
              ? "Buscando..."
              : <><Search className="size-3.5" />Consultar</>
            }
          </Button>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </div>
  )
}

import type React from "react"
