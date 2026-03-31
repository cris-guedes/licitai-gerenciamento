import { headers } from "next/headers"
import { auth } from "@/main/auth/auth"

/**
 * Server-side equivalent of useSession.
 * Single point of contact for better-auth on the server.
 * If the auth provider changes, only this file changes.
 */
export async function getServerSession() {
  return auth.api.getSession({ headers: await headers() })
}
