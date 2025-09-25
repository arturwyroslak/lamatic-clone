import { Context } from '../context'
import { logger } from '../utils/logger'

export const deploymentResolvers = {
  Query: {
    deployment: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      const deployment = await context.prisma.deployment.findFirst({
        where: {
          id,
          workflow: {
            workspace: {
              members: {
                some: {
                  userId: context.user.id
                }
              }
            }
          }
        },
        include: {
          workflow: true,
          createdBy: true
        }
      })

      if (!deployment) {
        throw new Error('Deployment not found or access denied')
      }

      return deployment
    },

    deployments: async (_: any, { 
      workflowId, 
      status,
      limit = 50, 
      offset = 0 
    }: { 
      workflowId?: string
      status?: string
      limit?: number
      offset?: number
    }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      const where: any = {
        workflow: {
          workspace: {
            members: {
              some: {
                userId: context.user.id
              }
            }
          }
        }
      }

      if (workflowId) {
        where.workflowId = workflowId
      }

      if (status) {
        where.status = status
      }

      return await context.prisma.deployment.findMany({
        where,
        take: limit,
        skip: offset,
        include: {
          workflow: true,
          createdBy: true
        },
        orderBy: { createdAt: 'desc' }
      })
    }
  },

  Mutation: {
    createDeployment: async (_: any, { input }: { input: any }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      try {
        const workflow = await context.prisma.workflow.findFirst({
          where: {
            id: input.workflowId,
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

        if (!workflow) {
          throw new Error('Workflow not found or insufficient permissions')
        }

        const deployment = await context.prisma.deployment.create({
          data: {
            name: input.name || `${workflow.name} - ${new Date().toISOString()}`,
            description: input.description,
            type: input.type || 'edge',
            status: 'deploying',
            config: input.config || {},
            workflowId: input.workflowId,
            createdById: context.user.id
          },
          include: {
            workflow: true,
            createdBy: true
          }
        })

        return deployment
      } catch (error) {
        logger.error('Deployment creation error:', error)
        throw error
      }
    }
  },

  Subscription: {
    deploymentStatusChanged: {
      subscribe: () => {
        return {
          [Symbol.asyncIterator]: async function* () {
            // Placeholder for subscription logic
          }
        }
      }
    }
  },

  Deployment: {
    logs: async (parent: any) => {
      return []
    },

    metrics: async (parent: any) => {
      return {
        requests: 0,
        errors: 0,
        averageResponseTime: 0,
        uptime: 100
      }
    }
  }
}
