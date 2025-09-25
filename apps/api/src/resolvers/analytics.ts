import { Context } from '../context'

export const analyticsResolvers = {
  Query: {
    workspaceAnalytics: async (_: any, { 
      workspaceId, 
      dateRange 
    }: { 
      workspaceId: string
      dateRange?: { from: Date, to: Date }
    }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      const workspace = await context.prisma.workspace.findFirst({
        where: {
          id: workspaceId,
          members: {
            some: {
              userId: context.user.id
            }
          }
        }
      })

      if (!workspace) {
        throw new Error('Workspace not found or access denied')
      }

      const dateFilter = dateRange ? {
        createdAt: {
          gte: dateRange.from,
          lte: dateRange.to
        }
      } : {}

      const totalWorkflows = await context.prisma.workflow.count({
        where: { workspaceId }
      })

      const activeWorkflows = await context.prisma.workflow.count({
        where: { 
          workspaceId,
          status: 'published'
        }
      })

      return {
        executions: {
          total: 0,
          successful: 0,
          failed: 0,
          successRate: 0
        },
        workflows: {
          total: totalWorkflows,
          active: activeWorkflows
        }
      }
    }
  }
}
