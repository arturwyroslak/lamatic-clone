import { Context } from '../context'

export const integrationResolvers = {
  Query: {
    availableIntegrations: async () => {
      return []
    },

    integrationsByCategory: async (_: any, { category }: { category: string }) => {
      return []
    },

    searchIntegrations: async (_: any, { query }: { query: string }) => {
      return []
    },

    integration: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      const integration = await context.prisma.integration.findFirst({
        where: {
          id,
          workspace: {
            members: {
              some: {
                userId: context.user.id
              }
            }
          }
        },
        include: {
          workspace: true,
          createdBy: true
        }
      })

      if (!integration) {
        throw new Error('Integration not found or access denied')
      }

      return integration
    },

    integrations: async (_: any, { 
      workspaceId, 
      category,
      status,
      limit = 50, 
      offset = 0 
    }: { 
      workspaceId?: string
      category?: string
      status?: string
      limit?: number
      offset?: number
    }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      const where: any = {
        workspace: {
          members: {
            some: {
              userId: context.user.id
            }
          }
        }
      }

      if (workspaceId) {
        where.workspaceId = workspaceId
      }

      if (category) {
        where.category = category
      }

      if (status) {
        where.status = status
      }

      return await context.prisma.integration.findMany({
        where,
        take: limit,
        skip: offset,
        include: {
          workspace: true,
          createdBy: true
        },
        orderBy: { createdAt: 'desc' }
      })
    }
  },

  Mutation: {
    createIntegration: async (_: any, { input }: { input: any }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      const workspace = await context.prisma.workspace.findFirst({
        where: {
          id: input.workspaceId,
          members: {
            some: {
              userId: context.user.id,
              role: { in: ['owner', 'admin', 'editor'] }
            }
          }
        }
      })

      if (!workspace) {
        throw new Error('Workspace not found or insufficient permissions')
      }

      const integration = await context.prisma.integration.create({
        data: {
          name: input.name,
          integrationId: input.integrationId,
          category: input.category,
          status: 'active',
          config: input.config || {},
          credentials: input.credentials || {},
          workspaceId: input.workspaceId,
          createdById: context.user.id
        },
        include: {
          workspace: true,
          createdBy: true
        }
      })

      return integration
    },

    testIntegration: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      const integration = await context.prisma.integration.findFirst({
        where: {
          id,
          workspace: {
            members: {
              some: {
                userId: context.user.id
              }
            }
          }
        }
      })

      if (!integration) {
        throw new Error('Integration not found or access denied')
      }

      const result = { success: true }

      await context.prisma.integration.update({
        where: { id },
        data: {
          status: result.success ? 'active' : 'error',
          lastTestedAt: new Date()
        }
      })

      return result
    }
  },

  Integration: {
    availableActions: async (parent: any) => {
      return []
    },

    usage: async (parent: any) => {
      return {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        successRate: 0
      }
    }
  }
}
