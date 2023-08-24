import { FastifyInstance } from 'fastify'

export const logoutRoute = async (app: FastifyInstance) => {
  app.post('/', async (req, res) => {
    try {
      res.clearCookie('user_id', { path: '/' })

      return res.send()
    } catch (error) {
      return res.status(500).send({ error })
    }
  })
}
