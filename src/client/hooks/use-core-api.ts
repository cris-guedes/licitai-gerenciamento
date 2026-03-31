"use client"

import { useMemo } from "react"
import { CoreApiClient } from "@/client/main/infra/apis/api-core/CoreApiClient"
import { CustomAxiosHttpRequest } from "@/client/main/infra/apis/config/CustomAxiosHttpRequest"
import { useSession } from "./app/auth/use-session/use-session"

export function useCoreApi(): CoreApiClient {
  const { token } = useSession()
  return useMemo(
    () => new CoreApiClient({ TOKEN: token ?? "" }, CustomAxiosHttpRequest),
    [token]
  )
}
