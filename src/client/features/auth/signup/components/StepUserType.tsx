import { cn } from "@/client/main/lib/utils"
import { Button } from "@/client/components/ui/button"
import { Building2, Users } from "lucide-react"
import type { UserType } from "./SignupWizard"

interface Props {
  userType: UserType | null
  onSelect: (type: UserType) => void
  onContinue: () => void
}

const options = [
  {
    value: "owner" as const,
    title: "Sou gestor / responsável",
    description: "Quero cadastrar minha empresa e liderar as licitações da minha equipe.",
    icon: Building2,
  },
  {
    value: "team_member" as const,
    title: "Faço parte da equipe",
    description: "Quero colaborar com uma empresa já cadastrada no Licitare.",
    icon: Users,
  },
]

export function StepUserType({ userType, onSelect, onContinue }: Props) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Passo 1 de 3
        </p>
        <h1 className="text-2xl font-black text-primary tracking-tight">
          Qual é o seu perfil?
        </h1>
        <p className="text-sm text-muted-foreground">
          Selecione como você participará das licitações.
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {options.map(({ value, title, description, icon: Icon }) => {
          const selected = userType === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => onSelect(value)}
              className={cn(
                "w-full text-left rounded-xl border-2 p-4 transition-all duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                selected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-white hover:border-primary/40 hover:bg-muted/30"
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "size-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "font-bold text-sm",
                      selected ? "text-primary" : "text-foreground"
                    )}
                  >
                    {title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {description}
                  </p>
                </div>
                <div
                  className={cn(
                    "size-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors",
                    selected ? "border-primary bg-primary" : "border-border"
                  )}
                >
                  {selected && (
                    <div className="size-2 rounded-full bg-white" />
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Action */}
      <Button
        onClick={onContinue}
        disabled={!userType}
        className="w-full h-11 font-bold uppercase tracking-widest text-xs bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Continuar para Dados Pessoais
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Já tem uma conta?{" "}
        <a href="/login" className="font-bold text-primary hover:underline">
          Entrar
        </a>
      </p>
    </div>
  )
}
