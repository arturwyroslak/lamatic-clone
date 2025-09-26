import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface NotionConfig extends ConnectionConfig {
  accessToken: string
  version?: string
}

export class NotionConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'notion'
  public readonly name = 'Notion'
  public readonly description = 'Connect to Notion for reading and writing pages, databases, and blocks'
  public readonly category = 'productivity-tools'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'accessToken',
        label: 'Access Token',
        type: 'password' as const,
        required: true,
        description: 'Your Notion integration token'
      },
      {
        key: 'version',
        label: 'API Version',
        type: 'text' as const,
        required: false,
        default: '2022-06-28',
        description: 'Notion API version'
      }
    ]
  }

  async validateConnection(config: NotionConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch('https://api.notion.com/v1/users/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
          'Notion-Version': config.version || '2022-06-28'
        }
      })

      if (!response.ok) {
        return {
          valid: false,
          error: `Notion API error: ${response.status} ${response.statusText}`
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

  async execute(input: any, config: NotionConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation, ...params } = input
      const headers = {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': config.version || '2022-06-28'
      }

      switch (operation) {
        case 'search': {
          const { query, filter, sort, startCursor, pageSize = 100 } = params
          const response = await fetch('https://api.notion.com/v1/search', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              query,
              filter,
              sort,
              start_cursor: startCursor,
              page_size: pageSize
            })
          })

          if (!response.ok) {
            throw new Error(`Notion API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            results: result.results,
            hasMore: result.has_more,
            nextCursor: result.next_cursor
          }
        }

        case 'getPage': {
          const { pageId } = params
          const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`Notion API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            page: result
          }
        }

        case 'createPage': {
          const { parent, properties, children, icon, cover } = params
          const response = await fetch('https://api.notion.com/v1/pages', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              parent,
              properties,
              children,
              icon,
              cover
            })
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Notion API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            page: result
          }
        }

        case 'updatePage': {
          const { pageId, properties, icon, cover, archived } = params
          const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
              properties,
              icon,
              cover,
              archived
            })
          })

          if (!response.ok) {
            throw new Error(`Notion API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            page: result
          }
        }

        case 'getBlocks': {
          const { blockId, startCursor, pageSize = 100 } = params
          const response = await fetch(`https://api.notion.com/v1/blocks/${blockId}/children`, {
            method: 'GET',
            headers: {
              ...headers,
              ...(startCursor && { 'start_cursor': startCursor }),
              ...(pageSize && { 'page_size': pageSize.toString() })
            }
          })

          if (!response.ok) {
            throw new Error(`Notion API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            blocks: result.results,
            hasMore: result.has_more,
            nextCursor: result.next_cursor
          }
        }

        case 'appendBlocks': {
          const { blockId, children } = params
          const response = await fetch(`https://api.notion.com/v1/blocks/${blockId}/children`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ children })
          })

          if (!response.ok) {
            throw new Error(`Notion API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            blocks: result.results
          }
        }

        case 'getDatabase': {
          const { databaseId } = params
          const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`Notion API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            database: result
          }
        }

        case 'queryDatabase': {
          const { databaseId, filter, sorts, startCursor, pageSize = 100 } = params
          const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              filter,
              sorts,
              start_cursor: startCursor,
              page_size: pageSize
            })
          })

          if (!response.ok) {
            throw new Error(`Notion API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            results: result.results,
            hasMore: result.has_more,
            nextCursor: result.next_cursor
          }
        }

        case 'createDatabase': {
          const { parent, title, properties, icon, cover } = params
          const response = await fetch('https://api.notion.com/v1/databases', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              parent,
              title,
              properties,
              icon,
              cover
            })
          })

          if (!response.ok) {
            throw new Error(`Notion API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            database: result
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
      maxConcurrency: 3,
      rateLimits: {
        requestsPerMinute: 300
      },
      operations: [
        'search',
        'getPage',
        'createPage',
        'updatePage',
        'getBlocks',
        'appendBlocks',
        'getDatabase',
        'queryDatabase',
        'createDatabase'
      ]
    }
  }
}