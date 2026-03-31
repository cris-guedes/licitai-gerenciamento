"use client"

import { useSignIn } from "@/client/hooks/app/auth/use-sign-in"
import { useSignOut } from "@/client/hooks/app/auth/use-sign-out"
import { useSignUp } from "@/client/hooks/app/auth/use-sign-up"

/**
 * Agrega as ações de autenticação em um único hook.
 *
 * Retorna referências estáveis (funções de módulo) — não causa re-renders.
 * Se o provider de auth mudar, só os hooks individuais precisam ser atualizados.
 *
 * Uso:
 * ```ts
 * const { signIn, signOut, signUp } = useAuthMethods()
 * await signIn.email({ email, password })
 * ```
 */
export function useAuthMethods() {
  const signIn = useSignIn()
  const signOut = useSignOut()
  const signUp = useSignUp()

  return { signIn, signOut, signUp }
}
