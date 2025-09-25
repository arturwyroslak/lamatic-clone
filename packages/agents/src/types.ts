// Core agent types for the Lamatic AI platform

// Workflow types
export interface WorkflowDefinition {
  id: string
  name: string
  description: string
  version: string
  nodes: WorkflowNode[]
  connections: WorkflowConnection[]
  settings?: WorkflowSettings
  metadata?: Record<string, any>
}

export interface WorkflowNode {
  id: string
  type: 'agent' | 'integration' | 'transform' | 'condition' | 'delay' | 'parallel' | 'start' | 'end'
  position: { x: number; y: number }
  data: Record<string, any>
  config?: Record<string, any>
}

export interface WorkflowConnection {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  type?: string
  data?: Record<string, any>
}

export interface WorkflowSettings {
  timeout?: number
  retryPolicy?: RetryPolicy
  errorHandling?: 'stop' | 'continue' | 'retry'
  parallelExecution?: boolean
}

export interface WorkflowContext {
  executionId: string
  workflowId: string
  userId: string
  workspaceId: string
  variables: Record<string, any>
  sessionId?: string
  metadata?: Record<string, any>
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'stopped'
  input: any
  output?: any
  error?: string
  startTime: Date
  endTime?: Date
  duration?: number
  context: WorkflowContext
  trace?: any[]
}

// Agent types
export interface Agent {
  id: string
  name: string
  description: string
  type: AgentType
  model: ModelConfig
  systemPrompt: string
  tools: string[]
  memory?: MemoryConfig
  config: AgentSpecificConfig
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export type AgentType = 
  | 'text' 
  | 'chat' 
  | 'multimodal' 
  | 'code' 
  | 'analysis' 
  | 'workflow'
  | 'strategy'
  | 'marketing'
  | 'optimization'
  | 'translation'
  | 'research'
  | 'productivity'
  | 'management'
  | 'customer-service'
  | 'content-creation'
  | 'data-processing'

export interface ModelConfig {
  provider: string
  model: string
  temperature?: number
  maxTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
  stopSequences?: string[]
}

export interface MemoryConfig {
  type: 'conversation' | 'vector' | 'context' | 'hybrid'
  maxSize?: number
  retentionDays?: number
  embeddings?: {
    provider: string
    model: string
    dimensions: number
  }
}

export interface AgentSpecificConfig {
  // Text agent config
  outputFormat?: 'plain' | 'markdown' | 'json' | 'xml'
  maxLength?: number
  style?: string
  
  // Chat agent config
  conversationHistory?: number
  contextWindow?: number
  personalityPrompt?: string
  
  // Multimodal agent config
  supportedMimeTypes?: string[]
  imageProcessing?: boolean
  audioProcessing?: boolean
  
  // Code agent config
  supportedLanguages?: string[]
  executionEnvironment?: string
  securityLevel?: 'sandbox' | 'restricted' | 'full'
  
  // Analysis agent config
  analyticsTypes?: string[]
  outputFormat?: string
  dataVisualization?: boolean
  
  // Workflow agent config
  maxSteps?: number
  parallelExecution?: boolean
  errorHandling?: 'stop' | 'continue' | 'retry'
}

export interface AgentConfig {
  name: string
  description: string
  type: AgentType
  model: ModelConfig | string  // Allow both ModelConfig object and string model ID
  systemPrompt: string
  temperature?: number  // Model temperature parameter
  maxTokens?: number   // Maximum tokens for generation
  tools?: string[]
  memory?: MemoryConfig
  config?: AgentSpecificConfig
  metadata?: Record<string, any>
}

export interface AgentExecution {
  id: string
  agentId: string
  input: any
  output?: any
  status: ExecutionStatus
  startTime: Date
  endTime?: Date
  duration?: number
  error?: string
  context: AgentContext
  metrics?: ExecutionMetrics
}

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

export interface AgentContext {
  sessionId: string
  userId?: string
  metadata: Record<string, any>
  tools: any
  memory: any
  environment?: 'development' | 'staging' | 'production'
  permissions?: string[]
}

export interface ExecutionMetrics {
  tokensUsed?: number
  cost?: number
  latency?: number
  toolCalls?: number
  memoryAccess?: number
  errors?: number
}

export interface Tool {
  id: string
  name: string
  description: string
  category: ToolCategory
  inputSchema: any
  outputSchema: any
  config: ToolConfig
  version: string
  isBuiltin: boolean
}

export type ToolCategory = 'search' | 'database' | 'api' | 'file' | 'code' | 'analysis' | 'communication' | 'utility'

export interface ToolConfig {
  authentication?: {
    type: 'apiKey' | 'oauth' | 'basic' | 'bearer'
    config: Record<string, any>
  }
  rateLimits?: {
    requests: number
    window: number
  }
  timeout?: number
  retries?: number
}

export interface ConversationMessage {
  id: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string | any
  timestamp: Date
  metadata?: Record<string, any>
  toolCalls?: ToolCall[]
}

export interface ToolCall {
  id: string
  toolId: string
  name: string
  arguments: Record<string, any>
  result?: any
  error?: string
  timestamp: Date
}

export interface AgentTemplate {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  config: AgentConfig
  rating: number
  downloads: number
  author: string
  version: string
  isOfficial: boolean
  featured: boolean
}

export interface AgentCollaboration {
  id: string
  name: string
  description: string
  agents: string[]
  type: 'sequential' | 'parallel' | 'hierarchical'
  config: CollaborationConfig
}

export interface CollaborationConfig {
  coordination?: {
    coordinatorId?: string
    strategy: 'round-robin' | 'expertise-based' | 'dynamic'
  }
  communication?: {
    protocol: 'direct' | 'broadcast' | 'hierarchical'
    format: 'text' | 'structured' | 'custom'
  }
  errorHandling?: {
    strategy: 'abort' | 'continue' | 'fallback'
    fallbackAgentId?: string
  }
}