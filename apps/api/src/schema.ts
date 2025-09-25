import { makeExecutableSchema } from '@graphql-tools/schema'
import { resolvers } from './resolvers'

export const typeDefs = `#graphql
  # Scalars
  scalar DateTime
  scalar JSON
  scalar Upload

  # User and Authentication
  type User {
    id: ID!
    email: String!
    name: String
    avatar: String
    role: UserRole!
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    workspaces: [WorkspaceMember!]!
    ownedWorkspaces: [Workspace!]!
  }

  enum UserRole {
    USER
    ADMIN
    SUPER_ADMIN
  }

  # Workspace Management
  type Workspace {
    id: ID!
    name: String!
    slug: String!
    description: String
    logo: String
    plan: Plan!
    settings: JSON!
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    owner: User!
    members: [WorkspaceMember!]!
    workflows: [Workflow!]!
    agents: [Agent!]!
    connectors: [Connector!]!
    deployments: [Deployment!]!
  }

  type WorkspaceMember {
    id: ID!
    workspace: Workspace!
    user: User!
    role: WorkspaceMemberRole!
    joinedAt: DateTime!
  }

  enum Plan {
    FREE
    PRO
    ENTERPRISE
  }

  enum WorkspaceMemberRole {
    MEMBER
    ADMIN
    OWNER
  }

  # Workflows
  type Workflow {
    id: ID!
    name: String!
    description: String
    status: WorkflowStatus!
    version: Int!
    definition: JSON!
    config: JSON!
    isPublic: Boolean!
    tags: [String!]!
    createdAt: DateTime!
    updatedAt: DateTime!
    workspace: Workspace!
    author: User!
    executions: [WorkflowExecution!]!
    deployments: [Deployment!]!
    tests: [WorkflowTest!]!
  }

  enum WorkflowStatus {
    DRAFT
    ACTIVE
    PAUSED
    ARCHIVED
  }

  type WorkflowExecution {
    id: ID!
    workflow: Workflow!
    status: ExecutionStatus!
    input: JSON
    output: JSON
    error: String
    duration: Int
    tokensUsed: Int
    cost: Float
    metadata: JSON!
    startedAt: DateTime!
    completedAt: DateTime
    steps: [ExecutionStep!]!
    logs: [ExecutionLog!]!
  }

  type ExecutionStep {
    id: ID!
    execution: WorkflowExecution!
    nodeId: String!
    status: ExecutionStatus!
    input: JSON
    output: JSON
    error: String
    duration: Int
    tokensUsed: Int
    cost: Float
    startedAt: DateTime!
    completedAt: DateTime
  }

  type ExecutionLog {
    id: ID!
    execution: WorkflowExecution!
    level: LogLevel!
    message: String!
    metadata: JSON!
    createdAt: DateTime!
  }

  enum ExecutionStatus {
    PENDING
    RUNNING
    SUCCESS
    FAILED
    CANCELLED
  }

  enum LogLevel {
    DEBUG
    INFO
    WARN
    ERROR
  }

  type WorkflowTest {
    id: ID!
    workflow: Workflow!
    name: String!
    description: String
    input: JSON!
    expectedOutput: JSON
    status: TestStatus!
    lastRun: DateTime
    results: JSON
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum TestStatus {
    PENDING
    RUNNING
    PASSED
    FAILED
  }

  # AI Agents
  type Agent {
    id: ID!
    name: String!
    description: String
    type: AgentType!
    status: AgentStatus!
    systemPrompt: String!
    config: JSON!
    tools: [String!]!
    model: String!
    temperature: Float!
    maxTokens: Int!
    isPublic: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    workspace: Workspace!
    author: User!
    conversations: [AgentConversation!]!
  }

  enum AgentType {
    CONVERSATIONAL
    TASK_ORIENTED
    REACTIVE
    AUTONOMOUS
  }

  enum AgentStatus {
    DRAFT
    ACTIVE
    PAUSED
    ARCHIVED
  }

  type AgentConversation {
    id: ID!
    agent: Agent!
    sessionId: String!
    messages: [JSON!]!
    metadata: JSON!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Templates
  type Template {
    id: ID!
    name: String!
    description: String!
    category: String!
    tags: [String!]!
    definition: JSON!
    config: JSON!
    featured: Boolean!
    public: Boolean!
    downloads: Int!
    rating: Float
    createdAt: DateTime!
    updatedAt: DateTime!
    workspace: Workspace!
    author: User!
  }

  # Integrations
  type Connector {
    id: ID!
    name: String!
    integrationId: String!
    status: ConnectorStatus!
    config: JSON!
    lastSync: DateTime
    lastError: String
    createdAt: DateTime!
    updatedAt: DateTime!
    workspace: Workspace!
    dataSources: [DataSource!]!
  }

  enum ConnectorStatus {
    INACTIVE
    ACTIVE
    ERROR
    SYNCING
  }

  type DataSource {
    id: ID!
    name: String!
    type: DataSourceType!
    status: DataSourceStatus!
    config: JSON!
    metadata: JSON!
    indexedAt: DateTime
    recordCount: Int!
    size: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    workspace: Workspace!
    connector: Connector
    documents: [VectorDocument!]!
  }

  enum DataSourceType {
    FILE
    API
    DATABASE
    WEBHOOK
    RSS
    EMAIL
  }

  enum DataSourceStatus {
    PENDING
    INDEXING
    READY
    ERROR
  }

  type VectorDocument {
    id: ID!
    dataSource: DataSource!
    externalId: String
    title: String!
    content: String!
    metadata: JSON!
    checksum: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Deployments
  type Deployment {
    id: ID!
    workflow: Workflow!
    name: String!
    environment: DeploymentEnv!
    status: DeploymentStatus!
    config: JSON!
    url: String
    version: String!
    metadata: JSON!
    deployedAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
    workspace: Workspace!
  }

  enum DeploymentEnv {
    DEVELOPMENT
    STAGING
    PRODUCTION
  }

  enum DeploymentStatus {
    PENDING
    DEPLOYING
    ACTIVE
    FAILED
    STOPPED
  }

  # API Keys
  type ApiKey {
    id: ID!
    name: String!
    permissions: [String!]!
    lastUsed: DateTime
    expiresAt: DateTime
    isActive: Boolean!
    createdAt: DateTime!
    workspace: Workspace!
    user: User!
  }

  # Integration Registry
  type IntegrationConfig {
    id: String!
    name: String!
    description: String!
    category: String!
    icon: String!
    website: String
    documentation: String
    authType: String!
    requiredCredentials: [String!]!
    optionalCredentials: [String!]
    capabilities: [String!]!
    configSchema: JSON!
    isPopular: Boolean
    isPremium: Boolean
    tags: [String!]!
  }

  type ModelProvider {
    id: String!
    name: String!
    description: String!
    website: String!
    models: [Model!]!
  }

  type Model {
    id: String!
    name: String!
    type: String!
    contextWindow: Int!
    pricing: ModelPricing!
  }

  type ModelPricing {
    input: Float!
    output: Float!
  }

  # Input Types
  input CreateWorkspaceInput {
    name: String!
    description: String
    logo: String
  }

  input UpdateWorkspaceInput {
    name: String
    description: String
    logo: String
    settings: JSON
  }

  input CreateWorkflowInput {
    name: String!
    description: String
    definition: JSON!
    config: JSON
    tags: [String!]
  }

  input UpdateWorkflowInput {
    name: String
    description: String
    definition: JSON
    config: JSON
    status: WorkflowStatus
    tags: [String!]
  }

  input ExecuteWorkflowInput {
    input: JSON
    metadata: JSON
  }

  input CreateAgentInput {
    name: String!
    description: String
    type: AgentType!
    systemPrompt: String!
    config: JSON
    tools: [String!]
    model: String!
    temperature: Float
    maxTokens: Int
  }

  input UpdateAgentInput {
    name: String
    description: String
    systemPrompt: String
    config: JSON
    tools: [String!]
    model: String
    temperature: Float
    maxTokens: Int
    status: AgentStatus
  }

  input CreateConnectorInput {
    name: String!
    integrationId: String!
    config: JSON!
    credentials: JSON!
  }

  input UpdateConnectorInput {
    name: String
    config: JSON
    credentials: JSON
  }

  input CreateDeploymentInput {
    workflowId: ID!
    name: String!
    environment: DeploymentEnv!
    config: JSON
  }

  input ChatMessage {
    role: String!
    content: String!
  }

  input ChatInput {
    agentId: ID!
    sessionId: String
    messages: [ChatMessage!]!
  }

  # Queries
  type Query {
    # User & Auth
    me: User
    
    # Workspaces
    workspace(id: ID!): Workspace
    workspaces: [Workspace!]!
    
    # Workflows
    workflow(id: ID!): Workflow
    workflows(workspaceId: ID!): [Workflow!]!
    workflowExecution(id: ID!): WorkflowExecution
    workflowExecutions(workflowId: ID!): [WorkflowExecution!]!
    
    # Agents
    agent(id: ID!): Agent
    agents(workspaceId: ID!): [Agent!]!
    
    # Templates
    template(id: ID!): Template
    templates: [Template!]!
    featuredTemplates: [Template!]!
    
    # Integrations
    integrations: [IntegrationConfig!]!
    integration(id: String!): IntegrationConfig
    integrationsBy: [IntegrationConfig!]!
    modelProviders: [ModelProvider!]!
    
    # Connectors
    connector(id: ID!): Connector
    connectors(workspaceId: ID!): [Connector!]!
    
    # Data Sources
    dataSource(id: ID!): DataSource
    dataSources(workspaceId: ID!): [DataSource!]!
    
    # Deployments
    deployment(id: ID!): Deployment
    deployments(workspaceId: ID!): [Deployment!]!
    
    # API Keys
    apiKeys(workspaceId: ID!): [ApiKey!]!
  }

  # Mutations
  type Mutation {
    # Workspaces
    createWorkspace(input: CreateWorkspaceInput!): Workspace!
    updateWorkspace(id: ID!, input: UpdateWorkspaceInput!): Workspace!
    deleteWorkspace(id: ID!): Boolean!
    
    # Workflows
    createWorkflow(workspaceId: ID!, input: CreateWorkflowInput!): Workflow!
    updateWorkflow(id: ID!, input: UpdateWorkflowInput!): Workflow!
    deleteWorkflow(id: ID!): Boolean!
    executeWorkflow(id: ID!, input: ExecuteWorkflowInput!): WorkflowExecution!
    
    # Agents
    createAgent(workspaceId: ID!, input: CreateAgentInput!): Agent!
    updateAgent(id: ID!, input: UpdateAgentInput!): Agent!
    deleteAgent(id: ID!): Boolean!
    chatWithAgent(input: ChatInput!): AgentConversation!
    
    # Connectors
    createConnector(workspaceId: ID!, input: CreateConnectorInput!): Connector!
    updateConnector(id: ID!, input: UpdateConnectorInput!): Connector!
    deleteConnector(id: ID!): Boolean!
    testConnector(id: ID!): Boolean!
    syncConnector(id: ID!): Boolean!
    
    # Deployments
    createDeployment(input: CreateDeploymentInput!): Deployment!
    updateDeployment(id: ID!, status: DeploymentStatus!): Deployment!
    deleteDeployment(id: ID!): Boolean!
    
    # API Keys
    createApiKey(workspaceId: ID!, name: String!, permissions: [String!]!): ApiKey!
    revokeApiKey(id: ID!): Boolean!
  }

  # Subscriptions
  type Subscription {
    workflowExecutionUpdated(workflowId: ID!): WorkflowExecution!
    agentConversationUpdated(agentId: ID!): AgentConversation!
    deploymentStatusChanged(deploymentId: ID!): Deployment!
  }
`

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})