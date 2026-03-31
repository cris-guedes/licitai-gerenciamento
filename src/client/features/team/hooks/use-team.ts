"use client"

import { useMemo }           from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { CoreApiClient }     from "@/client/main/infra/apis/api-core/CoreApiClient"
import { CustomAxiosHttpRequest } from "@/client/main/infra/apis/config/CustomAxiosHttpRequest"
import { useAppContext }     from "@/client/hooks/app"

export function useTeam() {
  const { token, orgAtiva, empresaAtiva } = useAppContext()
  const queryClient = useQueryClient()

  const api = useMemo(
    () => new CoreApiClient({ TOKEN: token ?? "" }, CustomAxiosHttpRequest),
    [token],
  )

  const organizationId = orgAtiva?.id ?? ""
  const companyId      = empresaAtiva?.id ?? ""

  // ── Queries ───────────────────────────────────────────────────────────────

  const membersQuery = useQuery({
    queryKey: ["team", "members", organizationId],
    queryFn:  () => api.team.listMembers({ organizationId }),
    enabled:  !!organizationId,
  })

  // ── Mutations ─────────────────────────────────────────────────────────────

  const createMember = useMutation({
    mutationFn: (data: { name: string; email: string; password: string; role: "ADMIN" | "MEMBER" }) =>
      api.team.createMember({ requestBody: { ...data, organizationId, companyId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["team", "members", organizationId] }),
  })

  const createInvite = useMutation({
    mutationFn: (data: { email: string; role: "ADMIN" | "MEMBER" }) =>
      api.team.createInvite({ requestBody: { ...data, organizationId, companyId } }),
  })

  const updateMemberRole = useMutation({
    mutationFn: (data: { membershipId: string; role: "ADMIN" | "MEMBER" }) =>
      api.team.updateMemberRole({ requestBody: data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["team", "members", organizationId] }),
  })

  const removeMember = useMutation({
    mutationFn: (membershipId: string) =>
      api.team.removeMember({ requestBody: { membershipId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["team", "members", organizationId] }),
  })

  return {
    members:        membersQuery.data?.members ?? [],
    membersLoading: membersQuery.isLoading,
    createMember,
    createInvite,
    updateMemberRole,
    removeMember,
  }
}
