import { FastifyRequest } from 'fastify'
import { z } from 'zod'

export const validateUserSchema = (request: FastifyRequest) => {
  const createUserBodySchema = z.object({
    name: z.string(),
    dietGoal: z.optional(z.string()),
    email: z.string().email(),
    password: z.coerce.string(),
  })

  return createUserBodySchema.safeParse(request.body)
}
