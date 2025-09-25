import { PrismaClient } from '@prisma/client'
import { Context } from '../context'

const prisma = new PrismaClient()

export const workspaceResolvers = {
  Query: {
    workspace: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      const workspace = await prisma.workspace.findFirst({
        where: {
          id,
          members: {
            some: {
              userId: context.user.id
            }
          }
        },
        include: {
          members: {
            include: {
              user: true
            }
          },
          workflows: true,
          integrations: true
        }
      })

      if (!workspace) {
        throw new Error('Workspace not found or access denied')
      }

      return workspace
    },

    workspaces: async (_: any, { limit = 50, offset = 0 }: { limit?: number, offset?: number }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      return await prisma.workspace.findMany({
        where: {
          members: {
            some: {
              userId: context.user.id
            }
          }
        },
        take: limit,
        skip: offset,
        include: {
          members: {
            include: {
              user: true
            }
          },
          workflows: true,
          integrations: true
        }
      })
    }
  },

  Mutation: {
    createWorkspace: async (_: any, { input }: { input: any }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      const workspace = await prisma.workspace.create({
        data: {
          name: input.name,
          description: input.description,
          slug: input.slug,
          plan: input.plan || 'free',
          settings: input.settings || {},
          members: {
            create: {
              userId: context.user.id,
              role: 'owner'
            }
          }
        },
        include: {
          members: {
            include: {
              user: true
            }
          },
          workflows: true,
          integrations: true
        }
      })

      return workspace
    },

    updateWorkspace: async (_: any, { id, input }: { id: string, input: any }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      // Check if user has permission
      const membership = await prisma.userWorkspace.findFirst({
        where: {
          workspaceId: id,
          userId: context.user.id,
          role: { in: ['owner', 'admin'] }
        }
      })

      if (!membership) {
        throw new Error('Not authorized')
      }

      return await prisma.workspace.update({
        where: { id },
        data: {
          name: input.name,
          description: input.description,
          slug: input.slug,
          plan: input.plan,
          settings: input.settings
        },
        include: {
          members: {
            include: {
              user: true
            }
          },
          workflows: true,
          integrations: true
        }
      })
    },

    deleteWorkspace: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      // Check if user is owner
      const membership = await prisma.userWorkspace.findFirst({
        where: {
          workspaceId: id,
          userId: context.user.id,
          role: 'owner'
        }
      })

      if (!membership) {
        throw new Error('Only owners can delete workspaces')
      }

      await prisma.workspace.delete({
        where: { id }
      })

      return true
    },

    inviteToWorkspace: async (_: any, { workspaceId, email, role }: { workspaceId: string, email: string, role: string }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      // Check if user has permission
      const membership = await prisma.userWorkspace.findFirst({
        where: {
          workspaceId,
          userId: context.user.id,
          role: { in: ['owner', 'admin'] }
        }
      })

      if (!membership) {
        throw new Error('Not authorized')
      }

      // Find user by email
      const invitedUser = await prisma.user.findUnique({
        where: { email }
      })

      if (!invitedUser) {
        throw new Error('User not found')
      }

      // Check if already a member
      const existingMembership = await prisma.userWorkspace.findFirst({
        where: {
          workspaceId,
          userId: invitedUser.id
        }
      })

      if (existingMembership) {
        throw new Error('User is already a member')
      }

      // Create membership
      await prisma.userWorkspace.create({
        data: {
          workspaceId,
          userId: invitedUser.id,
          role
        }
      })

      return await prisma.workspace.findUnique({
        where: { id: workspaceId },
        include: {
          members: {
            include: {
              user: true
            }
          }
        }
      })
    },

    removeFromWorkspace: async (_: any, { workspaceId, userId }: { workspaceId: string, userId: string }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      // Check if user has permission
      const membership = await prisma.userWorkspace.findFirst({
        where: {
          workspaceId,
          userId: context.user.id,
          role: { in: ['owner', 'admin'] }
        }
      })

      if (!membership) {
        throw new Error('Not authorized')
      }

      await prisma.userWorkspace.delete({
        where: {
          userId_workspaceId: {
            userId,
            workspaceId
          }
        }
      })

      return true
    },

    updateWorkspaceMember: async (_: any, { workspaceId, userId, role }: { workspaceId: string, userId: string, role: string }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated')
      }

      // Check if user has permission
      const membership = await prisma.userWorkspace.findFirst({
        where: {
          workspaceId,
          userId: context.user.id,
          role: 'owner'
        }
      })

      if (!membership) {
        throw new Error('Only owners can update member roles')
      }

      await prisma.userWorkspace.update({
        where: {
          userId_workspaceId: {
            userId,
            workspaceId
          }
        },
        data: { role }
      })

      return await prisma.workspace.findUnique({
        where: { id: workspaceId },
        include: {
          members: {
            include: {
              user: true
            }
          }
        }
      })
    }
  },

  Workspace: {
    members: async (parent: any) => {
      const memberships = await prisma.userWorkspace.findMany({
        where: { workspaceId: parent.id },
        include: {
          user: true
        }
      })

      return memberships.map(m => ({
        user: m.user,
        role: m.role,
        joinedAt: m.createdAt
      }))
    },

    workflows: async (parent: any) => {
      return await prisma.workflow.findMany({
        where: { workspaceId: parent.id }
      })
    },

    integrations: async (parent: any) => {
      return await prisma.integration.findMany({
        where: { workspaceId: parent.id }
      })
    },

    deployments: async (parent: any) => {
      return await prisma.deployment.findMany({
        where: { workspaceId: parent.id }
      })
    },

    usage: async (parent: any) => {
      // Calculate usage metrics
      const executions = await prisma.execution.count({
        where: {
          workflow: {
            workspaceId: parent.id
          }
        }
      })

      const costs = await prisma.execution.aggregate({
        where: {
          workflow: {
            workspaceId: parent.id
          }
        },
        _sum: {
          cost: true
        }
      })

      return {
        executions,
        totalCost: costs._sum.cost || 0,
        period: 'current_month'
      }
    }
  }
}