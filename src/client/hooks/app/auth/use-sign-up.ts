"use client";

import { signUp } from "@/client/main/infra/auth/auth.client";

/**
 * Single point of contact for sign-up. Decouples the app from better-auth.
 * If the auth provider changes, only this file changes.
 */
export const useSignUp = () => signUp;
