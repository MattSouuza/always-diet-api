import { FastifyRequest } from 'fastify'
import { z } from 'zod'

export const validateLoginSchema = (req: FastifyRequest) => {
  const userLoginSchema = z.object({
    email: z.string().email(),
    password: z.coerce.string(),
  })

  return userLoginSchema.safeParse(req.body)
}
