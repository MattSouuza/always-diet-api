import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { validateUserSchema } from '../schemas/user-schema'

export const usersRoutes = async (app: FastifyInstance) => {
  app.get('/:id', async (req, res) => {
    const userParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const result = userParamsSchema.safeParse(req.params)

    if (!result.success) {
      return res.status(400).send({ error: result.error.issues })
    }

    const { id } = result.data

    const user = await knex('users').where('id', id).first()

    return { user }
  })

  app.post('/', async (req, res) => {
    const result = validateUserSchema(req)

    if (!result.success) {
      return res.status(400).send({ error: result.error.issues })
    }

    const { name, dietGoal, email, password } = result.data

    try {
      const returned = await knex('users').returning('id').insert({
        id: randomUUID(),
        name,
        diet_goal: dietGoal,
        email,
        password,
      })
      return res.status(201).send({ user: returned[0] })
    } catch (error) {
      return res.status(400).send(error)
    }
  })
}
