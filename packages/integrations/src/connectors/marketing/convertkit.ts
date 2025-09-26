import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface ConvertKitConfig extends ConnectionConfig {
  apiKey: string
  apiSecret: string
}

export class ConvertKitConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'convertkit'
  public readonly name = 'ConvertKit'
  public readonly description = 'Connect to ConvertKit for email marketing automation and subscriber management'
  public readonly category = 'marketing'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password' as const,
        required: true,
        description: 'Your ConvertKit API key'
      },
      {
        key: 'apiSecret',
        label: 'API Secret',
        type: 'password' as const,
        required: true,
        description: 'Your ConvertKit API secret'
      }
    ]
  }

  async validateConnection(config: ConvertKitConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch(`https://api.convertkit.com/v3/account?api_secret=${config.apiSecret}`, {
        method: 'GET'
      })

      if (!response.ok) {
        return {
          valid: false,
          error: `ConvertKit API error: ${response.status} ${response.statusText}`
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

  async execute(input: any, config: ConvertKitConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation, ...params } = input

      switch (operation) {
        case 'getAccount': {
          const response = await fetch(`https://api.convertkit.com/v3/account?api_secret=${config.apiSecret}`, {
            method: 'GET'
          })

          if (!response.ok) {
            throw new Error(`ConvertKit API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            account: result
          }
        }

        case 'getForms': {
          const response = await fetch(`https://api.convertkit.com/v3/forms?api_key=${config.apiKey}`, {
            method: 'GET'
          })

          if (!response.ok) {
            throw new Error(`ConvertKit API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            forms: result.forms
          }
        }

        case 'getSubscribers': {
          const { page = 1, sortField = 'created_at', sortOrder = 'desc' } = params

          const queryParams = new URLSearchParams({
            api_secret: config.apiSecret,
            page: page.toString(),
            sort_field: sortField,
            sort_order: sortOrder
          })

          const response = await fetch(`https://api.convertkit.com/v3/subscribers?${queryParams.toString()}`, {
            method: 'GET'
          })

          if (!response.ok) {
            throw new Error(`ConvertKit API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            subscribers: result.subscribers,
            totalSubscribers: result.total_subscribers,
            page: result.page,
            totalPages: result.total_pages
          }
        }

        case 'createSubscriber': {
          const { email, firstName, tags = [], fields = {} } = params

          if (!email) {
            throw new Error('Email is required')
          }

          const subscriberData: any = {
            api_key: config.apiKey,
            email
          }

          if (firstName) subscriberData.first_name = firstName
          if (tags.length > 0) subscriberData.tags = tags
          if (Object.keys(fields).length > 0) subscriberData.fields = fields

          const response = await fetch('https://api.convertkit.com/v3/subscribers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(subscriberData)
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`ConvertKit API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            subscriber: result.subscriber
          }
        }

        case 'updateSubscriber': {
          const { subscriberId, firstName, email, fields = {} } = params

          if (!subscriberId) {
            throw new Error('Subscriber ID is required')
          }

          const updateData: any = {
            api_secret: config.apiSecret
          }

          if (firstName) updateData.first_name = firstName
          if (email) updateData.email_address = email
          if (Object.keys(fields).length > 0) updateData.fields = fields

          const response = await fetch(`https://api.convertkit.com/v3/subscribers/${subscriberId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`ConvertKit API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            subscriber: result.subscriber
          }
        }

        case 'unsubscribeSubscriber': {
          const { subscriberId } = params

          if (!subscriberId) {
            throw new Error('Subscriber ID is required')
          }

          const response = await fetch(`https://api.convertkit.com/v3/subscribers/${subscriberId}/unsubscribe`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              api_secret: config.apiSecret
            })
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`ConvertKit API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            subscriber: result.subscriber
          }
        }

        case 'addTagToSubscriber': {
          const { subscriberId, tagId } = params

          if (!subscriberId || !tagId) {
            throw new Error('Subscriber ID and tag ID are required')
          }

          const response = await fetch(`https://api.convertkit.com/v3/subscribers/${subscriberId}/tags`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              api_secret: config.apiSecret,
              tag: { id: tagId }
            })
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`ConvertKit API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            subscriber: result.subscriber
          }
        }

        case 'removeTagFromSubscriber': {
          const { subscriberId, tagId } = params

          if (!subscriberId || !tagId) {
            throw new Error('Subscriber ID and tag ID are required')
          }

          const response = await fetch(`https://api.convertkit.com/v3/subscribers/${subscriberId}/tags/${tagId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              api_secret: config.apiSecret
            })
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`ConvertKit API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            subscriber: result.subscriber
          }
        }

        case 'getTags': {
          const response = await fetch(`https://api.convertkit.com/v3/tags?api_key=${config.apiKey}`, {
            method: 'GET'
          })

          if (!response.ok) {
            throw new Error(`ConvertKit API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            tags: result.tags
          }
        }

        case 'createTag': {
          const { name } = params

          if (!name) {
            throw new Error('Tag name is required')
          }

          const response = await fetch('https://api.convertkit.com/v3/tags', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              api_secret: config.apiSecret,
              tag: { name }
            })
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`ConvertKit API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            tag: result.tag
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
        requestsPerMinute: 120
      },
      operations: [
        'getAccount',
        'getForms',
        'getSubscribers',
        'createSubscriber',
        'updateSubscriber',
        'unsubscribeSubscriber',
        'addTagToSubscriber',
        'removeTagFromSubscriber',
        'getTags',
        'createTag'
      ]
    }
  }
}