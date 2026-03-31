"use client"

import { z } from "zod"

export const accountProfileSchema = z.object({
  name: z.string().min(2, "Informe seu nome completo"),
  email: z.string().email("Informe um e-mail válido"),
})

export type AccountProfileValues = z.infer<typeof accountProfileSchema>
