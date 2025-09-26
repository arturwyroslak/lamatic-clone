import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface XAIConfig extends ConnectionConfig {
  apiKey: string
  model?: string
}

export class XAIConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'xai'
  public readonly name = 'xAI (Grok)'
  public readonly description = 'Connect to xAI Grok models for advanced reasoning and real-time information'
  public readonly category = 'ai-models'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password' as const,
        required: true,
        description: 'Your xAI API key'
      },
      {
        key: 'model',
        label: 'Default Model',
        type: 'select' as const,
        required: false,
        options: [
          { value: 'grok-beta', label: 'Grok Beta' },
          { value: 'grok-vision-beta', label: 'Grok Vision Beta' }
        ],
        default: 'grok-beta',
        description: 'Default Grok model to use'
      }
    ]
  }

  async validateConnection(config: XAIConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: config.model || 'grok-beta',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 1
        })
      })

      if (!response.ok) {
        return {
          valid: false,
          error: `xAI API error: ${response.status} ${response.statusText}`
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

  async execute(input: any, config: XAIConfig, context: ExecutionContext): Promise<any> {
    try {
      const { 
        operation = 'chat',
        messages,
        prompt,
        model = config.model || 'grok-beta',
        temperature = 0.7,
        maxTokens = 1000,
        topP = 1,
        stream = false,
        ...otherParams
      } = input

      // Convert prompt to messages format if needed
      const chatMessages = messages || (prompt ? [{ role: 'user', content: prompt }] : [])

      switch (operation) {
        case 'chat': {
          const response = await fetch('https://api.x.ai/v1/chat/completions', {
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
            throw new Error(`xAI API error: ${response.status} ${response.statusText} - ${errorText}`)
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
            finishReason: result.choices?.[0]?.finish_reason
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
        tokensPerMinute: 10000
      },
      operations: [
        'chat'
      ],
      models: [
        'grok-beta',
        'grok-vision-beta'
      ],
      features: [
        'real-time-information',
        'advanced-reasoning',
        'multimodal-vision'
      ]
    }
  }
}