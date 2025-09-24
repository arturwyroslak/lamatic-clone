import type { WorkerEnv, WorkflowDefinition, ExecutionResult } from '../types'

export class WorkflowExecutor {
  constructor(private env: WorkerEnv) {}

  async execute(workflow: any, input: any): Promise<ExecutionResult> {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const startTime = Date.now()
    
    try {
      console.log(`Executing workflow ${workflow.id} with input:`, input)
      
      const definition = workflow.definition as WorkflowDefinition
      const context = {
        input,
        variables: {},
        nodeOutputs: new Map<string, any>()
      }
      
      // Find trigger node
      const triggerNode = definition.nodes.find(node => 
        node.data.type === 'trigger'
      )
      
      if (!triggerNode) {
        throw new Error('No trigger node found in workflow')
      }
      
      // Execute workflow starting from trigger
      const result = await this.executeNode(triggerNode, definition, context)
      
      const duration = Date.now() - startTime
      
      return {
        id: executionId,
        status: 'success',
        output: result,
        duration,
        timestamp: new Date().toISOString()
      }
      
    } catch (error) {
      const duration = Date.now() - startTime
      
      return {
        id: executionId,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
        timestamp: new Date().toISOString()
      }
    }
  }
  
  private async executeNode(
    node: any,
    definition: WorkflowDefinition,
    context: any
  ): Promise<any> {
    console.log(`Executing node ${node.id} of type ${node.data.type}`)
    
    let result: any
    
    switch (node.data.type) {
      case 'trigger':
        result = await this.executeTriggerNode(node, context)
        break
      case 'llm':
        result = await this.executeLLMNode(node, context)
        break
      case 'action':
        result = await this.executeActionNode(node, context)
        break
      case 'data':
        result = await this.executeDataNode(node, context)
        break
      case 'processor':
        result = await this.executeProcessorNode(node, context)
        break
      default:
        throw new Error(`Unknown node type: ${node.data.type}`)
    }
    
    // Store node output
    context.nodeOutputs.set(node.id, result)
    
    // Find and execute next nodes
    const nextConnections = definition.connections?.filter(
      conn => conn.source === node.id
    ) || []
    
    if (nextConnections.length > 0) {
      // Execute next nodes
      const nextResults = await Promise.all(
        nextConnections.map(async (conn) => {
          const nextNode = definition.nodes.find(n => n.id === conn.target)
          if (!nextNode) {
            throw new Error(`Target node ${conn.target} not found`)
          }
          return this.executeNode(nextNode, definition, context)
        })
      )
      
      // Return the last result or combined results
      return nextResults.length === 1 ? nextResults[0] : nextResults
    }
    
    return result
  }
  
  private async executeTriggerNode(node: any, context: any): Promise<any> {
    // Trigger nodes just pass through the input
    return context.input
  }
  
  private async executeLLMNode(node: any, context: any): Promise<any> {
    const config = node.data.config || {}
    const previousOutput = Array.from(context.nodeOutputs.values()).pop()
    
    // Determine which LLM provider to use
    const provider = this.getLLMProvider(node.type || config.model)
    
    switch (provider) {
      case 'openai':
        return this.executeOpenAINode(config, previousOutput)
      case 'anthropic':
        return this.executeAnthropicNode(config, previousOutput)
      case 'google':
        return this.executeGoogleAINode(config, previousOutput)
      default:
        throw new Error(`Unsupported LLM provider: ${provider}`)
    }
  }
  
