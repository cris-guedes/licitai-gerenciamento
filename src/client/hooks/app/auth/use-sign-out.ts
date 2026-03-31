"use client";

import { signOut } from "@/client/main/infra/auth/auth.client";

/**
 * Single point of contact for sign-out. Decouples the app from better-auth.
 * If the auth provider changes, only this file changes.
 */
export const useSignOut = () => signOut;
