"use client"

import { z } from "zod"

export const companyItemFormSchema = z.object({
  codigo: z.string().trim().min(1, "Informe o código interno do item"),
  descricao: z.string().trim().min(2, "Informe a descrição do item"),
  marca: z.string().trim().nullable().optional().or(z.literal("")),
  unidadeMedida: z.string().trim().min(1, "Informe a unidade de medida"),
  imageUrl: z.string().trim().url("Informe uma URL de imagem válida").nullable().optional().or(z.literal("")),
  precoReferencia: z.string().nullable().optional(),
  ativo: z.boolean(),
})

export type CompanyItemFormValues = z.infer<typeof companyItemFormSchema>
