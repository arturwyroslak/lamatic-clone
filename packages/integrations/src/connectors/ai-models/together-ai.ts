import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface TogetherAIConfig extends ConnectionConfig {
  apiKey: string
  model?: string
  temperature?: number
  maxTokens?: number
  topP?: number
  topK?: number
}

export class TogetherAIConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'together-ai'
  public readonly name = 'Together AI'
  public readonly description = 'Connect to Together AI for fast inference on open-source models'
  public readonly category = 'ai-models'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password' as const,
        required: true,
        description: 'Your Together AI API key'
      },
      {
        key: 'model',
        label: 'Default Model',
        type: 'select' as const,
        required: false,
        options: [
          { value: 'meta-llama/Llama-2-7b-chat-hf', label: 'Llama 2 7B Chat' },
          { value: 'meta-llama/Llama-2-13b-chat-hf', label: 'Llama 2 13B Chat' },
          { value: 'meta-llama/Llama-2-70b-chat-hf', label: 'Llama 2 70B Chat' },
          { value: 'mistralai/Mixtral-8x7B-Instruct-v0.1', label: 'Mixtral 8x7B Instruct' },
          { value: 'togethercomputer/RedPajama-INCITE-7B-Chat', label: 'RedPajama 7B Chat' },
          { value: 'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO', label: 'Nous Hermes 2 Mixtral' }
        ],
        default: 'meta-llama/Llama-2-7b-chat-hf',
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
        max: 8192,
        default: 1000,
        description: 'Maximum tokens to generate'
      }
    ]
  }

  async validateConnection(config: TogetherAIConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch('https://api.together.xyz/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        return {
          valid: false,
          error: `Together AI API error: ${response.status} ${response.statusText}`
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

  async execute(input: any, config: TogetherAIConfig, context: ExecutionContext): Promise<any> {
    try {
      const { 
        operation = 'chat',
        messages,
        prompt,
        model = config.model || 'meta-llama/Llama-2-7b-chat-hf',
        temperature = config.temperature || 0.7,
        maxTokens = config.maxTokens || 1000,
        topP = config.topP || 0.7,
        topK = config.topK || 50,
        stream = false,
        ...otherParams
      } = input

      switch (operation) {
        case 'chat': {
          // Convert messages format if using prompt
          const chatMessages = messages || (prompt ? [{ role: 'user', content: prompt }] : [])

          const response = await fetch('https://api.together.xyz/v1/chat/completions', {
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
              top_k: topK,
              stream,
              ...otherParams
            })
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Together AI API error: ${response.status} ${response.statusText} - ${errorText}`)
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
            }
          }
        }

        case 'completions': {
          const response = await fetch('https://api.together.xyz/v1/completions', {
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
              top_p: topP,
              top_k: topK,
              stream,
              ...otherParams
            })
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Together AI API error: ${response.status} ${response.statusText} - ${errorText}`)
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
            text: result.choices?.[0]?.text || '',
            usage: {
              promptTokens: result.usage?.prompt_tokens || 0,
              completionTokens: result.usage?.completion_tokens || 0,
              totalTokens: result.usage?.total_tokens || 0
            }
          }
        }

        case 'embed': {
          const response = await fetch('https://api.together.xyz/v1/embeddings', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${config.apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'togethercomputer/m2-bert-80M-8k-retrieval',
              input: Array.isArray(prompt) ? prompt : [prompt],
              ...otherParams
            })
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Together AI API error: ${response.status} ${response.statusText} - ${errorText}`)
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
        requestsPerMinute: 600,
        tokensPerMinute: 100000
      },
      operations: [
        'chat',
        'completions',
        'embed'
      ],
      models: [
        'meta-llama/Llama-2-7b-chat-hf',
        'meta-llama/Llama-2-13b-chat-hf',
        'meta-llama/Llama-2-70b-chat-hf',
        'mistralai/Mixtral-8x7B-Instruct-v0.1',
        'togethercomputer/RedPajama-INCITE-7B-Chat',
        'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO'
      ]
    }
  }
}