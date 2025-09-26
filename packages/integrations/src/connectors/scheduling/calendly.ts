import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface CalendlyConfig extends ConnectionConfig {
  accessToken: string
}

export class CalendlyConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'calendly'
  public readonly name = 'Calendly'
  public readonly description = 'Connect to Calendly for scheduling and calendar management'
  public readonly category = 'scheduling'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'accessToken',
        label: 'Access Token',
        type: 'password' as const,
        required: true,
        description: 'Your Calendly personal access token'
      }
    ]
  }

  async validateConnection(config: CalendlyConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch('https://api.calendly.com/users/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        return {
          valid: false,
          error: `Calendly API error: ${response.status} ${response.statusText}`
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

  async execute(input: any, config: CalendlyConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation } = input
      const headers = {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json'
      }

      switch (operation) {
        case 'getUser': {
          const response = await fetch('https://api.calendly.com/users/me', {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`Calendly API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            user: result.resource
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
        'getUser'
      ]
    }
  }
}