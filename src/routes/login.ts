import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { validateLoginSchema } from '../middlewares/schemas/login-schema'

export const loginRoute = async (app: FastifyInstance) => {
  app.post('/', async (req, res) => {
    const result = validateLoginSchema(req)

    if (!result.success) {
      return res.status(400).send({ error: result.error.issues })
    }

    const { email, password } = result.data

    try {
      const user = await knex('users')
        .where({
          email,
          password,
        })
        .first()
        .select('id')

      if (!user || !user?.id) {
        return res.status(404).send({ message: 'User not found!' })
      }

      res.cookie('user_id', user.id, {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })

      return res.send()
    } catch (error) {
      return res.status(500).send({ error })
    }
  })
}
