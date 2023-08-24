// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      diet_goal?: string
      email: string
      password: string
      created_at: Date
      updated_at?: Date
    }

    meals: {
      id: string
      user_id: string
      name: string
      description?: string
      schedule_at: Date
      on_diet: Boolean
      created_at: Date
      updated_at?: Date
    }
  }
}
