"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { CoreApiClient } from "@/client/main/infra/apis/api-core/CoreApiClient"

export type AccountUpdatePayload = {
  id: string
  name?: string
  email?: string
}

const ROLE_LABELS: Record<string, string> = {
  OWNER:  "Proprietário",
  ADMIN:  "Administrador",
  MEMBER: "Membro",
}

export function useAccountService(api: CoreApiClient) {
  const queryClient = useQueryClient()

  const fetchRole = (params: { organizationId: string; userId: string; enabled?: boolean }) => {
    const { organizationId, userId, enabled = true } = params
    return useQuery({
      queryKey: ["account-role", organizationId, userId],
      queryFn: async () => {
        const res = await api.team.listMembers({ organizationId })
        const me = res.members?.find((m) => m.userId === userId)
        return me?.role ?? null
      },
      enabled: enabled && !!organizationId && !!userId,
      staleTime: 5 * 60 * 1000,
    })
  }

  const update = useMutation({
    mutationFn: ({ id, name, email }: AccountUpdatePayload) =>
      api.auth.updateUser({
        requestBody: {
          id,
          data: {
            ...(name !== undefined && { name }),
            ...(email !== undefined && { email }),
          },
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] })
    },
  })

  const remove = useMutation({
    mutationFn: ({ id }: { id: string }) =>
      api.auth.deleteUser({ requestBody: { id } }),
  })

  return { fetchRole, update, remove, ROLE_LABELS }
}
