"use client"

import { useMemo }      from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { CoreApiClient } from "@/client/main/infra/apis/api-core/CoreApiClient"

/**
 * Hook público — sem token de autenticação.
 * Usado na página /invite/[token] que é acessível sem sessão.
 */
export function useAcceptInvite(token: string) {
  // Sem token de auth — página pública
  const api = useMemo(() => new CoreApiClient(), [])

  const inviteQuery = useQuery({
    queryKey: ["invite", token],
    queryFn:  () => api.team.getInvite({ token }),
    enabled:  !!token,
    retry:    false,
  })

  const acceptInvite = useMutation({
    mutationFn: (data: { name: string; password: string }) =>
      api.team.acceptInvite({ requestBody: { token, ...data } }),
  })

  return {
    invite:        inviteQuery.data ?? null,
    inviteLoading: inviteQuery.isLoading,
    inviteError:   inviteQuery.error,
    acceptInvite,
  }
}
