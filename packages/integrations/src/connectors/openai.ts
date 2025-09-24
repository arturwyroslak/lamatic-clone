import { IntegrationConfig } from '../types'

export class OpenAIConnector {
  private config: IntegrationConfig
  private credentials: Record<string, any>

  constructor(config: IntegrationConfig, credentials: Record<string, any>) {
    this.config = config
    this.credentials = credentials
  }

  async test(): Promise<{ success: boolean; message?: string; details?: any }> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.credentials.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        return {
          success: true,
          message: 'Successfully connected to OpenAI',
          details: {
            models: data.data?.length || 0
          }
        }
      } else {
        const error = await response.json()
        return {
          success: false,
          message: `OpenAI API error: ${error.error?.message || 'Unknown error'}`,
          details: error
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error
      }
    }
  }

  async generateText(params: {
    model?: string
    prompt: string
    max_tokens?: number
    temperature?: number
    top_p?: number
    frequency_penalty?: number
    presence_penalty?: number
    stop?: string[]
  }): Promise<any> {
    try {
      const response = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.credentials.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: params.model || 'gpt-3.5-turbo-instruct',
          prompt: params.prompt,
          max_tokens: params.max_tokens || 1000,
          temperature: params.temperature || 0.7,
          top_p: params.top_p || 1,
          frequency_penalty: params.frequency_penalty || 0,
          presence_penalty: params.presence_penalty || 0,
          stop: params.stop
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
      }

      return await response.json()
    } catch (error) {
      throw new Error(`Failed to generate text: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async chatCompletion(params: {
    model?: string
    messages: Array<{
      role: 'system' | 'user' | 'assistant'
      content: string
    }>
    max_tokens?: number
    temperature?: number
    top_p?: number
    frequency_penalty?: number
    presence_penalty?: number
    stop?: string[]
    functions?: any[]
    function_call?: string | object
  }): Promise<any> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.credentials.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: params.model || 'gpt-3.5-turbo',
          messages: params.messages,
          max_tokens: params.max_tokens || 1000,
          temperature: params.temperature || 0.7,
          top_p: params.top_p || 1,
          frequency_penalty: params.frequency_penalty || 0,
          presence_penalty: params.presence_penalty || 0,
          stop: params.stop,
          functions: params.functions,
          function_call: params.function_call
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
      }

      return await response.json()
    } catch (error) {
      throw new Error(`Failed to complete chat: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async generateImage(params: {
    prompt: string
    n?: number
    size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792'
    quality?: 'standard' | 'hd'
    model?: 'dall-e-2' | 'dall-e-3'
    style?: 'vivid' | 'natural'
  }): Promise<any> {
    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.credentials.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: params.model || 'dall-e-3',
          prompt: params.prompt,
          n: params.n || 1,
          size: params.size || '1024x1024',
          quality: params.quality || 'standard',
          style: params.style || 'vivid'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
      }

      return await response.json()
    } catch (error) {
      throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async createEmbedding(params: {
    input: string | string[]
    model?: string
  }): Promise<any> {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.credentials.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: params.model || 'text-embedding-ada-002',
          input: params.input
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
      }

      return await response.json()
    } catch (error) {
      throw new Error(`Failed to create embedding: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async transcribeAudio(params: {
    file: File | Buffer
    model?: string
    language?: string
    prompt?: string
    response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt'
    temperature?: number
  }): Promise<any> {
    try {
      const formData = new FormData()
      
      if (params.file instanceof File) {
        formData.append('file', params.file)
      } else {
        formData.append('file', new Blob([params.file]), 'audio.wav')
      }
      
      formData.append('model', params.model || 'whisper-1')
      
      if (params.language) formData.append('language', params.language)
      if (params.prompt) formData.append('prompt', params.prompt)
      if (params.response_format) formData.append('response_format', params.response_format)
      if (params.temperature) formData.append('temperature', params.temperature.toString())

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.credentials.apiKey}`
        },
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
      }

      return await response.json()
    } catch (error) {
      throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async executeAction(action: string, params: Record<string, any>): Promise<any> {
    switch (action) {
      case 'generateText':
        return await this.generateText(params)
      case 'chatCompletion':
        return await this.chatCompletion(params)
      case 'generateImage':
        return await this.generateImage(params)
      case 'createEmbedding':
        return await this.createEmbedding(params)
      case 'transcribeAudio':
        return await this.transcribeAudio(params)
      default:
        throw new Error(`Unknown action: ${action}`)
    }
  }

  getAvailableActions(): string[] {
    return [
      'generateText',
      'chatCompletion',
      'generateImage',
      'createEmbedding',
      'transcribeAudio'
    ]
  }
}

