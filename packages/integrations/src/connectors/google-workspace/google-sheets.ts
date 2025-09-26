import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface GoogleSheetsConfig extends ConnectionConfig {
  accessToken: string
  refreshToken?: string
  clientId?: string
  clientSecret?: string
}

export class GoogleSheetsConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'google-sheets'
  public readonly name = 'Google Sheets'
  public readonly description = 'Connect to Google Sheets for spreadsheet operations and data management'
  public readonly category = 'google-workspace'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'accessToken',
        label: 'Access Token',
        type: 'password' as const,
        required: true,
        description: 'OAuth 2.0 access token for Google Sheets API'
      }
    ]
  }

  async validateConnection(config: GoogleSheetsConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        return {
          valid: false,
          error: `Google Sheets API error: ${response.status} ${response.statusText}`
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

  async execute(input: any, config: GoogleSheetsConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation, spreadsheetId, range, values } = input
      const headers = {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json'
      }

      switch (operation) {
        case 'getValues': {
          if (!spreadsheetId || !range) {
            throw new Error('Spreadsheet ID and range are required')
          }

          const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`Google Sheets API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            values: result.values || []
          }
        }

        case 'updateValues': {
          if (!spreadsheetId || !range || !values) {
            throw new Error('Spreadsheet ID, range, and values are required')
          }

          const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              range,
              majorDimension: 'ROWS',
              values
            })
          })

          if (!response.ok) {
            throw new Error(`Google Sheets API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result
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
        requestsPerMinute: 300
      },
      operations: [
        'getValues',
        'updateValues'
      ]
    }
  }
}