import { z } from 'zod'

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo (máximo 100 caracteres)')
    .trim(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
