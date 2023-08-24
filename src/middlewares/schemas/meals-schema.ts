import { FastifyRequest } from 'fastify'
import { z } from 'zod'

export const validateMealSchema = (req: FastifyRequest) => {
  const createMealBodySchema = z.object({
    name: z.string(),
    description: z.optional(z.string()),
    schedule_at: z.coerce.date(),
    on_diet: z.boolean(),
  })

  return createMealBodySchema.safeParse(req.body)
}

export const validateUpdateMealSchema = (req: FastifyRequest) => {
  const updateMealBodySchema = z.object({
    name: z.string().optional(),
    description: z.optional(z.string()).optional(),
    schedule_at: z.coerce.date().optional(),
    on_diet: z.boolean().optional(),
  })

  return updateMealBodySchema.safeParse(req.body)
}

export const validateMealIdParamSchema = (req: FastifyRequest) => {
  const userParamsSchema = z.object({
    meal_id: z.string().uuid().optional(),
  })

  return userParamsSchema.safeParse(req.params)
}
