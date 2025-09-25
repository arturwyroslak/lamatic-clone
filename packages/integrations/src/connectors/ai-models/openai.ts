import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface OpenAIConfig extends ConnectionConfig {
  apiKey: string
  organization?: string
  model: string
  temperature?: number
  maxTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
}

export class OpenAIConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'openai'
  public readonly name = 'OpenAI'
  public readonly description = 'Connect to OpenAI GPT models for text generation, completion, and chat'
  public readonly category = 'ai-models'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password' as const,
        required: true,
        description: 'Your OpenAI API key from https://platform.openai.com/api-keys'
      },
      {
        key: 'organization',
        label: 'Organization ID',
        type: 'text' as const,
        required: false,
        description: 'Optional organization ID for API requests'
      },
      {
        key: 'model',
        label: 'Model',
        type: 'select' as const,
        required: true,
        options: [
          { value: 'gpt-4', label: 'GPT-4' },
          { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
          { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
          { value: 'text-davinci-003', label: 'Davinci-003' }
        ],
        default: 'gpt-4'
      },
      {
        key: 'temperature',
        label: 'Temperature',
        type: 'number' as const,
        required: false,
        default: 0.7,
        min: 0,
        max: 2,
        description: 'Controls randomness in responses'
      },
      {
        key: 'maxTokens',
        label: 'Max Tokens',
        type: 'number' as const,
        required: false,
        default: 1000,
        min: 1,
        max: 4096,
        description: 'Maximum number of tokens in response'
      }
    ]
  }

  async validateConnection(config: OpenAIConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'OpenAI-Organization': config.organization || ''
        }
      })

      if (!response.ok) {
        return { valid: false, error: `API Error: ${response.status} ${response.statusText}` }
      }

      return { valid: true }
    } catch (error) {
      return { valid: false, error: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` }
    }
  }

  async execute(input: any, config: OpenAIConfig, context: ExecutionContext): Promise<any> {
    const { prompt, messages } = input
    
    try {
      const endpoint = messages ? 'https://api.openai.com/v1/chat/completions' : 'https://api.openai.com/v1/completions'
      
      const requestBody = messages ? {
        model: config.model,
        messages: messages,
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 1000,
        top_p: config.topP || 1,
        frequency_penalty: config.frequencyPenalty || 0,
        presence_penalty: config.presencePenalty || 0
      } : {
        model: config.model,
        prompt: prompt,
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 1000,
        top_p: config.topP || 1,
        frequency_penalty: config.frequencyPenalty || 0,
        presence_penalty: config.presencePenalty || 0
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
          'OpenAI-Organization': config.organization || ''
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`OpenAI API Error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      
      return {
        success: true,
        data: result,
        usage: result.usage,
        model: config.model,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  }

  getCapabilities() {
    return {
      supportsBatch: true,
      supportsStreaming: true,
      supportsFiles: false,
      maxConcurrency: 10,
      rateLimits: {
        requestsPerMinute: 60,
        tokensPerMinute: 40000
      }
    }
  }
}