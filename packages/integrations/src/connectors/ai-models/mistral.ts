import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface MistralConfig extends ConnectionConfig {
  apiKey: string
  model?: string
  temperature?: number
  maxTokens?: number
  topP?: number
}

export class MistralConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'mistral'
  public readonly name = 'Mistral AI'
  public readonly description = 'Connect to Mistral AI models for high-performance text generation'
  public readonly category = 'ai-models'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password' as const,
        required: true,
        description: 'Your Mistral AI API key'
      },
      {
        key: 'model',
        label: 'Default Model',
        type: 'select' as const,
        required: false,
        options: [
          { value: 'mistral-tiny', label: 'Mistral Tiny' },
          { value: 'mistral-small', label: 'Mistral Small' },
          { value: 'mistral-medium', label: 'Mistral Medium' },
          { value: 'mistral-large-latest', label: 'Mistral Large (Latest)' }
        ],
        default: 'mistral-small',
        description: 'Default model to use for completions'
      },
      {
        key: 'temperature',
        label: 'Temperature',
        type: 'number' as const,
        required: false,
        min: 0,
        max: 1,
        step: 0.1,
        default: 0.7,
        description: 'Sampling temperature (0-1)'
      },
      {
        key: 'maxTokens',
        label: 'Max Tokens',
        type: 'number' as const,
        required: false,
        min: 1,
        max: 32768,
        default: 1000,
        description: 'Maximum tokens to generate'
      }
    ]
  }

  async validateConnection(config: MistralConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch('https://api.mistral.ai/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        return {
          valid: false,
          error: `Mistral API error: ${response.status} ${response.statusText}`
        }
      }

      return { valid: true }
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown connection error'
      }
    }
  }

  async execute(input: any, config: MistralConfig, context: ExecutionContext): Promise<any> {
    try {
      const { 
        operation = 'chat',
        messages,
        prompt,
        model = config.model || 'mistral-small',
        temperature = config.temperature || 0.7,
        maxTokens = config.maxTokens || 1000,
        topP = config.topP || 1,
        ...otherParams
      } = input

      // Convert prompt to messages format if needed
      const chatMessages = messages || (prompt ? [{ role: 'user', content: prompt }] : [])

      switch (operation) {
        case 'chat': {
          const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${config.apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model,
              messages: chatMessages,
              temperature,
              max_tokens: maxTokens,
              top_p: topP,
              ...otherParams
            })
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Mistral API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            text: result.choices?.[0]?.message?.content || '',
            usage: {
              promptTokens: result.usage?.prompt_tokens || 0,
              completionTokens: result.usage?.completion_tokens || 0,
              totalTokens: result.usage?.total_tokens || 0
            }
          }
        }

        case 'embed': {
          const response = await fetch('https://api.mistral.ai/v1/embeddings', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${config.apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'mistral-embed',
              input: Array.isArray(prompt) ? prompt : [prompt],
              ...otherParams
            })
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Mistral API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            embeddings: result.data?.map((item: any) => item.embedding) || []
          }
        }

        default:
          throw new Error(`Unsupported operation: ${operation}`)
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
      supportsBatch: false,
      supportsStreaming: true,
      supportsFiles: false,
      maxConcurrency: 10,
      rateLimits: {
        requestsPerMinute: 1000,
        tokensPerMinute: 200000
      },
      operations: [
        'chat',
        'embed'
      ],
      models: [
        'mistral-tiny',
        'mistral-small',
        'mistral-medium',
        'mistral-large-latest'
      ]
    }
  }
}