import { z } from 'zod'

export type IntegrationCategory = 
  | 'ai-models'
  | 'databases' 
  | 'communication'
  | 'storage'
  | 'crm'
  | 'payment'
  | 'analytics'
  | 'utilities'

export type IntegrationType = 'connector' | 'app' | 'model' | 'tool'

export type IntegrationStatus = 'active' | 'beta' | 'deprecated' | 'coming_soon'

export type TriggerType = 'webhook' | 'polling' | 'event_trigger' | 'action'

export interface SetupInstruction {
  step: number
  title: string
  description: string
  url?: string
}

export interface IntegrationConfig {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  type: IntegrationType
  category: IntegrationCategory
  provider: string
  version: string
  status: IntegrationStatus
  features: string[]
  triggers: TriggerType[]
  actions: string[]
  configSchema: any
  credentialsSchema: any
  setupInstructions: SetupInstruction[]
  documentation?: string
  examples: any[]
}

export interface ModelProvider {
  id: string
  name: string
  description: string
  models: ModelConfig[]
  authentication: AuthMethod
  rateLimit?: RateLimit
  pricing?: PricingInfo
}

export interface ModelConfig {
  id: string
  name: string
  description: string
  type: 'text' | 'image' | 'audio' | 'video' | 'embedding'
  maxTokens?: number
  supportedFeatures: string[]
  pricing?: ModelPricing
}

export interface AuthMethod {
  type: 'api_key' | 'oauth2' | 'bearer_token'
  fields: AuthField[]
}

export interface AuthField {
  name: string
  type: 'string' | 'password' | 'url'
  required: boolean
  description: string
}

export interface RateLimit {
  requests: number
  window: string
  burst?: number
}

export interface PricingInfo {
  model: 'pay_per_use' | 'subscription' | 'free'
  currency: string
  rates: PricingRate[]
}

export interface PricingRate {
  operation: string
  price: number
  unit: string
}

export interface ModelPricing {
  input?: number
  output?: number
  unit: string
}

// Connector specific interfaces
export interface ConnectorInstance {
  id: string
  integrationId: string
  name: string
  config: Record<string, any>
  credentials: Record<string, any>
  status: 'active' | 'inactive' | 'error'
  lastTested?: Date
  createdAt: Date
  updatedAt: Date
}

export interface ExecutionContext {
  workflowId: string
  executionId: string
  userId: string
  workspaceId: string
  variables: Record<string, any>
}

export interface ActionResult {
  success: boolean
  data?: any
  error?: string
  metadata?: Record<string, any>
}
