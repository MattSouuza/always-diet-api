import { FastifyReply, FastifyRequest } from 'fastify'

export const checkUserIdExists = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  const userId = req?.cookies?.user_id

  if (!userId) {
    return reply.status(401).send({
      error: 'Unauthorized',
    })
  }
}
