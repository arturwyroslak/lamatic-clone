import 'dotenv/config'
import Fastify from 'fastify'
import { ApolloServer } from '@apollo/server'
import fastifyApollo, { fastifyApolloDrainPlugin } from '@as-integrations/fastify'
import { buildSchema } from 'graphql'
import { readFileSync } from 'fs'
import { join } from 'path'
import { resolvers } from './resolvers'
import { createContext } from './context'
import { logger } from './utils/logger'

const typeDefs = readFileSync(
  join(__dirname, 'schema', 'schema.graphql'),
  'utf8'
)

const schema = buildSchema(typeDefs)

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [fastifyApolloDrainPlugin(fastify)],
  formatError: (error) => {
    logger.error('GraphQL Error:', error)
    return {
      message: error.message,
      code: error.extensions?.code,
      path: error.path,
    }
  },
})

const fastify = Fastify({
  logger: false,
})

// Register plugins
await fastify.register(import('@fastify/cors'), {
  origin: process.env.CORS_ORIGIN || true,
  credentials: true,
})

await fastify.register(import('@fastify/helmet'))

await fastify.register(import('@fastify/rate-limit'), {
  max: 1000,
  timeWindow: '1 minute',
})

// Register Apollo GraphQL
await server.start()
await fastify.register(fastifyApollo(server), {
  context: createContext,
  path: '/graphql',
})

// Health check endpoint
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '4000')
    const host = process.env.HOST || '0.0.0.0'
    
    await fastify.listen({ port, host })
    logger.info(`🚀 Server ready at http://${host}:${port}/graphql`)
  } catch (err) {
    logger.error('Error starting server:', err)
    process.exit(1)
  }
}

start()