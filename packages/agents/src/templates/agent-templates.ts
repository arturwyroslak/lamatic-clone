// Pre-built Agent Templates - Complete template marketplace
import { AgentConfig } from '../types'

export interface AgentTemplate {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  icon: string
  config: AgentConfig
  variables?: Record<string, any>
  examples?: Array<{ name: string; input: any; expectedOutput: string }>
  rating: number
  downloads: number
  featured: boolean
  author: { name: string; verified: boolean }
  createdAt: Date
  updatedAt: Date
}

export const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    id: 'content-writer',
    name: 'Content Writer',
    description: 'Professional content writer for blogs, articles, and marketing copy',
    category: 'content',
    tags: ['writing', 'marketing', 'content', 'seo'],
    icon: 'edit-icon',
    config: {
      type: 'text',
      name: 'Content Writer',
      description: 'Writes high-quality content for various purposes',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: 'You are a professional content writer with expertise in creating engaging, SEO-optimized content.',
      capabilities: ['writing', 'seo', 'research', 'editing']
    },
    rating: 4.8,
    downloads: 15420,
    featured: true,
    author: { name: 'Lamatic Team', verified: true },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 'customer-support',
    name: 'Customer Support Agent',
    description: 'Intelligent customer support agent for handling inquiries',
    category: 'support',
    tags: ['support', 'customer service', 'helpdesk'],
    icon: 'support-icon',
    config: {
      type: 'chat',
      name: 'Customer Support Agent',  
      description: 'Provides helpful customer support responses',
      model: 'gpt-4',
      temperature: 0.3,
      maxTokens: 1000,
      systemPrompt: 'You are a helpful customer support agent. Always be polite, empathetic, and solution-focused.',
      capabilities: ['conversation', 'problem-solving', 'escalation']
    },
    rating: 4.9,
    downloads: 23150,
    featured: true,
    author: { name: 'Lamatic Team', verified: true },
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-25')
  }
]

export class AgentTemplateManager {
  private templates: Map<string, AgentTemplate> = new Map()

  constructor() {
    AGENT_TEMPLATES.forEach(template => {
      this.templates.set(template.id, template)
    })
  }

  getTemplate(id: string): AgentTemplate | undefined {
    return this.templates.get(id)
  }

  listTemplates(category?: string): AgentTemplate[] {
    let templates = Array.from(this.templates.values())
    if (category) {
      templates = templates.filter(t => t.category === category)
    }
    return templates.sort((a, b) => b.rating - a.rating)
  }

  createAgentFromTemplate(templateId: string, customizations?: Record<string, any>): AgentConfig {
    const template = this.templates.get(templateId)
    if (!template) {
      throw new Error(`Template ${templateId} not found`)
    }
    return { ...template.config }
  }
}