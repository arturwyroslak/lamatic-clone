import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface MailchimpConfig extends ConnectionConfig {
  apiKey: string
  serverPrefix: string
}

export class MailchimpConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'mailchimp'
  public readonly name = 'Mailchimp'
  public readonly description = 'Connect to Mailchimp for email marketing automation and audience management'
  public readonly category = 'marketing'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password' as const,
        required: true,
        description: 'Your Mailchimp API key'
      },
      {
        key: 'serverPrefix',
        label: 'Server Prefix',
        type: 'text' as const,
        required: true,
        description: 'Server prefix from your API key (e.g., us1, us2, etc.)'
      }
    ]
  }

  async validateConnection(config: MailchimpConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const auth = Buffer.from(`anystring:${config.apiKey}`).toString('base64')
      const response = await fetch(`https://${config.serverPrefix}.api.mailchimp.com/3.0/`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        return {
          valid: false,
          error: `Mailchimp API error: ${response.status} ${response.statusText}`
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

  async execute(input: any, config: MailchimpConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation } = input
      const baseUrl = `https://${config.serverPrefix}.api.mailchimp.com/3.0`
      const auth = Buffer.from(`anystring:${config.apiKey}`).toString('base64')
      const headers = {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }

      switch (operation) {
        case 'getLists': {
          const response = await fetch(`${baseUrl}/lists`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`Mailchimp API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            lists: result.lists
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
        requestsPerMinute: 1000
      },
      operations: [
        'getLists'
      ]
    }
  }
}