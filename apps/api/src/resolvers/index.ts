import { userResolvers } from './user'
import { workspaceResolvers } from './workspace'
import { workflowResolvers } from './workflow'
import { deploymentResolvers } from './deployment'
import { integrationResolvers } from './integration'
import { executionResolvers } from './execution'
import { analyticsResolvers } from './analytics'
import { authResolvers } from './auth'

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...workspaceResolvers.Query,
    ...workflowResolvers.Query,
    ...deploymentResolvers.Query,
    ...integrationResolvers.Query,
    ...executionResolvers.Query,
    ...analyticsResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...workspaceResolvers.Mutation,
    ...workflowResolvers.Mutation,
    ...deploymentResolvers.Mutation,
    ...integrationResolvers.Mutation,
    ...executionResolvers.Mutation,
  },
  Subscription: {
    ...executionResolvers.Subscription,
    ...deploymentResolvers.Subscription,
  },
  // Type resolvers
  User: userResolvers.User,
  Workspace: workspaceResolvers.Workspace,
  Workflow: workflowResolvers.Workflow,
  Deployment: deploymentResolvers.Deployment,
  Execution: executionResolvers.Execution,
  Integration: integrationResolvers.Integration,
}