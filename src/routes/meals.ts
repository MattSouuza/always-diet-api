import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import {
  validateMealSchema,
  validateMealIdParamSchema,
  validateUpdateMealSchema,
} from '../middlewares/schemas/meals-schema'
import { randomUUID } from 'crypto'
import { checkUserIdExists } from '../middlewares/check-user-id-exists'

export const mealsRoutes = async (app: FastifyInstance) => {
  app.post(
    '/',
    {
      preHandler: [checkUserIdExists],
    },
    async (req, res) => {
      const result = validateMealSchema(req)

      if (!result.success) {
        return res.status(400).send({ error: result.error.issues })
      }

      const {
        name,
        description,
        schedule_at: scheduleAt,
        on_diet: onDiet,
      } = result.data

      const userId = req.cookies.user_id

      const returned = await knex('meals').returning('id').insert({
        id: randomUUID(),
        user_id: userId,
        name,
        description,
        schedule_at: scheduleAt,
        on_diet: onDiet,
      })

      res.status(201).send({ meal: returned[0] })
    },
  )

  app.get(
    '/:meal_id',
    {
      preHandler: [checkUserIdExists],
    },
    async (req, res) => {
      const result = validateMealIdParamSchema(req)

      if (!result.success) {
        return res.status(400).send({ error: result.error.issues })
      }

      const { meal_id: id } = result.data

      const userId = req.cookies.user_id

      try {
        const meal = await knex('meals').where({ id, user_id: userId }).first()

        if (!meal) {
          return res
            .status(404)
            .send({ error: `No meals with the given ID was found!` })
        }

        return res.send(meal)
      } catch (error) {
        return res.status(500).send({ error })
      }
    },
  )

  app.get(
    '/',
    {
      preHandler: [checkUserIdExists],
    },
    async (req, res) => {
      const userId = req.cookies.user_id

      try {
        const meals = await knex('meals').where('user_id', userId)

        return res.send({ meals })
      } catch (error) {
        return res.status(500).send({ error })
      }
    },
  )

  app.put(
    '/:meal_id',
    {
      preHandler: [checkUserIdExists],
    },
    async (req, res) => {
      const result = validateMealIdParamSchema(req)

      if (!result.success) {
        return res.status(400).send({ error: result.error.issues })
      }

      const { meal_id: id } = result.data

      const userId = req.cookies.user_id

      let searchedMeal
      try {
        searchedMeal = await knex('meals')
          .where({ id, user_id: userId })
          .first()
      } catch (error) {
        return res.status(500).send({ error })
      }

      if (!searchedMeal) {
        return res
          .status(404)
          .send({ error: `No meals with the given ID was found!` })
      }

      const updateSchemaResult = validateUpdateMealSchema(req)

      if (!updateSchemaResult.success) {
        return res.status(400).send({ error: updateSchemaResult.error.issues })
      }

      const {
        name,
        description,
        schedule_at: scheduleAt,
        on_diet: onDiet,
      } = updateSchemaResult.data

      try {
        const affectedRows = await knex('meals')
          .update({
            name: name ?? searchedMeal.name,
            description: description ?? searchedMeal.description,
            schedule_at: scheduleAt ?? searchedMeal.schedule_at,
            on_diet: onDiet ?? searchedMeal.on_diet,
            updated_at: new Date(),
          })
          .where({ id, user_id: userId })

        if (!affectedRows) {
          return res
            .status(404)
            .send({ error: `No meals with the given ID was found!` })
        }

        return res.status(204).send()
      } catch (error) {
        return res.status(500).send({ error })
      }
    },
  )

  app.delete(
    '/:meal_id',
    {
      preHandler: [checkUserIdExists],
    },
    async (req, res) => {
      const result = validateMealIdParamSchema(req)

      if (!result.success) {
        return res.status(400).send({ error: result.error.issues })
      }

      const { meal_id: id } = result.data

      const userId = req.cookies.user_id

      try {
        const affectedRows = await knex('meals')
          .where({ id, user_id: userId })
          .del()

        if (!affectedRows) {
          return res
            .status(404)
            .send({ error: `No meals with the given ID was found!` })
        }

        return res.status(204).send()
      } catch (error) {
        return res.status(500).send({ error })
      }
    },
  )
}
