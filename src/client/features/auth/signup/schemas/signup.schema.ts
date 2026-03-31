import { z } from "zod"

export const contactInfoSchema = z.object({
  firstName: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  lastName:  z.string().min(2, "Sobrenome deve ter ao menos 2 caracteres"),
  phone:     z.string().min(14, "Telefone inválido"),
})

export const credentialsSchema = z
  .object({
    email:           z.string().email("E-mail inválido"),
    password:        z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path:    ["confirmPassword"],
  })

export type ContactInfoValues  = z.infer<typeof contactInfoSchema>
export type CredentialsValues  = z.infer<typeof credentialsSchema>
