import { z } from 'zod'

export enum IntegrationType {
  APP = 'app',
  DATA_SOURCE = 'data_source',
  MODEL = 'model',
  INTERFACE = 'interface',
  DEVELOPER_TOOL = 'developer_tool'
}

export enum IntegrationCategory {
  // Apps & Data Sources
  COMMUNICATION = 'communication',
  PRODUCTIVITY = 'productivity',
  STORAGE = 'storage',
  DATABASE = 'database',
  CRM = 'crm',
  PROJECT_MANAGEMENT = 'project_management',
  ECOMMERCE = 'ecommerce',
  AUTOMATION = 'automation',
  WEB_SCRAPING = 'web_scraping',
  
  // Models
  TEXT_GENERATION = 'text_generation',
  CHAT = 'chat',
  MULTIMODAL = 'multimodal',
  IMAGE_GENERATION = 'image_generation',
  AUDIO_TRANSCRIPT = 'audio_transcript',
  AUDIO_GENERATION = 'audio_generation',
  VIDEO = 'video',
  EMBEDDING = 'embedding',
  
  // Interfaces
  CHAT_WIDGET = 'chat_widget',
  SEARCH_WIDGET = 'search_widget',
  CUSTOM_WIDGET = 'custom_widget',
  
  // Developer Tools
  API = 'api',
  WEBHOOK = 'webhook',
  SDK = 'sdk'
}

export enum TriggerType {
  SYNC = 'sync_trigger',
  EVENT = 'event_trigger',
  ACTION = 'action'
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
  status: 'active' | 'beta' | 'deprecated'
  features: string[]
  triggers: TriggerType[]
  actions: string[]
  configSchema: z.ZodSchema
  credentialsSchema: z.ZodSchema
  setupInstructions: SetupInstruction[]
  documentation: string
  examples: IntegrationExample[]
}

export interface SetupInstruction {
  step: number
  title: string
  description: string
  code?: string
  image?: string
  links?: { text: string; url: string }[]
}

export interface IntegrationExample {
  name: string
  description: string
  config: Record<string, any>
  flowDefinition: Record<string, any>
}

export interface ModelProvider {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  website: string
  models: ModelConfig[]
  apiKeyRequired: boolean
  setupInstructions: SetupInstruction[]
  features: string[]
  pricing: PricingInfo
}

export interface ModelConfig {
  id: string
  name: string
  type: ModelType
  contextLength: number
  maxTokens: number
  inputPricing: number
  outputPricing: number
  features: ModelFeature[]
  capabilities: string[]
}

export enum ModelType {
  TEXT = 'text',
  CHAT = 'chat',
  MULTIMODAL = 'multimodal',
  IMAGE_GENERATION = 'image_generation',
  AUDIO_TRANSCRIPT = 'audio_transcript',
  AUDIO_GENERATION = 'audio_generation',
  VIDEO = 'video',
  EMBEDDING = 'embedding'
}

export enum ModelFeature {
  FUNCTION_CALLING = 'function_calling',
  STRUCTURED_OUTPUT = 'structured_output',
  VISION = 'vision',
  CODE_GENERATION = 'code_generation',
  REASONING = 'reasoning',
  FAST_INFERENCE = 'fast_inference'
}

export interface PricingInfo {
  type: 'free' | 'freemium' | 'paid'
  freeCredits?: number
  plans: PricingPlan[]
}

export interface PricingPlan {
  name: string
  price: number
  period: 'monthly' | 'yearly'
  features: string[]
  limits: Record<string, number>
}