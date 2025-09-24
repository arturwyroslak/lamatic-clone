import { FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from './utils/auth'
import { logger } from './utils/logger'

const prisma = new PrismaClient()

export interface Context {
  prisma: PrismaClient
  user?: {
    id: string
    email: string
    role: string
  }
  req: FastifyRequest
}

export async function createContext({ request }: { request: FastifyRequest }): Promise<Context> {
  let user = undefined

  try {
    const authorization = request.headers.authorization
    if (authorization) {
      const token = authorization.replace('Bearer ', '')
      const payload = await verifyToken(token)
      
      if (payload) {
        const userData = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: { id: true, email: true, role: true }
        })
        
        if (userData) {
          user = userData
        }
      }
    }
  } catch (error) {
    logger.warn('Invalid token:', error)
  }

  return {
    prisma,
    user,
    req: request,
  }
}