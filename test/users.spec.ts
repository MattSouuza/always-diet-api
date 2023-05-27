import { afterAll, beforeAll, test, describe, expect, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('User routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  afterAll(async () => {
    await app.close()
  })

  test('Should create a new user', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'New user',
        dietGoal: 'Be fit',
        email: 'newuser@email.com',
        password: 'secretcredentions#%$',
      })
      .expect(201)
  })

  test('Should get a specific user', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'New user',
        dietGoal: 'Be fit',
        email: 'newuser@email.com',
        password: 'secretcredentions#%$',
      })
      .expect(201)

    const getUserResponse = await request(app.server)
      .get(`/users/${createUserResponse.body.user.id}`)
      .expect(200)

    expect(getUserResponse.body.user).toEqual(
      expect.objectContaining({
        name: 'New user',
        diet_goal: 'Be fit',
        email: 'newuser@email.com',
        password: 'secretcredentions#%$',
      }),
    )
  })
})
