import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import {
  validateMealSchema,
  validateMealIdParamSchema,
  validateUpdateMealSchema,
} from '../middlewares/schemas/meals-schema'
import { randomUUID } from 'crypto'
import { checkUserIdExists } from '../middlewares/check-user-id-exists'
import { MealsSequences } from '../@types/meal'

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

  app.get(
    '/reports/all',
    {
      preHandler: [checkUserIdExists],
    },
    async (req, res) => {
      let mealsCount = 0

      const userId = req.cookies.user_id

      try {
        mealsCount = await knex('meals').where('user_id', userId).count()
      } catch (error) {
        return res.status(500).send({ error })
      }

      res.send({ mealsCount })
    },
  )

  app.get(
    '/reports/on_diet',
    {
      preHandler: [checkUserIdExists],
    },
    async (req, res) => {
      let mealsCount = 0

      const userId = req.cookies.user_id

      try {
        mealsCount = await knex('meals')
          .where({ user_id: userId, on_diet: true })
          .count()
      } catch (error) {
        return res.status(500).send({ error })
      }

      res.send({ mealsCount })
    },
  )

  app.get(
    '/reports/out_of_diet',
    {
      preHandler: [checkUserIdExists],
    },
    async (req, res) => {
      let mealsCount = 0

      const userId = req.cookies.user_id

      try {
        mealsCount = await knex('meals')
          .where({ user_id: userId, on_diet: false })
          .count()
      } catch (error) {
        return res.status(500).send({ error })
      }

      res.send({ mealsCount })
    },
  )

  app.get(
    '/reports/best_strick',
    {
      preHandler: [checkUserIdExists],
    },
    async (req, res) => {
      let meals = []

      const userId = req.cookies.user_id

      try {
        meals = await knex('meals')
          .where({ user_id: userId, on_diet: true })
          .select()
      } catch (error) {
        return res.status(500).send({ error })
      }

      if (meals.length <= 1) {
        return res
          .status(200)
          .send({ message: 'Not enought meals registered!' })
      }

      const sequences: MealsSequences[] = []

      console.log('__________________________')

      for (let i = 0; i < meals.length; i++) {
        const currentMeal = meals[i]
        const nextMeal = meals[i + 1]

        if (!nextMeal) {
          continue
        }

        if (!currentMeal.on_diet || !nextMeal.on_diet) {
          continue
        }

        console.log(i, new Date(currentMeal.schedule_at))

        const currentMealDate = new Date(
          new Date(currentMeal.schedule_at).setHours(0, 0, 0, 0),
        )
        const nextMealDate = new Date(
          new Date(nextMeal.schedule_at).setHours(0, 0, 0, 0),
        )

        const differenceMealDates =
          nextMealDate.getDate() - currentMealDate.getDate()

        console.log('current', currentMealDate)
        console.log('next', nextMealDate)
        console.log(differenceMealDates)

        if (differenceMealDates > 1 || differenceMealDates < 0) {
          continue
        }

        let currentMealExistInArray = false

        sequences.forEach((sequence, iSequence) =>
          sequence.forEach((meal) => {
            if (meal.id === currentMeal.id) {
              currentMealExistInArray = true
              sequences[iSequence].push(nextMeal)
            }
          }),
        )

        if (!currentMealExistInArray) {
          sequences.push([currentMeal, nextMeal])
        }
      }

      console.log('__________________________')

      let bestStrick: MealsSequences = []

      sequences.forEach((sequence) => {
        if (sequence.length > bestStrick.length) {
          bestStrick = sequence
        }
      })

      res.send({ best_strick: bestStrick })
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
