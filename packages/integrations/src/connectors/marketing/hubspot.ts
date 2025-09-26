import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface HubSpotConfig extends ConnectionConfig {
  accessToken: string
}

export class HubSpotConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'hubspot'
  public readonly name = 'HubSpot'
  public readonly description = 'Connect to HubSpot for CRM, marketing automation, and sales management'
  public readonly category = 'marketing'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'accessToken',
        label: 'Access Token',
        type: 'password' as const,
        required: true,
        description: 'Your HubSpot private app access token'
      }
    ]
  }

  async validateConnection(config: HubSpotConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        return {
          valid: false,
          error: `HubSpot API error: ${response.status} ${response.statusText}`
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

  async execute(input: any, config: HubSpotConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation, ...params } = input
      const headers = {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json'
      }

      switch (operation) {
        case 'getContacts': {
          const { limit = 10, after, properties, archived = false } = params
          const queryParams = new URLSearchParams({
            limit: limit.toString(),
            archived: archived.toString()
          })

          if (after) queryParams.append('after', after)
          if (properties) {
            if (Array.isArray(properties)) {
              properties.forEach(prop => queryParams.append('properties', prop))
            } else {
              queryParams.append('properties', properties)
            }
          }

          const response = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts?${queryParams.toString()}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`HubSpot API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            contacts: result.results,
            paging: result.paging
          }
        }

        case 'getContact': {
          const { contactId, properties, propertiesWithHistory, associations } = params

          if (!contactId) {
            throw new Error('Contact ID is required')
          }

          const queryParams = new URLSearchParams()
          if (properties) {
            if (Array.isArray(properties)) {
              properties.forEach(prop => queryParams.append('properties', prop))
            } else {
              queryParams.append('properties', properties)
            }
          }
          if (propertiesWithHistory) queryParams.append('propertiesWithHistory', propertiesWithHistory)
          if (associations) queryParams.append('associations', associations)

          const url = `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`
          const response = await fetch(url, { method: 'GET', headers })

          if (!response.ok) {
            throw new Error(`HubSpot API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            contact: result
          }
        }

        case 'createContact': {
          const { properties } = params

          if (!properties) {
            throw new Error('Contact properties are required')
          }

          const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
            method: 'POST',
            headers,
            body: JSON.stringify({ properties })
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`HubSpot API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            contact: result
          }
        }

        case 'updateContact': {
          const { contactId, properties } = params

          if (!contactId || !properties) {
            throw new Error('Contact ID and properties are required')
          }

          const response = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ properties })
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`HubSpot API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            contact: result
          }
        }

        case 'getCompanies': {
          const { limit = 10, after, properties, archived = false } = params
          const queryParams = new URLSearchParams({
            limit: limit.toString(),
            archived: archived.toString()
          })

          if (after) queryParams.append('after', after)
          if (properties) {
            if (Array.isArray(properties)) {
              properties.forEach(prop => queryParams.append('properties', prop))
            } else {
              queryParams.append('properties', properties)
            }
          }

          const response = await fetch(`https://api.hubapi.com/crm/v3/objects/companies?${queryParams.toString()}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`HubSpot API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            companies: result.results,
            paging: result.paging
          }
        }

        case 'createCompany': {
          const { properties } = params

          if (!properties) {
            throw new Error('Company properties are required')
          }

          const response = await fetch('https://api.hubapi.com/crm/v3/objects/companies', {
            method: 'POST',
            headers,
            body: JSON.stringify({ properties })
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`HubSpot API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            company: result
          }
        }

        case 'getDeals': {
          const { limit = 10, after, properties, archived = false } = params
          const queryParams = new URLSearchParams({
            limit: limit.toString(),
            archived: archived.toString()
          })

          if (after) queryParams.append('after', after)
          if (properties) {
            if (Array.isArray(properties)) {
              properties.forEach(prop => queryParams.append('properties', prop))
            } else {
              queryParams.append('properties', properties)
            }
          }

          const response = await fetch(`https://api.hubapi.com/crm/v3/objects/deals?${queryParams.toString()}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`HubSpot API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            deals: result.results,
            paging: result.paging
          }
        }

        case 'createDeal': {
          const { properties } = params

          if (!properties) {
            throw new Error('Deal properties are required')
          }

          const response = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
            method: 'POST',
            headers,
            body: JSON.stringify({ properties })
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`HubSpot API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            deal: result
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
        requestsPerMinute: 100,
        requestsPerHour: 40000
      },
      operations: [
        'getContacts',
        'getContact',
        'createContact',
        'updateContact',
        'getCompanies',
        'createCompany',
        'getDeals',
        'createDeal'
      ]
    }
  }
}