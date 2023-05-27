import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { validateUserSchema } from '../schemas/user-schema'

export const usersRoutes = async (app: FastifyInstance) => {
  app.get('/:id', async (request) => {
    const userParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = userParamsSchema.parse(request.params)

    const user = await knex('users').where('id', id).first()

    return { user }
  })

  app.post('/', async (request, reply) => {
    const result = validateUserSchema(request)

    if (!result.success) {
      return reply.status(400).send({ error: result.error.issues })
    }

    const { name, dietGoal, email, password } = result.data

    const returned = await knex('users').returning('id').insert({
      id: randomUUID(),
      name,
      diet_goal: dietGoal,
      email,
      password,
    })

    return reply.status(201).send({ user: returned[0] })
  })
}
