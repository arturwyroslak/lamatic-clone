import { PrismaClient } from '@prisma/client'
import { Context } from '../context'

const prisma = new PrismaClient()

export const userResolvers = {
  Query: {
    me: async (_: any, __: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }
      
      return await prisma.user.findUnique({
        where: { id: context.user.id },
        include: {
          workspaces: {
            include: {
              workspace: true
            }
          }
        }
      })
    },

    user: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      return await prisma.user.findUnique({
        where: { id },
        include: {
          workspaces: {
            include: {
              workspace: true
            }
          }
        }
      })
    },

    users: async (_: any, { limit = 50, offset = 0 }: { limit?: number, offset?: number }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      return await prisma.user.findMany({
        take: limit,
        skip: offset,
        include: {
          workspaces: {
            include: {
              workspace: true
            }
          }
        }
      })
    }
  },

  Mutation: {
    updateUser: async (_: any, { input }: { input: any }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      return await prisma.user.update({
        where: { id: context.user.id },
        data: {
          name: input.name,
          email: input.email,
          avatar: input.avatar,
          bio: input.bio,
          timezone: input.timezone,
          preferences: input.preferences
        },
        include: {
          workspaces: {
            include: {
              workspace: true
            }
          }
        }
      })
    },

    deleteUser: async (_: any, __: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      await prisma.user.delete({
        where: { id: context.user.id }
      })

      return true
    }
  },

  User: {
    workspaces: async (parent: any) => {
      return await prisma.userWorkspace.findMany({
        where: { userId: parent.id },
        include: {
          workspace: true
        }
      }).then(results => results.map(r => r.workspace))
    },

    createdWorkflows: async (parent: any) => {
      return await prisma.workflow.findMany({
        where: { createdById: parent.id }
      })
    },

    apiKeys: async (parent: any, _: any, context: Context) => {
      if (!context.user || context.user.id !== parent.id) {
        throw new Error('Not authorized')
      }

      return await prisma.apiKey.findMany({
        where: { userId: parent.id }
      })
    }
  }
}