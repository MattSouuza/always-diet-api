import { FastifyInstance } from 'fastify'
import { knex } from '../database'
// import { z } from 'zod'
import { validateMealSchema } from '../schemas/meals-schema'
import { randomUUID } from 'crypto'

export const mealsRoutes = async (app: FastifyInstance) => {
  app.post('/', async (req, res) => {
    const result = validateMealSchema(req)

    if (!result.success) {
      return res.status(400).send({ error: result.error.issues })
    }

    const {
      user_id: userId,
      name,
      description,
      schedule_at: scheduleAt,
      on_diet: onDiet,
    } = result.data

    const returned = await knex('meals').returning('id').insert({
      id: randomUUID(),
      user_id: userId,
      name,
      description,
      schedule_at: scheduleAt,
      on_diet: onDiet,
    })

    res.status(201).send({ meal: returned[0] })
  })
}
