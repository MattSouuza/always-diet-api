import { FastifyRequest } from 'fastify'
import { z } from 'zod'

export const validateMealSchema = (request: FastifyRequest) => {
  const createMealBodySchema = z.object({
    user_id: z.string().uuid(),
    name: z.string(),
    description: z.optional(z.string()),
    schedule_at: z.coerce.date(),
    on_diet: z.boolean(),
  })

  return createMealBodySchema.safeParse(request.body)
}
