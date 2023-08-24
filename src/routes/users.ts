import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { validateCreateUserSchema } from '../middlewares/schemas/user-schema'
import { checkUserIdExists } from '../middlewares/check-user-id-exists'

export const usersRoutes = async (app: FastifyInstance) => {
  app.get(
    '/',
    {
      preHandler: [checkUserIdExists],
    },
    async (req, res) => {
      const id = req.cookies.user_id

      const user = await knex('users').where('id', id).first().select('*')

      return res.send({ user })
    },
  )

  app.post('/', async (req, res) => {
    const result = validateCreateUserSchema(req)

    if (!result.success) {
      return res.status(400).send({ error: result.error.issues })
    }

    const id = randomUUID()
    const { name, dietGoal, email, password } = result.data

    res.cookie('user_id', id, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })

    try {
      await knex('users').insert({
        id,
        name,
        diet_goal: dietGoal,
        email,
        password,
      })

      return res.status(201).send()
    } catch (error) {
      return res.status(500).send({ error })
    }
  })
}
