export interface WorkerEnv {
  ENVIRONMENT: string
  DATABASE_URL?: string
  JWT_SECRET?: string
  API_URL?: string
  GRAPHQL_API_URL?: string
  OPENAI_API_KEY?: string
  ANTHROPIC_API_KEY?: string
  SLACK_BOT_TOKEN?: string
  WEBHOOK_SECRET?: string
  
  // Cloudflare KV Namespaces
  CACHE?: KVNamespace
  WEBHOOKS_KV?: KVNamespace
  EXECUTIONS_KV?: KVNamespace
  LOGS_KV?: KVNamespace
  WIDGETS_KV?: KVNamespace
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

// Cloudflare Workers global types
declare global {
  interface ExecutionContext {
    waitUntil(promise: Promise<any>): void
    passThroughOnException(): void
  }

  // Remove conflicting WebSocketPair declaration - using Cloudflare types instead
  
  interface KVNamespace {
    get(key: string, options?: { type?: 'text' | 'json' | 'arrayBuffer' | 'stream' }): Promise<string | null>
    put(key: string, value: string | ArrayBuffer | ArrayBufferView | ReadableStream, options?: { expirationTtl?: number; metadata?: object }): Promise<void>
    delete(key: string): Promise<void>
    list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{ keys: { name: string }[]; list_complete: boolean; cursor?: string }>
  }

  // Remove conflicting ResponseInit extension - using Cloudflare types instead
}
