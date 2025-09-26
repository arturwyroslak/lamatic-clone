import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface LinearConfig extends ConnectionConfig {
  apiKey: string
}

export class LinearConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'linear'
  public readonly name = 'Linear'
  public readonly description = 'Connect to Linear for issue tracking and project management'
  public readonly category = 'project-management'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password' as const,
        required: true,
        description: 'Your Linear API key'
      }
    ]
  }

  async validateConnection(config: LinearConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const query = `{ viewer { id name email } }`

      const response = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      })

      if (!response.ok) {
        return {
          valid: false,
          error: `Linear API error: ${response.status} ${response.statusText}`
        }
      }

      const result = await response.json()
      if (result.errors) {
        return {
          valid: false,
          error: `Linear API error: ${result.errors[0]?.message || 'Unknown error'}`
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

  async execute(input: any, config: LinearConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation, query, variables } = input
      const headers = {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }

      switch (operation) {
        case 'graphql': {
          if (!query) {
            throw new Error('GraphQL query is required')
          }

          const response = await fetch('https://api.linear.app/graphql', {
            method: 'POST',
            headers,
            body: JSON.stringify({ query, variables })
          })

          if (!response.ok) {
            throw new Error(`Linear API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          if (result.errors) {
            throw new Error(`Linear GraphQL error: ${result.errors[0]?.message || 'Unknown error'}`)
          }

          return {
            success: true,
            data: result.data
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
      supportsFiles: false,
      maxConcurrency: 10,
      rateLimits: {
        requestsPerMinute: 1000
      },
      operations: [
        'graphql'
      ]
    }
  }
}