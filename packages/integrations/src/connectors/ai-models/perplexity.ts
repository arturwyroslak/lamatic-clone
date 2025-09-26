import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface PerplexityConfig extends ConnectionConfig {
  apiKey: string
  model?: string
}

export class PerplexityConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'perplexity'
  public readonly name = 'Perplexity AI'
  public readonly description = 'Connect to Perplexity AI for search-enhanced conversational AI'
  public readonly category = 'ai-models'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password' as const,
        required: true,
        description: 'Your Perplexity AI API key'
      },
      {
        key: 'model',
        label: 'Default Model',
        type: 'select' as const,
        required: false,
        options: [
          { value: 'llama-3.1-sonar-small-128k-online', label: 'Llama 3.1 Sonar Small (Online)' },
          { value: 'llama-3.1-sonar-large-128k-online', label: 'Llama 3.1 Sonar Large (Online)' },
          { value: 'llama-3.1-sonar-huge-128k-online', label: 'Llama 3.1 Sonar Huge (Online)' },
          { value: 'llama-3.1-sonar-small-128k-chat', label: 'Llama 3.1 Sonar Small (Chat)' },
          { value: 'llama-3.1-sonar-large-128k-chat', label: 'Llama 3.1 Sonar Large (Chat)' }
        ],
        default: 'llama-3.1-sonar-small-128k-online',
        description: 'Default model to use for completions'
      }
    ]
  }

  async validateConnection(config: PerplexityConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: config.model || 'llama-3.1-sonar-small-128k-online',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 1
        })
      })

      if (!response.ok) {
        return {
          valid: false,
          error: `Perplexity API error: ${response.status} ${response.statusText}`
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

  async execute(input: any, config: PerplexityConfig, context: ExecutionContext): Promise<any> {
    try {
      const { 
        operation = 'chat',
        messages,
        prompt,
        model = config.model || 'llama-3.1-sonar-small-128k-online',
        temperature = 0.2,
        maxTokens = 1000,
        topP = 0.9,
        stream = false,
        ...otherParams
      } = input

      // Convert prompt to messages format if needed
      const chatMessages = messages || (prompt ? [{ role: 'user', content: prompt }] : [])

      switch (operation) {
        case 'chat': {
          const response = await fetch('https://api.perplexity.ai/chat/completions', {
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
            throw new Error(`Perplexity API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          if (stream) {
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
            citations: result.citations || []
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
        requestsPerMinute: 60,
        requestsPerHour: 5000
      },
      operations: [
        'chat'
      ],
      models: [
        'llama-3.1-sonar-small-128k-online',
        'llama-3.1-sonar-large-128k-online',
        'llama-3.1-sonar-huge-128k-online',
        'llama-3.1-sonar-small-128k-chat',
        'llama-3.1-sonar-large-128k-chat'
      ],
      features: [
        'search-enhanced',
        'real-time-information',
        'citations'
      ]
    }
  }
}