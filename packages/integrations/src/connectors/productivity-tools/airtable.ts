import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface AirtableConfig extends ConnectionConfig {
  accessToken: string
  baseId?: string
}

export class AirtableConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'airtable'
  public readonly name = 'Airtable'
  public readonly description = 'Connect to Airtable for database operations and record management'
  public readonly category = 'productivity-tools'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'accessToken',
        label: 'Personal Access Token',
        type: 'password' as const,
        required: true,
        description: 'Your Airtable Personal Access Token'
      },
      {
        key: 'baseId',
        label: 'Default Base ID',
        type: 'text' as const,
        required: false,
        description: 'Default base ID to use (can be overridden per operation)'
      }
    ]
  }

  async validateConnection(config: AirtableConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch('https://api.airtable.com/v0/meta/bases', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        return {
          valid: false,
          error: `Airtable API error: ${response.status} ${response.statusText}`
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

  async execute(input: any, config: AirtableConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation, baseId, tableName, ...params } = input
      const targetBaseId = baseId || config.baseId
      
      if (!targetBaseId) {
        throw new Error('Base ID is required')
      }

      const headers = {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json'
      }

      switch (operation) {
        case 'listBases': {
          const response = await fetch('https://api.airtable.com/v0/meta/bases', {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`Airtable API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            bases: result.bases
          }
        }

        case 'getBaseSchema': {
          const response = await fetch(`https://api.airtable.com/v0/meta/bases/${targetBaseId}/tables`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`Airtable API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            tables: result.tables
          }
        }

        case 'listRecords': {
          if (!tableName) {
            throw new Error('Table name is required')
          }

          const { 
            fields, 
            filterByFormula, 
            maxRecords, 
            pageSize, 
            sort, 
            view, 
            cellFormat,
            timeZone,
            userLocale,
            offset
          } = params

          const queryParams = new URLSearchParams()
          if (fields) queryParams.append('fields[]', Array.isArray(fields) ? fields.join(',') : fields)
          if (filterByFormula) queryParams.append('filterByFormula', filterByFormula)
          if (maxRecords) queryParams.append('maxRecords', maxRecords.toString())
          if (pageSize) queryParams.append('pageSize', pageSize.toString())
          if (view) queryParams.append('view', view)
          if (cellFormat) queryParams.append('cellFormat', cellFormat)
          if (timeZone) queryParams.append('timeZone', timeZone)
          if (userLocale) queryParams.append('userLocale', userLocale)
          if (offset) queryParams.append('offset', offset)
          if (sort) {
            sort.forEach((s: any) => {
              queryParams.append('sort[][field]', s.field)
              queryParams.append('sort[][direction]', s.direction)
            })
          }

          const url = `https://api.airtable.com/v0/${targetBaseId}/${encodeURIComponent(tableName)}`
          const fullUrl = queryParams.toString() ? `${url}?${queryParams.toString()}` : url

          const response = await fetch(fullUrl, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`Airtable API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            records: result.records,
            offset: result.offset
          }
        }

        case 'getRecord': {
          if (!tableName) {
            throw new Error('Table name is required')
          }
          
          const { recordId } = params
          if (!recordId) {
            throw new Error('Record ID is required')
          }

          const response = await fetch(`https://api.airtable.com/v0/${targetBaseId}/${encodeURIComponent(tableName)}/${recordId}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`Airtable API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            record: result
          }
        }

        case 'createRecords': {
          if (!tableName) {
            throw new Error('Table name is required')
          }

          const { records, typecast = false } = params
          if (!records || !Array.isArray(records)) {
            throw new Error('Records array is required')
          }

          const response = await fetch(`https://api.airtable.com/v0/${targetBaseId}/${encodeURIComponent(tableName)}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              records,
              typecast
            })
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Airtable API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            records: result.records
          }
        }

        case 'updateRecords': {
          if (!tableName) {
            throw new Error('Table name is required')
          }

          const { records, typecast = false } = params
          if (!records || !Array.isArray(records)) {
            throw new Error('Records array is required')
          }

          const response = await fetch(`https://api.airtable.com/v0/${targetBaseId}/${encodeURIComponent(tableName)}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
              records,
              typecast
            })
          })

          if (!response.ok) {
            throw new Error(`Airtable API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            records: result.records
          }
        }

        case 'deleteRecords': {
          if (!tableName) {
            throw new Error('Table name is required')
          }

          const { recordIds } = params
          if (!recordIds || !Array.isArray(recordIds)) {
            throw new Error('Record IDs array is required')
          }

          const queryParams = recordIds.map(id => `records[]=${id}`).join('&')
          const response = await fetch(`https://api.airtable.com/v0/${targetBaseId}/${encodeURIComponent(tableName)}?${queryParams}`, {
            method: 'DELETE',
            headers
          })

          if (!response.ok) {
            throw new Error(`Airtable API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            records: result.records
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
      supportsFiles: true,
      maxConcurrency: 5,
      rateLimits: {
        requestsPerMinute: 300
      },
      operations: [
        'listBases',
        'getBaseSchema',
        'listRecords',
        'getRecord',
        'createRecords',
        'updateRecords',
        'deleteRecords'
      ]
    }
  }
}