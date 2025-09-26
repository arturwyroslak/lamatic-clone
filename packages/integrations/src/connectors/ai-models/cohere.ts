import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface CohereConfig extends ConnectionConfig {
  apiKey: string
  model?: string
  temperature?: number
  maxTokens?: number
  version?: string
}

export class CohereConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'cohere'
  public readonly name = 'Cohere'
  public readonly description = 'Connect to Cohere AI models for text generation, classification, and embeddings'
  public readonly category = 'ai-models'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password' as const,
        required: true,
        description: 'Your Cohere API key'
      },
      {
        key: 'model',
        label: 'Default Model',
        type: 'select' as const,
        required: false,
        options: [
          { value: 'command', label: 'Command' },
          { value: 'command-light', label: 'Command Light' },
          { value: 'command-nightly', label: 'Command Nightly' },
          { value: 'command-r', label: 'Command R' },
          { value: 'command-r-plus', label: 'Command R+' }
        ],
        default: 'command',
        description: 'Default model to use for completions'
      },
      {
        key: 'temperature',
        label: 'Temperature',
        type: 'number' as const,
        required: false,
        min: 0,
        max: 2,
        step: 0.1,
        default: 0.7,
        description: 'Sampling temperature (0-2)'
      },
      {
        key: 'maxTokens',
        label: 'Max Tokens',
        type: 'number' as const,
        required: false,
        min: 1,
        max: 4096,
        default: 1000,
        description: 'Maximum tokens to generate'
      }
    ]
  }

  async validateConnection(config: CohereConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      // Test the API key by making a simple request
      const response = await fetch('https://api.cohere.ai/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        return {
          valid: false,
          error: `Cohere API error: ${response.status} ${response.statusText}`
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

  async execute(input: any, config: CohereConfig, context: ExecutionContext): Promise<any> {
    try {
      const { 
        operation = 'generate',
        prompt,
        model = config.model || 'command',
        temperature = config.temperature || 0.7,
        maxTokens = config.maxTokens || 1000,
        ...otherParams
      } = input

      switch (operation) {
        case 'generate': {
          const response = await fetch('https://api.cohere.ai/v1/generate', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${config.apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model,
              prompt,
              temperature,
              max_tokens: maxTokens,
              ...otherParams
            })
          })

          if (!response.ok) {
            throw new Error(`Cohere API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            text: result.generations?.[0]?.text || '',
            usage: {
              promptTokens: result.meta?.billed_units?.input_tokens || 0,
              completionTokens: result.meta?.billed_units?.output_tokens || 0,
              totalTokens: (result.meta?.billed_units?.input_tokens || 0) + (result.meta?.billed_units?.output_tokens || 0)
            }
          }
        }

        case 'chat': {
          const response = await fetch('https://api.cohere.ai/v1/chat', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${config.apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model,
              message: prompt,
              temperature,
              max_tokens: maxTokens,
              ...otherParams
            })
          })

          if (!response.ok) {
            throw new Error(`Cohere API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            text: result.text || '',
            usage: {
              promptTokens: result.meta?.billed_units?.input_tokens || 0,
              completionTokens: result.meta?.billed_units?.output_tokens || 0,
              totalTokens: (result.meta?.billed_units?.input_tokens || 0) + (result.meta?.billed_units?.output_tokens || 0)
            }
          }
        }

        case 'embed': {
          const response = await fetch('https://api.cohere.ai/v1/embed', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${config.apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              texts: Array.isArray(prompt) ? prompt : [prompt],
              model: 'embed-english-v3.0',
              ...otherParams
            })
          })

          if (!response.ok) {
            throw new Error(`Cohere API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            embeddings: result.embeddings
          }
        }

        case 'classify': {
          const response = await fetch('https://api.cohere.ai/v1/classify', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${config.apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              inputs: Array.isArray(prompt) ? prompt : [prompt],
              ...otherParams
            })
          })

          if (!response.ok) {
            throw new Error(`Cohere API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            classifications: result.classifications
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
      supportsBatch: true,
      supportsStreaming: false,
      supportsFiles: false,
      maxConcurrency: 10,
      rateLimits: {
        requestsPerMinute: 10000,
        tokensPerMinute: 40000
      },
      operations: [
        'generate',
        'chat', 
        'embed',
        'classify'
      ],
      models: [
        'command',
        'command-light',
        'command-nightly',
        'command-r',
        'command-r-plus'
      ]
    }
  }
}