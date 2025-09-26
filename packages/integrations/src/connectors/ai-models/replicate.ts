import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface ReplicateConfig extends ConnectionConfig {
  apiToken: string
}

export class ReplicateConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'replicate'
  public readonly name = 'Replicate'
  public readonly description = 'Connect to Replicate for running machine learning models in the cloud'
  public readonly category = 'ai-models'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'apiToken',
        label: 'API Token',
        type: 'password' as const,
        required: true,
        description: 'Your Replicate API token'
      }
    ]
  }

  async validateConnection(config: ReplicateConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch('https://api.replicate.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${config.apiToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        return {
          valid: false,
          error: `Replicate API error: ${response.status} ${response.statusText}`
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

  async execute(input: any, config: ReplicateConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation = 'predict', model, version, input: modelInput, webhook } = input
      const headers = {
        'Authorization': `Token ${config.apiToken}`,
        'Content-Type': 'application/json'
      }

      switch (operation) {
        case 'predict': {
          if (!model || !version) {
            throw new Error('Model and version are required')
          }

          const response = await fetch('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              version,
              input: modelInput || {},
              webhook
            })
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Replicate API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            predictionId: result.id,
            status: result.status,
            output: result.output,
            urls: result.urls
          }
        }

        case 'getPrediction': {
          const { predictionId } = input
          if (!predictionId) {
            throw new Error('Prediction ID is required')
          }

          const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`Replicate API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            status: result.status,
            output: result.output,
            error: result.error,
            logs: result.logs
          }
        }

        case 'listModels': {
          const { cursor } = input
          const queryParams = cursor ? `?cursor=${cursor}` : ''
          
          const response = await fetch(`https://api.replicate.com/v1/models${queryParams}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`Replicate API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            models: result.results,
            next: result.next,
            previous: result.previous
          }
        }

        case 'getModel': {
          const { owner, name } = input
          if (!owner || !name) {
            throw new Error('Model owner and name are required')
          }

          const response = await fetch(`https://api.replicate.com/v1/models/${owner}/${name}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`Replicate API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            model: result
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
      supportsStreaming: false,
      supportsFiles: true,
      maxConcurrency: 10,
      rateLimits: {
        requestsPerMinute: 60
      },
      operations: [
        'predict',
        'getPrediction',
        'listModels',
        'getModel'
      ],
      models: [
        'stability-ai/stable-diffusion',
        'meta/llama-2-70b-chat',
        'openai/whisper',
        'salesforce/blip',
        'facebook/musicgen'
      ]
    }
  }
}