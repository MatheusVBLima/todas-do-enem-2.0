import { z } from 'zod'
import { GROUP_COLORS } from '@/lib/constants'

export const savedFiltersSchema = z.object({
  anos: z.array(z.number()).optional(),
  areas: z.array(z.string()).optional(),
  disciplinas: z.array(z.string()).optional(),
  busca: z.string().optional(),
})

export const createGroupSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida')
    .default(GROUP_COLORS[0]),
  savedFilters: savedFiltersSchema.optional(),
})

export const updateGroupSchema = createGroupSchema.partial()

export type CreateGroupInput = z.infer<typeof createGroupSchema>
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>
export type SavedFilters = z.infer<typeof savedFiltersSchema>
