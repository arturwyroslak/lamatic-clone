import { Context } from '../context'
import { generateToken, hashPassword, comparePassword } from '../utils/auth'
import { logger } from '../utils/logger'

export const authResolvers = {
  Mutation: {
    register: async (_: any, args: { input: { email: string; password: string; name: string } }, context: Context) => {
      try {
        const { email, password, name } = args.input
        
        const existingUser = await context.prisma.user.findUnique({
          where: { email }
        })
        
        if (existingUser) {
          throw new Error('User already exists')
        }
        
        const hashedPassword = await hashPassword(password)
        const user = await context.prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            name,
            role: 'USER'
          }
        })
        
        const token = await generateToken({
          userId: user.id,
          email: user.email,
          role: user.role
        })
        
        return {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        }
      } catch (error) {
        logger.error('Register error:', error)
        throw error
      }
    },
    
    login: async (_: any, args: { input: { email: string; password: string } }, context: Context) => {
      try {
        const { email, password } = args.input
        
        const user = await context.prisma.user.findUnique({
          where: { email }
        })
        
        if (!user || !await comparePassword(password, user.password)) {
          throw new Error('Invalid credentials')
        }
        
        const token = await generateToken({
          userId: user.id,
          email: user.email,
          role: user.role
        })
        
        return {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        }
      } catch (error) {
        logger.error('Login error:', error)
        throw error
      }
    }
  }
}
