import { Agent, AgentContext, ModelConfig } from '../types'

export class TextAgent {
  static create(config: {
    name: string
    description: string
    systemPrompt: string
    model: ModelConfig
    outputFormat?: 'plain' | 'markdown' | 'json' | 'xml'
    maxLength?: number
    style?: string
    tools?: string[]
    metadata?: Record<string, any>
  }): Agent {
    return {
      id: `text_agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: config.name,
      description: config.description,
      type: 'text',
      model: config.model,
      systemPrompt: config.systemPrompt,
      tools: config.tools || [],
      config: {
        outputFormat: config.outputFormat || 'plain',
        maxLength: config.maxLength || 2000,
        style: config.style || 'professional'
      },
      metadata: config.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  static async execute(agent: Agent, input: string, context: AgentContext): Promise<any> {
    // Validate input
    if (!input || typeof input !== 'string') {
      throw new Error('Text agent requires string input')
    }

    // Build prompt based on configuration
    const prompt = this.buildPrompt(agent, input, context)
    
    // Call the model (mock implementation)
    const response = await this.callModel(agent.model, prompt)
    
    // Format output based on configuration
    return this.formatOutput(response, agent.config.outputFormat)
  }

  private static buildPrompt(agent: Agent, input: string, context: AgentContext): string {
    let prompt = agent.systemPrompt + '\n\n'
    
    // Add style instructions
    if (agent.config.style) {
      prompt += `Writing style: ${agent.config.style}\n`
    }
    
    // Add output format instructions
    if (agent.config.outputFormat && agent.config.outputFormat !== 'plain') {
      prompt += `Output format: ${agent.config.outputFormat}\n`
    }
    
    // Add length constraint
    if (agent.config.maxLength) {
      prompt += `Maximum length: ${agent.config.maxLength} characters\n`
    }
    
    prompt += '\n'
    
    // Add context if available
    if (context.metadata && Object.keys(context.metadata).length > 0) {
      prompt += `Context: ${JSON.stringify(context.metadata)}\n\n`
    }
    
    // Add the user input
    prompt += `User request: ${input}`
    
    return prompt
  }

  private static async callModel(model: ModelConfig, prompt: string): Promise<string> {
    // Mock implementation - in real app, this would call the actual model API
    await new Promise(resolve => setTimeout(resolve, 100)) // Simulate API call
    
    return `Generated response for: ${prompt.substring(0, 100)}...`
  }

  private static formatOutput(response: string, format?: string): any {
    switch (format) {
      case 'json':
        try {
          return JSON.parse(response)
        } catch {
          return { content: response, format: 'json' }
        }
      
      case 'markdown':
        return {
          content: response,
          format: 'markdown',
          html: this.markdownToHtml(response)
        }
      
      case 'xml':
        return {
          content: response,
          format: 'xml',
          parsed: this.parseXml(response)
        }
      
      default:
        return {
          content: response,
          format: 'plain'
        }
    }
  }

  private static markdownToHtml(markdown: string): string {
    // Simple markdown to HTML conversion (in real app, would use a proper parser)
    return markdown
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/\n/gim, '<br>')
  }

  private static parseXml(xml: string): any {
    // Simple XML parsing (in real app, would use a proper XML parser)
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(xml, 'text/xml')
      return this.xmlToObject(doc.documentElement)
    } catch {
      return { raw: xml }
    }
  }

  private static xmlToObject(element: Element): any {
    const result: any = {}
    
    // Handle attributes
    if (element.attributes.length > 0) {
      result['@attributes'] = {}
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i]
        result['@attributes'][attr.name] = attr.value
      }
    }
    
    // Handle child elements
    if (element.children.length > 0) {
      for (let i = 0; i < element.children.length; i++) {
        const child = element.children[i]
        const childObj = this.xmlToObject(child)
        
        if (result[child.tagName]) {
          if (Array.isArray(result[child.tagName])) {
            result[child.tagName].push(childObj)
          } else {
            result[child.tagName] = [result[child.tagName], childObj]
          }
        } else {
          result[child.tagName] = childObj
        }
      }
    } else if (element.textContent) {
      return element.textContent
    }
    
    return result
  }

  // Template methods for common text agent types
  static createContentGenerator(config: {
    name: string
    model: ModelConfig
    contentType: 'blog' | 'email' | 'social' | 'marketing' | 'technical'
    tone?: 'professional' | 'casual' | 'friendly' | 'formal'
    audience?: string
  }): Agent {
    const systemPrompts = {
      blog: 'You are an expert blog writer. Create engaging, informative blog posts that captivate readers and provide value.',
      email: 'You are a professional email writer. Craft clear, concise, and effective emails for various purposes.',
      social: 'You are a social media content creator. Write engaging posts that drive engagement and build community.',
      marketing: 'You are a marketing copywriter. Create compelling copy that drives conversions and builds brand awareness.',
      technical: 'You are a technical writer. Create clear, accurate documentation and explanations of complex topics.'
    }

    return this.create({
      name: config.name,
      description: `Generate ${config.contentType} content with ${config.tone || 'professional'} tone`,
      systemPrompt: systemPrompts[config.contentType],
      model: config.model,
      outputFormat: 'markdown',
      style: config.tone || 'professional',
      metadata: {
        contentType: config.contentType,
        audience: config.audience
      }
    })
  }

  static createSummarizer(config: {
    name: string
    model: ModelConfig
    summaryLength: 'brief' | 'medium' | 'detailed'
    focusAreas?: string[]
  }): Agent {
    const lengthSettings = {
      brief: { maxLength: 500, description: 'brief summary' },
      medium: { maxLength: 1000, description: 'comprehensive summary' },
      detailed: { maxLength: 2000, description: 'detailed analysis' }
    }

    const setting = lengthSettings[config.summaryLength]
    let systemPrompt = `You are an expert summarizer. Create ${setting.description} that captures the key points and essential information.`
    
    if (config.focusAreas && config.focusAreas.length > 0) {
      systemPrompt += ` Pay special attention to: ${config.focusAreas.join(', ')}.`
    }

    return this.create({
      name: config.name,
      description: `Generate ${config.summaryLength} summaries`,
      systemPrompt,
      model: config.model,
      outputFormat: 'markdown',
      maxLength: setting.maxLength,
      metadata: {
        summaryType: config.summaryLength,
        focusAreas: config.focusAreas
      }
    })
  }

  static createTranslator(config: {
    name: string
    model: ModelConfig
    sourceLanguage?: string
    targetLanguage: string
    preserveFormatting?: boolean
  }): Agent {
    const systemPrompt = `You are a professional translator. Translate text ${config.sourceLanguage ? `from ${config.sourceLanguage} ` : ''}to ${config.targetLanguage} while maintaining accuracy, tone, and cultural context.${config.preserveFormatting ? ' Preserve the original formatting and structure.' : ''}`

    return this.create({
      name: config.name,
      description: `Translate text to ${config.targetLanguage}`,
      systemPrompt,
      model: config.model,
      outputFormat: config.preserveFormatting ? 'markdown' : 'plain',
      metadata: {
        sourceLanguage: config.sourceLanguage,
        targetLanguage: config.targetLanguage,
        preserveFormatting: config.preserveFormatting
      }
    })
  }
}