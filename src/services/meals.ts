import { Meal, MealsSequences } from '../@types/meal'

/**
 Returns the best sequence of on diet meals based on the scheduled date. In order for the meal to be included in the sequence list, it needs to be on diet, the previous or the next meal (in the array of meals, obtained from the db) needs to have a difference in the schedule dates of 0 or 1, if the is no match, 

 @param meals: Array of meals => Meal[ ]
 @returns array of type MealsSequences
 */
export const getMealsSequence = (meals: Meal[]) => {
  const sequences: MealsSequences[] = []

  const verifyIfCurrentMealIsInSequence = (
    sequences: MealsSequences[],
    currentMeal: Meal,
  ) => {
    console.log(sequences)

    sequences.forEach((sequence) =>
      sequence.every((meal) => {
        const mealDate = new Date(
          new Date(meal.schedule_at).setUTCHours(0, 0, 0, 0),
        )
        const currentMealDate = new Date(
          new Date(currentMeal.schedule_at).setUTCHours(0, 0, 0, 0),
        )

        console.log(
          `foreach verify meals in sequence CURRENT${currentMeal.name}`,
          new Date(currentMeal.schedule_at),
        )
        console.log(
          `foreach verify meals in sequence ${meal.name}`,
          new Date(meal.schedule_at),
        )

        const differenceDates = currentMealDate.getDate() - mealDate.getDate()

        console.log(`${mealDate} ||| ${currentMealDate}`, differenceDates)

        if (differenceDates === 1 || differenceDates === 0) {
          console.log('added 1', currentMeal)

          sequence.push(currentMeal)
          return false
        } else if (differenceDates === -1) {
          console.log('added -1')
          sequence.push(currentMeal)
          return false
        }

        return true
      }),
    )
  }

  console.log('__________________________')

  for (let i = 0; i < meals.length; i++) {
    const currentMeal = meals[i]

    if (!currentMeal.on_diet) {
      continue
    }

    console.log('current', currentMeal.name)

    const nextMeal = meals[i + 1]

    console.log('next', nextMeal?.name)

    // if the next meal doesn't exist, check if the previous is in sequence with the current
    if (!nextMeal) {
      const previousMeal = meals[i - 1]

      if (!previousMeal?.on_diet) {
        continue
      }

      console.log('previous', previousMeal?.name)

      const currentMealDate = new Date(
        new Date(currentMeal.schedule_at).setUTCHours(0, 0, 0, 0),
      )
      const previousMealDate = new Date(
        new Date(previousMeal.schedule_at).setUTCHours(0, 0, 0, 0),
      )

      const differenceMealDates =
        previousMealDate.getDate() - currentMealDate.getDate()

      console.log('previous date', previousMealDate)
      console.log('current date', currentMealDate)

      console.log('difference', differenceMealDates)

      if (differenceMealDates > 1 || differenceMealDates < 0) {
        if (!sequences.length) {
          continue
        }

        if (
          sequences.some((sequence) =>
            sequence.some((meal) => meal.id === currentMeal.id),
          )
        ) {
          console.log('Meal is alredy in sequence array')

          continue
        }

        verifyIfCurrentMealIsInSequence(sequences, currentMeal)

        continue
      }

      let previousMealExistInArray = false

      sequences.forEach((sequence, iSequence) =>
        sequence.forEach((meal) => {
          if (meal.id === previousMeal.id) {
            console.log('added current')

            previousMealExistInArray = true
            sequences[iSequence].push(currentMeal)
          }
        }),
      )

      if (!previousMealExistInArray) {
        console.log('added both')

        sequences.push([previousMeal, currentMeal])
        continue
      }
    }

    if (!nextMeal.on_diet) {
      continue
    }

    const currentMealDate = new Date(
      new Date(currentMeal.schedule_at).setUTCHours(0, 0, 0, 0),
    )
    const nextMealDate = new Date(
      new Date(nextMeal.schedule_at).setUTCHours(0, 0, 0, 0),
    )

    const differenceMealDates =
      nextMealDate.getDate() - currentMealDate.getDate()

    console.log('current date', currentMealDate)
    console.log('next date', nextMealDate)
    console.log('difference', differenceMealDates)

    if (differenceMealDates > 1 || differenceMealDates < 0) {
      if (!sequences.length) {
        continue
      }

      if (
        sequences.some((sequence) =>
          sequence.some((meal) => meal.id === currentMeal.id),
        )
      ) {
        console.log('Meal is alredy in sequence array')

        continue
      }

      verifyIfCurrentMealIsInSequence(sequences, currentMeal)

      continue
    }

    let currentMealExistInArray = false

    sequences.forEach((sequence, iSequence) =>
      sequence.forEach((meal) => {
        if (meal.id === currentMeal.id) {
          console.log('added next')

          currentMealExistInArray = true
          sequences[iSequence].push(nextMeal)
        }
      }),
    )

    if (!currentMealExistInArray) {
      console.log('added both (next)')

      sequences.push([currentMeal, nextMeal])
      continue
    }
  }

  console.log(JSON.stringify(sequences))

  console.log('__________________________')

  let bestStrick: MealsSequences = []

  sequences.forEach((sequence) => {
    if (sequence.length >= bestStrick.length) {
      bestStrick = sequence
    }
  })

  return bestStrick
}
