"use client"

import { injectContentsquareScript } from "@contentsquare/tag-sdk"
import { useEffect } from "react"

const CLIENT_ID = process.env.NEXT_PUBLIC_CONTENTSQUARE_CLIENT_ID

export function HotjarProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (CLIENT_ID) {
      injectContentsquareScript({ clientId: CLIENT_ID, async: true })
    }
  }, [])

  return <>{children}</>
}
