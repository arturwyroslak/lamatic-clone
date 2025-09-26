import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface MixpanelConfig extends ConnectionConfig {
  projectToken: string
  serviceAccountUsername?: string
  serviceAccountSecret?: string
}

export class MixpanelConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'mixpanel'
  public readonly name = 'Mixpanel'
  public readonly description = 'Connect to Mixpanel for product analytics and user behavior tracking'
  public readonly category = 'analytics'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'projectToken',
        label: 'Project Token',
        type: 'password' as const,
        required: true,
        description: 'Your Mixpanel project token'
      },
      {
        key: 'serviceAccountUsername',
        label: 'Service Account Username',
        type: 'text' as const,
        required: false,
        description: 'Service account username for Query API (optional)'
      },
      {
        key: 'serviceAccountSecret',
        label: 'Service Account Secret',
        type: 'password' as const,
        required: false,
        description: 'Service account secret for Query API (optional)'
      }
    ]
  }

  async validateConnection(config: MixpanelConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      // Simple validation by tracking a test event
      const response = await fetch('https://api.mixpanel.com/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([{
          event: 'Connection Test',
          properties: {
            token: config.projectToken,
            time: Math.floor(Date.now() / 1000),
            distinct_id: 'connection-test'
          }
        }])
      })

      if (!response.ok) {
        return {
          valid: false,
          error: `Mixpanel API error: ${response.status} ${response.statusText}`
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

  async execute(input: any, config: MixpanelConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation, ...params } = input

      switch (operation) {
        case 'trackEvent': {
          const { event, properties = {}, distinctId } = params

          if (!event) {
            throw new Error('Event name is required')
          }

          const eventData = {
            event,
            properties: {
              token: config.projectToken,
              time: Math.floor(Date.now() / 1000),
              distinct_id: distinctId || 'anonymous',
              ...properties
            }
          }

          const response = await fetch('https://api.mixpanel.com/track', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify([eventData])
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Mixpanel API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            status: result.status
          }
        }

        case 'setUserProfile': {
          const { distinctId, properties, operation: profileOp = '$set' } = params

          if (!distinctId || !properties) {
            throw new Error('Distinct ID and properties are required')
          }

          const profileData = {
            $token: config.projectToken,
            $distinct_id: distinctId,
            [profileOp]: properties
          }

          const response = await fetch('https://api.mixpanel.com/engage', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify([profileData])
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Mixpanel API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            status: result.status
          }
        }

        case 'createAlias': {
          const { distinctId, alias } = params

          if (!distinctId || !alias) {
            throw new Error('Distinct ID and alias are required')
          }

          const aliasData = {
            event: '$create_alias',
            properties: {
              token: config.projectToken,
              distinct_id: distinctId,
              alias: alias
            }
          }

          const response = await fetch('https://api.mixpanel.com/track', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify([aliasData])
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Mixpanel API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            status: result.status
          }
        }

        case 'queryEvents': {
          if (!config.serviceAccountUsername || !config.serviceAccountSecret) {
            throw new Error('Service account credentials are required for query operations')
          }

          const { 
            fromDate, 
            toDate, 
            event, 
            where, 
            interval, 
            type = 'general',
            unit = 'day'
          } = params

          if (!fromDate || !toDate) {
            throw new Error('From date and to date are required')
          }

          const queryParams = new URLSearchParams({
            from_date: fromDate,
            to_date: toDate,
            type,
            unit
          })

          if (event) queryParams.append('event', JSON.stringify([event]))
          if (where) queryParams.append('where', where)
          if (interval) queryParams.append('interval', interval.toString())

          const auth = Buffer.from(`${config.serviceAccountUsername}:${config.serviceAccountSecret}`).toString('base64')
          const response = await fetch(`https://mixpanel.com/api/2.0/events?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/json'
            }
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Mixpanel API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result
          }
        }

        case 'exportEvents': {
          if (!config.serviceAccountUsername || !config.serviceAccountSecret) {
            throw new Error('Service account credentials are required for export operations')
          }

          const { fromDate, toDate, event, where } = params

          if (!fromDate || !toDate) {
            throw new Error('From date and to date are required')
          }

          const queryParams = new URLSearchParams({
            from_date: fromDate,
            to_date: toDate
          })

          if (event) queryParams.append('event', JSON.stringify([event]))
          if (where) queryParams.append('where', where)

          const auth = Buffer.from(`${config.serviceAccountUsername}:${config.serviceAccountSecret}`).toString('base64')
          const response = await fetch(`https://data.mixpanel.com/api/2.0/export?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
              'Authorization': `Basic ${auth}`
            }
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Mixpanel API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.text()
          // Parse JSONL format
          const events = result.trim().split('\n').map(line => JSON.parse(line))

          return {
            success: true,
            data: events,
            events,
            count: events.length
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
        requestsPerMinute: 2000
      },
      operations: [
        'trackEvent',
        'setUserProfile',
        'createAlias',
        'queryEvents',
        'exportEvents'
      ]
    }
  }
}