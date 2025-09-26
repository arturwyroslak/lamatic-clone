import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface GoogleAnalyticsConfig extends ConnectionConfig {
  accessToken: string
  propertyId: string
}

export class GoogleAnalyticsConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'google-analytics'
  public readonly name = 'Google Analytics'
  public readonly description = 'Connect to Google Analytics for website traffic and behavior analysis'
  public readonly category = 'analytics'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'accessToken',
        label: 'Access Token',
        type: 'password' as const,
        required: true,
        description: 'OAuth 2.0 access token for Google Analytics API'
      },
      {
        key: 'propertyId',
        label: 'Property ID',
        type: 'text' as const,
        required: true,
        description: 'Google Analytics 4 property ID'
      }
    ]
  }

  async validateConnection(config: GoogleAnalyticsConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${config.propertyId}:runReport`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
          metrics: [{ name: 'sessions' }]
        })
      })

      if (!response.ok) {
        return {
          valid: false,
          error: `Google Analytics API error: ${response.status} ${response.statusText}`
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

  async execute(input: any, config: GoogleAnalyticsConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation = 'runReport', metrics = [{ name: 'sessions' }] } = input
      const headers = {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json'
      }

      switch (operation) {
        case 'runReport': {
          const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${config.propertyId}:runReport`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
              metrics
            })
          })

          if (!response.ok) {
            throw new Error(`Google Analytics API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            rows: result.rows || []
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
        requestsPerMinute: 100
      },
      operations: [
        'runReport'
      ]
    }
  }
}