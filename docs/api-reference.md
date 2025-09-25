# API Reference

This document describes the GraphQL API endpoints, schema, and usage examples for the Lamatic Clone platform.

## Base URL

- **Development**: `http://localhost:4000/graphql`
- **Production**: `https://your-domain.com/graphql`

## Authentication

All API requests require authentication via JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## GraphQL Schema Overview

### Core Types

#### User
```graphql
type User {
  id: ID!
  email: String!
  name: String!
  role: UserRole!
  createdAt: DateTime!
  updatedAt: DateTime!
  workspaces: [WorkspaceMember!]!
}

enum UserRole {
  USER
  ADMIN
  SUPER_ADMIN
}
```

#### Workspace
```graphql
type Workspace {
  id: ID!
  name: String!
  description: String
  plan: WorkspacePlan!
  createdAt: DateTime!
  updatedAt: DateTime!
  members: [WorkspaceMember!]!
  workflows: [Workflow!]!
  integrations: [Integration!]!
}

enum WorkspacePlan {
  FREE
  PRO
  ENTERPRISE
}
```

#### Workflow
```graphql
type Workflow {
  id: ID!
  name: String!
  description: String
  status: WorkflowStatus!
  definition: JSON!
  version: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
  publishedAt: DateTime
  workspace: Workspace!
  createdBy: User!
  executions: [Execution!]!
  deployments: [Deployment!]!
}

enum WorkflowStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

#### Integration
```graphql
type Integration {
  id: ID!
  name: String!
  integrationId: String!
  category: IntegrationCategory!
  status: IntegrationStatus!
  config: JSON!
  credentials: JSON!
  createdAt: DateTime!
  updatedAt: DateTime!
  lastTestedAt: DateTime
  workspace: Workspace!
  createdBy: User!
}

enum IntegrationCategory {
  AI_MODEL
  DATABASE
  COMMUNICATION
  STORAGE
  CRM
  PAYMENT
  ANALYTICS
  UTILITY
}

enum IntegrationStatus {
  ACTIVE
  INACTIVE
  ERROR
}
```

## Queries

### Authentication

#### Login
```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) {
    token
    user {
      id
      email
      name
      role
    }
  }
}
```

**Variables:**
```json
{
  "input": {
    "email": "user@example.com",
    "password": "password123"
  }
}
```

#### Register
```graphql
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    token
    user {
      id
      email
      name
      role
    }
  }
}
```

### Workspaces

#### Get User Workspaces
```graphql
query GetUserWorkspaces {
  userWorkspaces {
    id
    name
    description
    plan
    role
    workspace {
      id
      name
      membersCount
    }
  }
}
```

#### Create Workspace
```graphql
mutation CreateWorkspace($input: CreateWorkspaceInput!) {
  createWorkspace(input: $input) {
    id
    name
    description
    plan
  }
}
```

### Workflows

#### Get Workspace Workflows
```graphql
query GetWorkspaceWorkflows($workspaceId: ID!, $limit: Int, $offset: Int) {
  workflows(workspaceId: $workspaceId, limit: $limit, offset: $offset) {
    id
    name
    description
    status
    version
    createdAt
    updatedAt
    createdBy {
      name
    }
  }
}
```

#### Create Workflow
```graphql
mutation CreateWorkflow($input: CreateWorkflowInput!) {
  createWorkflow(input: $input) {
    id
    name
    description
    status
    definition
  }
}
```

#### Update Workflow
```graphql
mutation UpdateWorkflow($id: ID!, $input: UpdateWorkflowInput!) {
  updateWorkflow(id: $id, input: $input) {
    id
    name
    description
    definition
    version
    updatedAt
  }
}
```

### Integrations

#### Get Available Integrations
```graphql
query GetAvailableIntegrations($category: IntegrationCategory) {
  availableIntegrations(category: $category) {
    id
    name
    description
    category
    icon
    features
    configSchema
  }
}
```

#### Create Integration
```graphql
mutation CreateIntegration($input: CreateIntegrationInput!) {
  createIntegration(input: $input) {
    id
    name
    integrationId
    category
    status
    config
  }
}
```

#### Test Integration
```graphql
mutation TestIntegration($id: ID!) {
  testIntegration(id: $id) {
    success
    message
    data
  }
}
```

### Executions

#### Execute Workflow
```graphql
mutation ExecuteWorkflow($workflowId: ID!, $input: JSON) {
  executeWorkflow(workflowId: $workflowId, input: $input) {
    id
    status
    input
    createdAt
    workflow {
      name
    }
  }
}
```

#### Get Workflow Executions
```graphql
query GetWorkflowExecutions($workflowId: ID!, $limit: Int, $offset: Int) {
  executions(workflowId: $workflowId, limit: $limit, offset: $offset) {
    id
    status
    input
    output
    error
    duration
    createdAt
    triggeredBy {
      name
    }
  }
}
```

## Subscriptions

### Real-time Updates

#### Workflow Execution Status
```graphql
subscription WorkflowExecutionStatus($workflowId: ID!) {
  workflowExecutionStatus(workflowId: $workflowId) {
    executionId
    status
    progress
    currentStep
    error
  }
}
```

#### Deployment Status
```graphql
subscription DeploymentStatusChanged($deploymentId: ID!) {
  deploymentStatusChanged(deploymentId: $deploymentId) {
    id
    status
    message
    progress
  }
}
```

## Error Handling

### Error Response Format
```json
{
  "errors": [
    {
      "message": "Error description",
      "extensions": {
        "code": "ERROR_CODE",
        "path": ["fieldName"]
      }
    }
  ]
}
```

### Common Error Codes
- `UNAUTHENTICATED`: No valid authentication token
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input data
- `INTERNAL_ERROR`: Server error

## Rate Limiting

API requests are rate limited to:
- **Free Plan**: 1000 requests/hour
- **Pro Plan**: 10000 requests/hour  
- **Enterprise Plan**: 100000 requests/hour

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Pagination

Use `limit` and `offset` parameters for pagination:

```graphql
query GetWorkflows($limit: Int = 20, $offset: Int = 0) {
  workflows(limit: $limit, offset: $offset) {
    # ... fields
  }
}
```

## Usage Examples

### JavaScript/TypeScript (Apollo Client)

```typescript
import { ApolloClient, InMemoryCache, gql } from '@apollo/client'

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
  headers: {
    authorization: `Bearer ${token}`
  }
})

// Execute a query
const GET_WORKFLOWS = gql`
  query GetWorkflows($workspaceId: ID!) {
    workflows(workspaceId: $workspaceId) {
      id
      name
      status
    }
  }
`

const { data } = await client.query({
  query: GET_WORKFLOWS,
  variables: { workspaceId: 'workspace-id' }
})
```

### cURL Examples

```bash
# Login
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation Login($input: LoginInput!) { login(input: $input) { token user { id name } } }",
    "variables": {
      "input": {
        "email": "user@example.com",
        "password": "password123"
      }
    }
  }'

# Get workflows (with auth token)
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "query GetWorkflows($workspaceId: ID!) { workflows(workspaceId: $workspaceId) { id name status } }",
    "variables": {
      "workspaceId": "workspace-id"
    }
  }'
```

For more detailed examples and advanced usage, see the [Integration Guide](./integrations.md).
