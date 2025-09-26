import { EventEmitter } from 'events'
import { WorkflowDefinition, AgentConfig } from '../types'

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  author: {
    name: string
    avatar?: string
    verified: boolean
  }
  stats: {
    downloads: number
    rating: number
    reviews: number
    likes: number
  }
  thumbnail?: string
  screenshots?: string[]
  workflow: WorkflowDefinition
  requiredIntegrations: string[]
  version: string
  changelog?: string
  documentation?: string
  examples?: Array<{
    title: string
    description: string
    input: any
    expectedOutput: any
  }>
  metadata: {
    createdAt: Date
    updatedAt: Date
    featured: boolean
    verified: boolean
    industry?: string[]
    useCase?: string[]
  }
}

export interface TemplateCategory {
  id: string
  name: string
  description: string
  icon: string
  templateCount: number
  featured: boolean
}

export interface TemplateSearchFilters {
  category?: string
  tags?: string[]
  difficulty?: string
  industry?: string[]
  integrations?: string[]
  rating?: number
  featured?: boolean
  verified?: boolean
}

export interface TemplateSearchResult {
  templates: WorkflowTemplate[]
  totalCount: number
  categories: TemplateCategory[]
  facets: {
    categories: { [key: string]: number }
    tags: { [key: string]: number }
    industries: { [key: string]: number }
    integrations: { [key: string]: number }
  }
}

export class TemplateManager extends EventEmitter {
  private templates: Map<string, WorkflowTemplate> = new Map()
  private categories: Map<string, TemplateCategory> = new Map()

  constructor() {
    super()
    this.initializeDefaultTemplates()
  }

  // Initialize with default templates
  private initializeDefaultTemplates(): void {
    // Load default templates
    this.loadDefaultCategories()
    this.loadDefaultTemplates()
  }

  private loadDefaultCategories(): void {
    const defaultCategories: TemplateCategory[] = [
      {
        id: 'customer-support',
        name: 'Customer Support',
        description: 'Automated customer service and support workflows',
        icon: '🎧',
        templateCount: 8,
        featured: true
      },
      {
        id: 'content-creation',
        name: 'Content Creation',
        description: 'Content generation, editing, and optimization workflows',
        icon: '✍️',
        templateCount: 12,
        featured: true
      },
      {
        id: 'data-processing',
        name: 'Data Processing',
        description: 'Data extraction, transformation, and analysis workflows',
        icon: '📊',
        templateCount: 6,
        featured: true
      },
      {
        id: 'sales-marketing',
        name: 'Sales & Marketing',
        description: 'Lead generation, qualification, and marketing automation',
        icon: '📈',
        templateCount: 10,
        featured: true
      },
      {
        id: 'hr-recruitment', 
        name: 'HR & Recruitment',
        description: 'Resume screening, interview scheduling, and HR automation',
        icon: '👥',
        templateCount: 5,
        featured: false
      },
      {
        id: 'finance-accounting',
        name: 'Finance & Accounting',
        description: 'Invoice processing, expense reporting, and financial analysis',
        icon: '💰',
        templateCount: 4,
        featured: false
      }
    ]

    defaultCategories.forEach(category => {
      this.categories.set(category.id, category)
    })
  }

