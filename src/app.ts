import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { usersRoutes } from './routes/users'
import { mealsRoutes } from './routes/meals'
import { loginRoute } from './routes/login'
import { logoutRoute } from './routes/logout'

export const app = fastify()

app.register(cookie)

app.register(usersRoutes, {
  prefix: 'users',
})

app.register(mealsRoutes, {
  prefix: 'meals',
})

app.register(loginRoute, {
  prefix: 'login',
})

app.register(logoutRoute, {
  prefix: 'logout',
})
