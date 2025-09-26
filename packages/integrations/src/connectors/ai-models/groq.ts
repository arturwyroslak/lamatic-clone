import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface GroqConfig extends ConnectionConfig {
  apiKey: string
  model?: string
  temperature?: number
  maxTokens?: number
  topP?: number
}

export class GroqConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'groq'
  public readonly name = 'Groq'
  public readonly description = 'Connect to Groq for ultra-fast LLM inference with their LPU technology'
  public readonly category = 'ai-models'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password' as const,
        required: true,
        description: 'Your Groq API key'
      },
      {
        key: 'model',
        label: 'Default Model',
        type: 'select' as const,
        required: false,
        options: [
          { value: 'llama2-70b-4096', label: 'Llama 2 70B' },
          { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
          { value: 'gemma-7b-it', label: 'Gemma 7B IT' },
          { value: 'llama3-8b-8192', label: 'Llama 3 8B' },
          { value: 'llama3-70b-8192', label: 'Llama 3 70B' }
        ],
        default: 'llama3-8b-8192',
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
        max: 32768,
        default: 1000,
        description: 'Maximum tokens to generate'
      }
    ]
  }

  async validateConnection(config: GroqConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        return {
          valid: false,
          error: `Groq API error: ${response.status} ${response.statusText}`
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

  async execute(input: any, config: GroqConfig, context: ExecutionContext): Promise<any> {
    try {
      const { 
        operation = 'chat',
        messages,
        prompt,
        model = config.model || 'llama3-8b-8192',
        temperature = config.temperature || 0.7,
        maxTokens = config.maxTokens || 1000,
        topP = config.topP || 1,
        stream = false,
        ...otherParams
      } = input

      // Convert prompt to messages format if needed
      const chatMessages = messages || (prompt ? [{ role: 'user', content: prompt }] : [])

      switch (operation) {
        case 'chat': {
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
              stream,
              ...otherParams
            })
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          if (stream) {
            // Return the response stream for streaming
            return {
              success: true,
              stream: response.body,
              headers: Object.fromEntries(response.headers.entries())
            }
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
            },
            performance: {
              tokensPerSecond: result.usage?.completion_tokens && result.usage?.total_time 
                ? result.usage.completion_tokens / result.usage.total_time 
                : null
            }
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
      maxConcurrency: 30,
      rateLimits: {
        requestsPerMinute: 30,
        tokensPerMinute: 30000
      },
      operations: [
        'chat'
      ],
      models: [
        'llama2-70b-4096',
        'mixtral-8x7b-32768',
        'gemma-7b-it',
        'llama3-8b-8192',
        'llama3-70b-8192'
      ]
    }
  }
}