// OpenAI integration configuration
export const openaiIntegration: IntegrationConfig = {
  id: 'openai',
  name: 'OpenAI',
  description: 'Access OpenAI\'s powerful AI models including GPT-4, DALL-E, and Whisper',
  category: 'ai-models',
  version: '1.0.0',
  icon: 'Bot',
  color: '#10A37F',
  authType: 'apiKey',
  website: 'https://openai.com',
  documentation: 'https://platform.openai.com/docs',
  setupInstructions: [
    'Create an OpenAI account at https://platform.openai.com',
    'Navigate to API Keys section',
    'Create a new API key',
    'Copy the API key (it starts with sk-)',
    'Add billing information to your OpenAI account'
  ],
  configSchema: {
    type: 'object',
    properties: {
      apiKey: {
        type: 'string',
        title: 'API Key',
        description: 'Your OpenAI API key (sk-...)',
        required: true,
        sensitive: true
      },
      organization: {
        type: 'string',
        title: 'Organization ID (optional)',
        description: 'Your OpenAI organization ID'
      },
      defaultModel: {
        type: 'string',
        title: 'Default Model',
        description: 'Default model to use for completions',
        enum: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-3.5-turbo-16k'],
        default: 'gpt-3.5-turbo'
      }
    }
  },
  actions: [
    {
      id: 'chatCompletion',
      name: 'Chat Completion',
      description: 'Generate chat completions using GPT models',
      inputSchema: {
        type: 'object',
        properties: {
          messages: {
            type: 'array',
            title: 'Messages',
            description: 'Array of message objects',
            required: true
          },
          model: {
            type: 'string',
            title: 'Model',
            enum: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
            default: 'gpt-3.5-turbo'
          },
          temperature: {
            type: 'number',
            title: 'Temperature',
            minimum: 0,
            maximum: 2,
            default: 0.7
          },
          max_tokens: {
            type: 'number',
            title: 'Max Tokens',
            minimum: 1,
            maximum: 4096,
            default: 1000
          }
        }
      }
    },
    {
      id: 'generateImage',
      name: 'Generate Image',
      description: 'Generate images using DALL-E',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            title: 'Prompt',
            description: 'Text description of the image',
            required: true
          },
          model: {
            type: 'string',
            title: 'Model',
            enum: ['dall-e-2', 'dall-e-3'],
            default: 'dall-e-3'
          },
          size: {
            type: 'string',
            title: 'Size',
            enum: ['256x256', '512x512', '1024x1024', '1792x1024', '1024x1792'],
            default: '1024x1024'
          },
          quality: {
            type: 'string',
            title: 'Quality',
            enum: ['standard', 'hd'],
            default: 'standard'
          }
        }
      }
    },
    {
      id: 'createEmbedding',
      name: 'Create Embedding',
      description: 'Create embeddings for text',
      inputSchema: {
        type: 'object',
        properties: {
          input: {
            type: 'string',
            title: 'Input Text',
            description: 'Text to create embeddings for',
            required: true
          },
          model: {
            type: 'string',
            title: 'Model',
            enum: ['text-embedding-ada-002', 'text-embedding-3-small', 'text-embedding-3-large'],
            default: 'text-embedding-ada-002'
          }
        }
      }
    },
    {
      id: 'transcribeAudio',
      name: 'Transcribe Audio',
      description: 'Transcribe audio using Whisper',
      inputSchema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            title: 'Audio File',
            description: 'Audio file to transcribe',
            required: true
          },
          model: {
            type: 'string',
            title: 'Model',
            enum: ['whisper-1'],
            default: 'whisper-1'
          },
          language: {
            type: 'string',
            title: 'Language (optional)',
            description: 'Language of the audio (ISO-639-1 format)'
          }
        }
      }
    }
  ]
}