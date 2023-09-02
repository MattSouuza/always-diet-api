// eslint-disable-next-line
import { Knex } from 'knex'
import { Meal } from './meal'
import { User } from './user'

declare module 'knex/types/tables' {
  export interface Tables {
    users: User
    meals: Meal
  }
}
