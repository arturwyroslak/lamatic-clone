// Marketplace templates and types for agent and workflow discovery

export interface MarketplaceItem {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  type: 'agent' | 'workflow' | 'integration'
  author: string
  version: string
  rating: number
  downloads: number
  featured: boolean
  public: boolean
  price?: number
  thumbnail?: string
  screenshots?: string[]
  documentation?: string
  license: string
  createdAt: Date
  updatedAt: Date
}

export interface MarketplaceAgent extends MarketplaceItem {
  type: 'agent'
  agentConfig: any
  capabilities: string[]
  supportedModels: string[]
  requiredTools: string[]
}

export interface MarketplaceWorkflow extends MarketplaceItem {
  type: 'workflow'
  workflowDefinition: any
  estimatedTime: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  useCases: string[]
  integrations: string[]
}

export interface MarketplaceIntegration extends MarketplaceItem {
  type: 'integration'
  connector: string
  supportedActions: string[]
  authType: string
  rateLimits?: {
    requests: number
    window: string
  }
}

export interface MarketplaceCategory {
  id: string
  name: string
  description: string
  icon: string
  itemCount: number
  featured: boolean
}

export interface MarketplaceFilters {
  category?: string
  type?: 'agent' | 'workflow' | 'integration'
  tags?: string[]
  author?: string
  featured?: boolean
  minRating?: number
  priceRange?: {
    min: number
    max: number
  }
  sortBy?: 'name' | 'rating' | 'downloads' | 'created' | 'updated'
  sortOrder?: 'asc' | 'desc'
}

export interface MarketplaceSearchResult {
  items: MarketplaceItem[]
  total: number
  page: number
  pageSize: number
  filters: MarketplaceFilters
}

// Export empty arrays for now - these can be populated with actual marketplace data
export const MARKETPLACE_AGENTS: MarketplaceAgent[] = []
export const MARKETPLACE_WORKFLOWS: MarketplaceWorkflow[] = []
export const MARKETPLACE_INTEGRATIONS: MarketplaceIntegration[] = []
export const MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
  {
    id: 'productivity',
    name: 'Productivity',
    description: 'Tools and agents to boost productivity',
    icon: 'productivity',
    itemCount: 0,
    featured: true
  },
  {
    id: 'content-creation',
    name: 'Content Creation',
    description: 'AI agents for writing, editing, and content generation',
    icon: 'content',
    itemCount: 0,
    featured: true
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis',
    description: 'Analytics and data processing workflows',
    icon: 'analytics',
    itemCount: 0,
    featured: true
  },
  {
    id: 'customer-service',
    name: 'Customer Service',
    description: 'Customer support automation and management',
    icon: 'support',
    itemCount: 0,
    featured: true
  }
]