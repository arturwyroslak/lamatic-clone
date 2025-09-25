import { Context } from '../context'
import { logger } from '../utils/logger'

export const executionResolvers = {
  Query: {
    execution: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      const execution = await context.prisma.execution.findFirst({
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
          triggeredBy: true
        }
      })

      if (!execution) {
        throw new Error('Execution not found or access denied')
      }

      return execution
    },

    executions: async (_: any, { 
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

      return await context.prisma.execution.findMany({
        where,
        take: limit,
        skip: offset,
        include: {
          workflow: true,
          triggeredBy: true
        },
        orderBy: { createdAt: 'desc' }
      })
    }
  },

  Mutation: {
    executeWorkflow: async (_: any, { workflowId, input }: { workflowId: string, input?: any }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      try {
        const workflow = await context.prisma.workflow.findFirst({
          where: {
            id: workflowId,
            workspace: {
              members: {
                some: {
                  userId: context.user.id
                }
              }
            }
          }
        })

        if (!workflow) {
          throw new Error('Workflow not found or access denied')
        }

        const execution = await context.prisma.execution.create({
          data: {
            status: 'running',
            input: input || {},
            workflowId,
            triggeredById: context.user.id
          },
          include: {
            workflow: true,
            triggeredBy: true
          }
        })

        return execution
      } catch (error) {
        logger.error('Workflow execution error:', error)
        throw error
      }
    }
  },

  Subscription: {
    executionStatusChanged: {
      subscribe: () => {
        return {
          [Symbol.asyncIterator]: async function* () {
            // Placeholder for subscription logic
          }
        }
      }
    }
  },

  Execution: {
    steps: async (parent: any) => {
      return []
    },

    logs: async (parent: any) => {
      return []
    }
  }
}
