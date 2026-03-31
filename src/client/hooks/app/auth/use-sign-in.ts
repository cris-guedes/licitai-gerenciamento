"use client";

import { signIn } from "@/client/main/infra/auth/auth.client";

/**
 * Single point of contact for sign-in. Decouples the app from better-auth.
 * If the auth provider changes, only this file changes.
 */
export const useSignIn = () => signIn;
