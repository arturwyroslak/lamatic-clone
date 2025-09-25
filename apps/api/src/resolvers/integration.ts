import { PrismaClient } from '@prisma/client'
import { Context } from '../context'
import { IntegrationManager } from '../../../packages/integrations/src/manager'

const prisma = new PrismaClient()
const integrationManager = new IntegrationManager()

export const integrationResolvers = {
  Query: {
    availableIntegrations: async () => {
      return integrationManager.getAvailableIntegrations()
    },

    integrationsByCategory: async (_: any, { category }: { category: string }) => {
      return integrationManager.getIntegrationsByCategory(category)
    },

    searchIntegrations: async (_: any, { query }: { query: string }) => {
      return integrationManager.searchIntegrations(query)
    },

    integration: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      const integration = await prisma.integration.findFirst({
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

      return await prisma.integration.findMany({
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

      // Check workspace access
      const workspace = await prisma.workspace.findFirst({
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

      // Create integration instance using IntegrationManager
      const connectorInstance = await integrationManager.createConnector(
        input.integrationId,
        input.workspaceId,
        input.name,
        input.config || {},
        input.credentials || {}
      )

      // Store in database
      const integration = await prisma.integration.create({
        data: {
          name: input.name,
          integrationId: input.integrationId,
          category: input.category,
          status: 'active',
          config: input.config || {},
          credentials: input.credentials || {}, // In real app, encrypt these
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

    updateIntegration: async (_: any, { id, input }: { id: string, input: any }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      // Check access
      const existingIntegration = await prisma.integration.findFirst({
        where: {
          id,
          workspace: {
            members: {
              some: {
                userId: context.user.id,
                role: { in: ['owner', 'admin', 'editor'] }
              }
            }
          }
        }
      })

      if (!existingIntegration) {
        throw new Error('Integration not found or insufficient permissions')
      }

      // Update connector instance
      if (input.config || input.credentials) {
        await integrationManager.updateConnector(id, {
          name: input.name,
          config: input.config,
          credentials: input.credentials
        })
      }

      // Update database record
      const integration = await prisma.integration.update({
        where: { id },
        data: {
          name: input.name,
          config: input.config || existingIntegration.config,
          credentials: input.credentials || existingIntegration.credentials,
          status: input.status || existingIntegration.status
        },
        include: {
          workspace: true,
          createdBy: true
        }
      })

      return integration
    },

    deleteIntegration: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      // Check access
      const integration = await prisma.integration.findFirst({
        where: {
          id,
          workspace: {
            members: {
              some: {
                userId: context.user.id,
                role: { in: ['owner', 'admin', 'editor'] }
              }
            }
          }
        }
      })

      if (!integration) {
        throw new Error('Integration not found or insufficient permissions')
      }

      // Delete connector instance
      await integrationManager.deleteConnector(id)

      // Delete database record
      await prisma.integration.delete({
        where: { id }
      })

      return true
    },

    testIntegration: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      // Check access
      const integration = await prisma.integration.findFirst({
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

      // Test connection using IntegrationManager
      const result = await integrationManager.testConnector(id)

      // Update integration status based on test result
      await prisma.integration.update({
        where: { id },
        data: {
          status: result.success ? 'active' : 'error',
          lastTestedAt: new Date()
        }
      })

      return result
    },

    executeIntegrationAction: async (_: any, { 
      integrationId, 
      action, 
      params 
    }: { 
      integrationId: string
      action: string
      params: Record<string, any>
    }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      // Check access
      const integration = await prisma.integration.findFirst({
        where: {
          id: integrationId,
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

      // Execute action using IntegrationManager
      const result = await integrationManager.executeAction(integrationId, action, params)

      // Log the execution
      await prisma.integrationExecution.create({
        data: {
          integrationId,
          action,
          params,
          result,
          status: 'completed',
          executedById: context.user.id
        }
      })

      return result
    }
  },

  Integration: {
    availableActions: async (parent: any) => {
      const connector = integrationManager.getConnector(parent.id)
      if (!connector) {
        return []
      }

      return connector.getAvailableActions ? connector.getAvailableActions() : []
    },

    executions: async (parent: any, { limit = 10, offset = 0 }: { limit?: number, offset?: number }) => {
      return await prisma.integrationExecution.findMany({
        where: { integrationId: parent.id },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          executedBy: true
        }
      })
    },

    usage: async (parent: any) => {
      const [totalExecutions, successfulExecutions, failedExecutions] = await Promise.all([
        prisma.integrationExecution.count({
          where: { integrationId: parent.id }
        }),
        prisma.integrationExecution.count({
          where: { 
            integrationId: parent.id,
            status: 'completed'
          }
        }),
        prisma.integrationExecution.count({
          where: { 
            integrationId: parent.id,
            status: 'failed'
          }
        })
      ])

      return {
        totalExecutions,
        successfulExecutions,
        failedExecutions,
        successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0
      }
    }
  }
}