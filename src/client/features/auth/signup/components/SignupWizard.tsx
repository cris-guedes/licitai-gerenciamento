"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { StepUserType } from "./StepUserType"
import { StepContactInfo } from "./StepContactInfo"
import { StepCredentials } from "./StepCredentials"
import { useAuthMethods } from "@/client/hooks/app/auth/use-auth-methods"

export type UserType = "owner" | "team_member"

export interface SignupData {
  userType: UserType | null
  firstName: string
  lastName: string
  phone: string
  email: string
  password: string
}

const initialData: SignupData = {
  userType: null,
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  password: "",
}

export function SignupWizard() {
  const router = useRouter()
  const { signUp } = useAuthMethods()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [signupData, setSignupData] = useState<SignupData>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const updateData = (updates: Partial<SignupData>) => {
    setSignupData((prev) => ({ ...prev, ...updates }))
  }

  const handleFinish = async (credentials: { email: string; password: string }) => {
    setIsLoading(true)
    setServerError(null)

    const { error } = await signUp.email({
      email: credentials.email,
      password: credentials.password,
      name: `${signupData.firstName} ${signupData.lastName}`,
    })

    if (error) {
      setServerError(error.message ?? "Ocorreu um erro ao criar sua conta. Tente novamente.")
      setIsLoading(false)
      return
    }

    router.push("/onboarding")
  }

  return (
    <div>
      {step === 1 && (
        <StepUserType
          userType={signupData.userType}
          onSelect={(type) => updateData({ userType: type })}
          onContinue={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <StepContactInfo
          data={signupData}
          onBack={() => setStep(1)}
          onNext={(data) => {
            updateData(data)
            setStep(3)
          }}
        />
      )}
      {step === 3 && (
        <StepCredentials
          onBack={() => setStep(2)}
          onSubmit={handleFinish}
          isLoading={isLoading}
          serverError={serverError}
        />
      )}
    </div>
  )
}