  private async executeOpenAINode(config: any, input: any): Promise<any> {
    const prompt = typeof input === 'string' ? input : JSON.stringify(input)
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model || 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 1000
      })
    })
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.choices[0]?.message?.content || 'No response generated'
  }
  
  private async executeAnthropicNode(config: any, input: any): Promise<any> {
    const prompt = typeof input === 'string' ? input : JSON.stringify(input)
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.env.ANTHROPIC_API_KEY,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: config.model || 'claude-3-sonnet-20240229',
        max_tokens: config.maxTokens || 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    })
    
    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.content[0]?.text || 'No response generated'
  }
  
  private async executeGoogleAINode(config: any, input: any): Promise<any> {
    // Implement Google AI API integration
    throw new Error('Google AI integration not yet implemented')
  }
  
  private async executeActionNode(node: any, context: any): Promise<any> {
    const config = node.data.config || {}
    const previousOutput = Array.from(context.nodeOutputs.values()).pop()
    
    // Determine action type
    const actionType = node.type || config.type
    
    switch (actionType) {
      case 'slack-action':
        return this.executeSlackAction(config, previousOutput)
      case 'email-action':
        return this.executeEmailAction(config, previousOutput)
      case 'webhook-action':
        return this.executeWebhookAction(config, previousOutput)
      default:
        throw new Error(`Unsupported action type: ${actionType}`)
    }
  }
  
  private async executeSlackAction(config: any, input: any): Promise<any> {
    const message = typeof input === 'string' ? input : JSON.stringify(input)
    
    if (!this.env.SLACK_BOT_TOKEN) {
      throw new Error('Slack bot token not configured')
    }
    
    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.env.SLACK_BOT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        channel: config.channel || '#general',
        text: message,
        thread_ts: config.threadTs
      })
    })
    
    if (!response.ok) {
      throw new Error(`Slack API error: ${response.statusText}`)
    }
    
    const data = await response.json()
    return { messageId: data.ts, channel: data.channel }
  }
  
  private async executeEmailAction(config: any, input: any): Promise<any> {
    // Implement email sending (using SendGrid, SES, etc.)
    throw new Error('Email action not yet implemented')
  }
  
  private async executeWebhookAction(config: any, input: any): Promise<any> {
    const payload = typeof input === 'object' ? input : { data: input }
    
    const response = await fetch(config.url, {
      method: config.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      },
      body: JSON.stringify(payload)
    })
    
    if (!response.ok) {
      throw new Error(`Webhook error: ${response.statusText}`)
    }
    
    return response.json().catch(() => ({ status: 'sent' }))
  }
  
  private async executeDataNode(node: any, context: any): Promise<any> {
    // Implement data source integrations
    const config = node.data.config || {}
    const dataType = node.type || config.type
    
    switch (dataType) {
      case 'vector-search':
        return this.executeVectorSearch(config, context)
      default:
        throw new Error(`Unsupported data node type: ${dataType}`)
    }
  }
  
  private async executeVectorSearch(config: any, context: any): Promise<any> {
    // Implement vector database search
    const query = Array.from(context.nodeOutputs.values()).pop()
    
    // This would integrate with Weaviate or other vector DB
    console.log('Vector search query:', query)
    return { results: [], similarity: 0.8 }
  }
  
  private async executeProcessorNode(node: any, context: any): Promise<any> {
    const config = node.data.config || {}
    const previousOutput = Array.from(context.nodeOutputs.values()).pop()
    const processorType = node.type || config.type
    
    switch (processorType) {
      case 'text-processor':
        return this.processText(config, previousOutput)
      case 'json-processor':
        return this.processJSON(config, previousOutput)
      case 'filter':
        return this.filterData(config, previousOutput)
      default:
        throw new Error(`Unsupported processor type: ${processorType}`)
    }
  }
  
  private processText(config: any, input: any): any {
    let text = typeof input === 'string' ? input : JSON.stringify(input)
    
    if (config.operation === 'uppercase') {
      text = text.toUpperCase()
    } else if (config.operation === 'lowercase') {
      text = text.toLowerCase()
    } else if (config.operation === 'trim') {
      text = text.trim()
    }
    
    return text
  }
  
  private processJSON(config: any, input: any): any {
    try {
      const data = typeof input === 'string' ? JSON.parse(input) : input
      
      if (config.operation === 'extract' && config.path) {
        return this.extractFromPath(data, config.path)
      }
      
      return data
    } catch (error) {
      throw new Error(`JSON processing error: ${error}`)
    }
  }
  
  private filterData(config: any, input: any): any {
    if (!Array.isArray(input)) {
      return input
    }
    
    return input.filter(item => {
      // Simple filtering logic
      if (config.condition && config.value) {
        const fieldValue = this.extractFromPath(item, config.field)
        
        switch (config.condition) {
          case 'equals':
            return fieldValue === config.value
          case 'contains':
            return String(fieldValue).includes(config.value)
          case 'greater_than':
            return Number(fieldValue) > Number(config.value)
          default:
            return true
        }
      }
      
      return true
    })
  }
  
  private extractFromPath(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }
  
  private getLLMProvider(model: string): string {
    if (model.startsWith('gpt-') || model.includes('openai')) {
      return 'openai'
    } else if (model.startsWith('claude-') || model.includes('anthropic')) {
      return 'anthropic'
    } else if (model.startsWith('gemini-') || model.includes('google')) {
      return 'google'
    }
    
    return 'openai' // default
  }
}