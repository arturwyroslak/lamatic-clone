import { PrismaClient } from '@prisma/client'
import { Context } from '../context'
import { withFilter, PubSub } from 'graphql-subscriptions'

const prisma = new PrismaClient()
const pubsub = new PubSub()

export const workflowResolvers = {
  Query: {
    workflow: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      const workflow = await prisma.workflow.findFirst({
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
          createdBy: true,
          versions: {
            orderBy: { version: 'desc' },
            take: 10
          },
          executions: {
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          deployments: true
        }
      })

      if (!workflow) {
        throw new Error('Workflow not found or access denied')
      }

      return workflow
    },

    workflows: async (_: any, { 
      workspaceId, 
      limit = 50, 
      offset = 0,
      status,
      search
    }: { 
      workspaceId?: string
      limit?: number
      offset?: number
      status?: string
      search?: string
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

      if (status) {
        where.status = status
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }

      return await prisma.workflow.findMany({
        where,
        take: limit,
        skip: offset,
        include: {
          workspace: true,
          createdBy: true,
          executions: {
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          _count: {
            select: {
              executions: true,
              versions: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' }
      })
    },

    workflowVersions: async (_: any, { workflowId }: { workflowId: string }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      // Check access
      const workflow = await prisma.workflow.findFirst({
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

      return await prisma.workflowVersion.findMany({
        where: { workflowId },
        orderBy: { version: 'desc' },
        include: {
          createdBy: true
        }
      })
    }
  },

  Mutation: {
    createWorkflow: async (_: any, { input }: { input: any }, context: Context) => {
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

      const workflow = await prisma.workflow.create({
        data: {
          name: input.name,
          description: input.description,
          definition: input.definition || { nodes: [], edges: [] },
          status: 'draft',
          workspaceId: input.workspaceId,
          createdById: context.user.id,
          versions: {
            create: {
              version: 1,
              definition: input.definition || { nodes: [], edges: [] },
              changelog: 'Initial version',
              createdById: context.user.id
            }
          }
        },
        include: {
          workspace: true,
          createdBy: true,
          versions: true
        }
      })

      // Publish to subscribers
      pubsub.publish('WORKFLOW_CREATED', {
        workflowCreated: workflow,
        workspaceId: input.workspaceId
      })

      return workflow
    },

    updateWorkflow: async (_: any, { id, input }: { id: string, input: any }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      // Check access
      const existingWorkflow = await prisma.workflow.findFirst({
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
        },
        include: {
          versions: {
            orderBy: { version: 'desc' },
            take: 1
          }
        }
      })

      if (!existingWorkflow) {
        throw new Error('Workflow not found or insufficient permissions')
      }

      const updateData: any = {
        updatedAt: new Date()
      }

      if (input.name) updateData.name = input.name
      if (input.description) updateData.description = input.description
      if (input.status) updateData.status = input.status

      let shouldCreateVersion = false
      
      if (input.definition) {
        updateData.definition = input.definition
        shouldCreateVersion = true
      }

      // Create new version if definition changed
      if (shouldCreateVersion) {
        const latestVersion = existingWorkflow.versions[0]
        const newVersion = (latestVersion?.version || 0) + 1

        await prisma.workflowVersion.create({
          data: {
            workflowId: id,
            version: newVersion,
            definition: input.definition,
            changelog: input.changelog || `Version ${newVersion}`,
            createdById: context.user.id
          }
        })
      }

      const workflow = await prisma.workflow.update({
        where: { id },
        data: updateData,
        include: {
          workspace: true,
          createdBy: true,
          versions: {
            orderBy: { version: 'desc' },
            take: 10
          }
        }
      })

      // Publish to subscribers
      pubsub.publish('WORKFLOW_UPDATED', {
        workflowUpdated: workflow,
        workspaceId: workflow.workspaceId
      })

      return workflow
    },

    deleteWorkflow: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      // Check access
      const workflow = await prisma.workflow.findFirst({
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

      if (!workflow) {
        throw new Error('Workflow not found or insufficient permissions')
      }

      await prisma.workflow.delete({
        where: { id }
      })

      // Publish to subscribers
      pubsub.publish('WORKFLOW_DELETED', {
        workflowDeleted: { id },
        workspaceId: workflow.workspaceId
      })

      return true
    },

    publishWorkflow: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      const workflow = await prisma.workflow.findFirst({
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

      if (!workflow) {
        throw new Error('Workflow not found or insufficient permissions')
      }

      const updatedWorkflow = await prisma.workflow.update({
        where: { id },
        data: { 
          status: 'published',
          publishedAt: new Date()
        },
        include: {
          workspace: true,
          createdBy: true
        }
      })

      // Publish to subscribers
      pubsub.publish('WORKFLOW_PUBLISHED', {
        workflowPublished: updatedWorkflow,
        workspaceId: updatedWorkflow.workspaceId
      })

      return updatedWorkflow
    },

    duplicateWorkflow: async (_: any, { id, name }: { id: string, name?: string }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      const originalWorkflow = await prisma.workflow.findFirst({
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
          versions: {
            orderBy: { version: 'desc' },
            take: 1
          }
        }
      })

      if (!originalWorkflow) {
        throw new Error('Workflow not found or access denied')
      }

      const latestVersion = originalWorkflow.versions[0]

      const duplicatedWorkflow = await prisma.workflow.create({
        data: {
          name: name || `${originalWorkflow.name} (Copy)`,
          description: originalWorkflow.description,
          definition: latestVersion?.definition || originalWorkflow.definition,
          status: 'draft',
          workspaceId: originalWorkflow.workspaceId,
          createdById: context.user.id,
          versions: {
            create: {
              version: 1,
              definition: latestVersion?.definition || originalWorkflow.definition,
              changelog: 'Duplicated from original workflow',
              createdById: context.user.id
            }
          }
        },
        include: {
          workspace: true,
          createdBy: true,
          versions: true
        }
      })

      return duplicatedWorkflow
    }
  },

  Subscription: {
    workflowUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['WORKFLOW_UPDATED', 'WORKFLOW_CREATED', 'WORKFLOW_DELETED', 'WORKFLOW_PUBLISHED']),
        (payload: any, variables: any) => {
          return payload.workspaceId === variables.workspaceId
        }
      )
    }
  },

  Workflow: {
    executions: async (parent: any, { limit = 10, offset = 0 }: { limit?: number, offset?: number }) => {
      return await prisma.execution.findMany({
        where: { workflowId: parent.id },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          triggeredBy: true
        }
      })
    },

    versions: async (parent: any, { limit = 10 }: { limit?: number }) => {
      return await prisma.workflowVersion.findMany({
        where: { workflowId: parent.id },
        take: limit,
        orderBy: { version: 'desc' },
        include: {
          createdBy: true
        }
      })
    },

    deployments: async (parent: any) => {
      return await prisma.deployment.findMany({
        where: { workflowId: parent.id },
        orderBy: { createdAt: 'desc' }
      })
    },

    metrics: async (parent: any) => {
      const [totalExecutions, successfulExecutions, avgDuration, totalCost] = await Promise.all([
        prisma.execution.count({
          where: { workflowId: parent.id }
        }),
        prisma.execution.count({
          where: { 
            workflowId: parent.id,
            status: 'completed'
          }
        }),
        prisma.execution.aggregate({
          where: { 
            workflowId: parent.id,
            status: 'completed'
          },
          _avg: {
            duration: true
          }
        }),
        prisma.execution.aggregate({
          where: { workflowId: parent.id },
          _sum: {
            cost: true
          }
        })
      ])

      return {
        totalExecutions,
        successfulExecutions,
        successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0,
        avgDuration: avgDuration._avg.duration || 0,
        totalCost: totalCost._sum.cost || 0
      }
    }
  }
}