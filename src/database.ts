import { knex as setupKnex, Knex } from 'knex'

export const config: Knex.Config = {
  client: 'sqlite',
  connection: {
    filename: '../db/app.db',
  },
  useNullAsDefault: true, // o sqlite não aceita inserir valores padrão nos campos de uma tabelas, então essa linha permite que o bd insira por padrão valores nulos se o valor não for especificado
  migrations: {
    extension: 'ts',
    directory: 'db/migrations',
  },
}

export const knex = setupKnex(config)
