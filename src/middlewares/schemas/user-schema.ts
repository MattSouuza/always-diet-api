import { FastifyRequest } from 'fastify'
import { z } from 'zod'

export const validateCreateUserSchema = (req: FastifyRequest) => {
  const createUserBodySchema = z.object({
    name: z.string(),
    dietGoal: z.optional(z.string()),
    email: z.string().email(),
    password: z.coerce.string(),
  })

  return createUserBodySchema.safeParse(req.body)
}

export const validateUserIdParamSchema = (req: FastifyRequest) => {
  const userParamsSchema = z.object({
    user_id: z.string().uuid().optional(),
  })

  return userParamsSchema.safeParse(req.params)
}
