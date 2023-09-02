export type Meal = {
  id: string
  user_id: string
  name: string
  description?: string
  schedule_at: Date
  on_diet: boolean
  created_at: Date
  updated_at?: Date
}

export type MealsSequences = Array<Meal>
