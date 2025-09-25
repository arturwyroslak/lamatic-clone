export interface WorkerEnv {
  ENVIRONMENT: string
  DATABASE_URL?: string
  JWT_SECRET?: string
  API_URL?: string
  OPENAI_API_KEY?: string
  ANTHROPIC_API_KEY?: string
  SLACK_BOT_TOKEN?: string
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  input?: any
  output?: any
  error?: string
  createdAt: string
  updatedAt: string
}

export interface EdgeResponse {
  success: boolean
  data?: any
  error?: string
  timestamp: string
}

export interface GraphQLRequest {
  query: string
  variables?: Record<string, any>
  operationName?: string
}

export interface WebhookPayload {
  integrationId: string
  event: string
  data: any
  signature?: string
  timestamp: string
}

export interface WorkflowDefinition {
  id: string
  name: string
  nodes: WorkflowNode[]
  connections: WorkflowConnection[]
}

export interface WorkflowNode {
  id: string
  type: string
  data: any
  position: { x: number; y: number }
}

export interface WorkflowConnection {
  id: string
  source: string
  target: string
  type?: string
}

export interface ExecutionResult {
  success: boolean
  data?: any
  error?: string
  duration: number
}
