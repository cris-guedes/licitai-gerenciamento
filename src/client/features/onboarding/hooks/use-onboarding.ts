"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useCoreApi } from "@/client/hooks/use-core-api"
import { OnboardingAPI } from "../services"
import type { OnboardingSubmitData } from "../schemas/onboarding.schema"

export function useLookupCnpj() {
  const api = useCoreApi()
  const [isLookingUp, setIsLookingUp] = useState(false)

  const lookupCnpj = async (cnpj: string) => {
    setIsLookingUp(true)
    try {
      return await OnboardingAPI.lookupCnpj(api, cnpj)
    } finally {
      setIsLookingUp(false)
    }
  }

  return { lookupCnpj, isLookingUp }
}

export function useSubmitOnboarding() {
  const api = useCoreApi()

  return useMutation({
    mutationFn: (data: OnboardingSubmitData) => OnboardingAPI.submit(api, data),
  })
}