  private loadDefaultTemplates(): void {
    const defaultTemplates: WorkflowTemplate[] = [
      {
        id: 'customer-support-bot',
        name: 'AI Customer Support Bot',
        description: 'Intelligent customer support bot that can handle common inquiries, escalate complex issues, and maintain conversation context',
        category: 'customer-support',
        tags: ['chatbot', 'customer-service', 'automation', 'nlp'],
        difficulty: 'beginner',
        estimatedTime: '15 minutes',
        author: {
          name: 'Lamatic Team',
          verified: true
        },
        stats: {
          downloads: 1247,
          rating: 4.8,
          reviews: 89,
          likes: 234
        },
        workflow: {
          id: 'customer-support-workflow',
          name: 'Customer Support Workflow',
          description: 'Handle customer inquiries with AI',
          version: '1.0.0',
          nodes: [
            {
              id: 'start',
              type: 'start',
              position: { x: 100, y: 100 },
              data: { label: 'Customer Inquiry' }
            },
            {
              id: 'classify-intent',
              type: 'agent',
              position: { x: 300, y: 100 },
              data: {
                agentId: 'intent-classifier',
                model: 'gpt-4',
                systemPrompt: 'Classify customer inquiry intent and determine appropriate response'
              }
            },
            {
              id: 'generate-response',
              type: 'agent',
              position: { x: 500, y: 100 },
              data: {
                agentId: 'response-generator',
                model: 'gpt-4',
                systemPrompt: 'Generate helpful customer support response'
              }
            }
          ],
          connections: [
            { id: 'c1', source: 'start', target: 'classify-intent' },
            { id: 'c2', source: 'classify-intent', target: 'generate-response' }
          ]
        },
        requiredIntegrations: ['openai', 'slack'],
        version: '1.2.0',
        metadata: {
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-20'),
          featured: true,
          verified: true,
          industry: ['saas', 'ecommerce', 'support'],
          useCase: ['customer-support', 'automation']
        }
      },
      {
        id: 'content-generator',
        name: 'AI Content Generator',
        description: 'Multi-purpose content creation workflow for blogs, social media, and marketing materials',
        category: 'content-creation',
        tags: ['content', 'writing', 'marketing', 'seo'],
        difficulty: 'intermediate',
        estimatedTime: '20 minutes',
        author: {
          name: 'Content Pro',
          verified: true
        },
        stats: {
          downloads: 892,
          rating: 4.6,
          reviews: 67,
          likes: 189
        },
        workflow: {
          id: 'content-generator-workflow',
          name: 'Content Generation Workflow',
          description: 'Generate various types of content',
          version: '1.0.0',
          nodes: [
            {
              id: 'start',
              type: 'start', 
              position: { x: 100, y: 100 },
              data: { label: 'Content Brief' }
            },
            {
              id: 'research',
              type: 'integration',
              position: { x: 300, y: 100 },
              data: {
                connectorId: 'web-search',
                action: 'search'
              }
            },
            {
              id: 'generate-content',
              type: 'agent',
              position: { x: 500, y: 100 },
              data: {
                agentId: 'content-writer',
                model: 'gpt-4',
                systemPrompt: 'Create engaging content based on research and brief'
              }
            }
          ],
          connections: [
            { id: 'c1', source: 'start', target: 'research' },
            { id: 'c2', source: 'research', target: 'generate-content' }
          ]
        },
        requiredIntegrations: ['openai', 'web-search', 'google-drive'],
        version: '1.1.0',
        metadata: {
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-18'),
          featured: true,
          verified: true,
          industry: ['marketing', 'media', 'agency'],
          useCase: ['content-creation', 'seo', 'marketing']
        }
      },
      {
        id: 'lead-qualification',
        name: 'Lead Qualification System',
        description: 'Automated lead scoring and qualification workflow with CRM integration',
        category: 'sales-marketing',
        tags: ['sales', 'leads', 'crm', 'qualification'],
        difficulty: 'advanced',
        estimatedTime: '30 minutes',
        author: {
          name: 'Sales Automation',
          verified: true
        },
        stats: {
          downloads: 543,
          rating: 4.9,
          reviews: 34,
          likes: 127
        },
        workflow: {
          id: 'lead-qualification-workflow',
          name: 'Lead Qualification Workflow',
          description: 'Score and qualify incoming leads',
          version: '1.0.0',
          nodes: [
            {
              id: 'start',
              type: 'start',
              position: { x: 100, y: 100 },
              data: { label: 'New Lead' }
            },
            {
              id: 'enrich-data',
              type: 'integration',
              position: { x: 300, y: 100 },
              data: {
                connectorId: 'clearbit',
                action: 'enrich_person'
              }
            },
            {
              id: 'score-lead',
              type: 'agent',
              position: { x: 500, y: 100 },
              data: {
                agentId: 'lead-scorer',
                model: 'gpt-4',
                systemPrompt: 'Score lead based on enriched data and qualification criteria'
              }
            },
            {
              id: 'update-crm',
              type: 'integration',
              position: { x: 700, y: 100 },
              data: {
                connectorId: 'salesforce',
                action: 'update_lead'
              }
            }
          ],
          connections: [
            { id: 'c1', source: 'start', target: 'enrich-data' },
            { id: 'c2', source: 'enrich-data', target: 'score-lead' },
            { id: 'c3', source: 'score-lead', target: 'update-crm' }
          ]
        },
        requiredIntegrations: ['openai', 'salesforce', 'clearbit'],
        version: '2.0.0',
        metadata: {
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-22'),
          featured: true,
          verified: true,
          industry: ['saas', 'b2b', 'sales'],
          useCase: ['lead-generation', 'sales-automation', 'crm']
        }
      }
    ]

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template)
    })
  }

  // Search templates
  async searchTemplates(
    query?: string,
    filters: TemplateSearchFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<TemplateSearchResult> {
    let filteredTemplates = Array.from(this.templates.values())

    // Apply text search
    if (query) {
      const searchTerm = query.toLowerCase()
      filteredTemplates = filteredTemplates.filter(template =>
        template.name.toLowerCase().includes(searchTerm) ||
        template.description.toLowerCase().includes(searchTerm) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    }

    // Apply filters
    if (filters.category) {
      filteredTemplates = filteredTemplates.filter(t => t.category === filters.category)
    }

    if (filters.difficulty) {
      filteredTemplates = filteredTemplates.filter(t => t.difficulty === filters.difficulty)
    }

    if (filters.tags && filters.tags.length > 0) {
      filteredTemplates = filteredTemplates.filter(t =>
        filters.tags!.some(tag => t.tags.includes(tag))
      )
    }

    if (filters.industry && filters.industry.length > 0) {
      filteredTemplates = filteredTemplates.filter(t =>
        filters.industry!.some(industry => t.metadata.industry?.includes(industry))
      )
    }

    if (filters.rating) {
      filteredTemplates = filteredTemplates.filter(t => t.stats.rating >= filters.rating!)
    }

    if (filters.featured !== undefined) {
      filteredTemplates = filteredTemplates.filter(t => t.metadata.featured === filters.featured)
    }

    if (filters.verified !== undefined) {
      filteredTemplates = filteredTemplates.filter(t => t.metadata.verified === filters.verified)
    }

    // Sort by relevance/popularity
    filteredTemplates.sort((a, b) => {
      if (a.metadata.featured && !b.metadata.featured) return -1
      if (!a.metadata.featured && b.metadata.featured) return 1
      return b.stats.downloads - a.stats.downloads
    })

    // Pagination
    const startIndex = (page - 1) * limit
    const paginatedTemplates = filteredTemplates.slice(startIndex, startIndex + limit)

    // Generate facets
    const facets = this.generateFacets(filteredTemplates)

    return {
      templates: paginatedTemplates,
      totalCount: filteredTemplates.length,
      categories: Array.from(this.categories.values()),
      facets
    }
  }

  // Get template by ID
  getTemplate(templateId: string): WorkflowTemplate | undefined {
    return this.templates.get(templateId)
  }

  // Get featured templates
  getFeaturedTemplates(limit: number = 6): WorkflowTemplate[] {
    return Array.from(this.templates.values())
      .filter(t => t.metadata.featured)
      .sort((a, b) => b.stats.downloads - a.stats.downloads)
      .slice(0, limit)
  }

  // Get templates by category
  getTemplatesByCategory(categoryId: string, limit?: number): WorkflowTemplate[] {
    const templates = Array.from(this.templates.values())
      .filter(t => t.category === categoryId)
      .sort((a, b) => b.stats.downloads - a.stats.downloads)

    return limit ? templates.slice(0, limit) : templates
  }

  // Install template (create workflow from template)
  async installTemplate(
    templateId: string,
    customizations?: {
      name?: string
      description?: string
      nodeUpdates?: Record<string, any>
    }
  ): Promise<WorkflowDefinition> {
    const template = this.templates.get(templateId)
    if (!template) {
      throw new Error(`Template ${templateId} not found`)
    }

    // Clone the workflow
    const workflow: WorkflowDefinition = {
      id: this.generateWorkflowId(),
      name: customizations?.name || `${template.name} (Copy)`,
      description: customizations?.description || template.description,
      version: '1.0.0',
      nodes: template.workflow.nodes.map(node => ({
        ...node,
        id: this.generateNodeId(),
        ...(customizations?.nodeUpdates?.[node.id] || {})
      })),
      connections: template.workflow.connections.map(conn => ({
        ...conn,
        id: this.generateConnectionId()
      }))
    }

    // Update template stats
    template.stats.downloads++
    this.emit('template:installed', { template, workflow })

    return workflow
  }

  // Add new template
  async addTemplate(template: Omit<WorkflowTemplate, 'id' | 'stats' | 'metadata'>): Promise<WorkflowTemplate> {
    const newTemplate: WorkflowTemplate = {
      ...template,
      id: this.generateTemplateId(),
      stats: {
        downloads: 0,
        rating: 0,
        reviews: 0,
        likes: 0
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        featured: false,
        verified: false,
        ...template.metadata
      }
    }

    this.templates.set(newTemplate.id, newTemplate)
    this.emit('template:added', newTemplate)

    return newTemplate
  }

  // Update template
  async updateTemplate(
    templateId: string,
    updates: Partial<WorkflowTemplate>
  ): Promise<WorkflowTemplate> {
    const template = this.templates.get(templateId)
    if (!template) {
      throw new Error(`Template ${templateId} not found`)
    }

    const updatedTemplate = {
      ...template,
      ...updates,
      metadata: {
        ...template.metadata,
        ...updates.metadata,
        updatedAt: new Date()
      }
    }

    this.templates.set(templateId, updatedTemplate)
    this.emit('template:updated', updatedTemplate)

    return updatedTemplate
  }

  // Delete template
  async deleteTemplate(templateId: string): Promise<void> {
    const template = this.templates.get(templateId)
    if (!template) {
      throw new Error(`Template ${templateId} not found`)
    }

    this.templates.delete(templateId)
    this.emit('template:deleted', template)
  }

  // Rate template
  async rateTemplate(templateId: string, rating: number): Promise<void> {
    const template = this.templates.get(templateId)
    if (!template) {
      throw new Error(`Template ${templateId} not found`)
    }

    // Simple rating calculation (would be more sophisticated in practice)
    const currentRating = template.stats.rating
    const currentReviews = template.stats.reviews
    const newRating = ((currentRating * currentReviews) + rating) / (currentReviews + 1)

    template.stats.rating = Math.round(newRating * 10) / 10
    template.stats.reviews++

    this.emit('template:rated', { template, rating })
  }

  // Like template
  async likeTemplate(templateId: string): Promise<void> {
    const template = this.templates.get(templateId)
    if (!template) {
      throw new Error(`Template ${templateId} not found`)
    }

    template.stats.likes++
    this.emit('template:liked', template)
  }

  // Private helper methods
  private generateFacets(templates: WorkflowTemplate[]) {
    const facets = {
      categories: {} as { [key: string]: number },
      tags: {} as { [key: string]: number },
      industries: {} as { [key: string]: number },
      integrations: {} as { [key: string]: number }
    }

    templates.forEach(template => {
      // Category facets
      facets.categories[template.category] = (facets.categories[template.category] || 0) + 1

      // Tag facets
      template.tags.forEach(tag => {
        facets.tags[tag] = (facets.tags[tag] || 0) + 1
      })

      // Industry facets
      template.metadata.industry?.forEach(industry => {
        facets.industries[industry] = (facets.industries[industry] || 0) + 1
      })

      // Integration facets
      template.requiredIntegrations.forEach(integration => {
        facets.integrations[integration] = (facets.integrations[integration] || 0) + 1
      })
    })

    return facets
  }

  private generateTemplateId(): string {
    return `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateWorkflowId(): string {
    return `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateNodeId(): string {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}