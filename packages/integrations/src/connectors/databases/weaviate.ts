import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface WeaviateConfig extends ConnectionConfig {
  endpoint: string
  apiKey?: string
  scheme?: 'http' | 'https'
  className?: string
  vectorizer?: string
}

export class WeaviateConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'weaviate'
  public readonly name = 'Weaviate'
  public readonly description = 'Connect to Weaviate vector database for semantic search and RAG applications'
  public readonly category = 'databases'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'endpoint',
        label: 'Endpoint',
        type: 'text' as const,
        required: true,
        description: 'Weaviate cluster endpoint URL'
      },
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password' as const,
        required: false,
        description: 'API key for authenticated access (optional for local instances)'
      },
      {
        key: 'scheme',
        label: 'Scheme',
        type: 'select' as const,
        required: false,
        options: [
          { value: 'https', label: 'HTTPS' },
          { value: 'http', label: 'HTTP' }
        ],
        default: 'https',
        description: 'Connection protocol'
      },
      {
        key: 'className',
        label: 'Default Class',
        type: 'text' as const,
        required: false,
        description: 'Default class name for operations'
      }
    ]
  }

  async validateConnection(config: WeaviateConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (config.apiKey) {
        headers['Authorization'] = `Bearer ${config.apiKey}`
      }

      const response = await fetch(`${config.endpoint}/v1/meta`, {
        headers
      })

      if (!response.ok) {
        return { valid: false, error: `API Error: ${response.status} ${response.statusText}` }
      }

      return { valid: true }
    } catch (error) {
      return { valid: false, error: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` }
    }
  }

  async execute(input: any, config: WeaviateConfig, context: ExecutionContext): Promise<any> {
    const { operation, className, data, query, vector, limit = 10 } = input
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (config.apiKey) {
        headers['Authorization'] = `Bearer ${config.apiKey}`
      }

      let result
      const targetClass = className || config.className
      
      switch (operation) {
        case 'create':
          // Create object
          const createResponse = await fetch(`${config.endpoint}/v1/objects`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              class: targetClass,
              properties: data
            })
          })
          result = await createResponse.json()
          break
          
        case 'search':
          // Vector search
          const searchPayload = {
            query: {
              Get: {
                [targetClass]: [
                  ...Object.keys(data || {}),
                  '_additional { id certainty distance }'
                ]
              }
            }
          }
          
          if (vector) {
            searchPayload.query.Get[targetClass].push({
              nearVector: {
                vector: vector,
                certainty: 0.7
              }
            })
          }
          
          const searchResponse = await fetch(`${config.endpoint}/v1/graphql`, {
            method: 'POST',
            headers,
            body: JSON.stringify(searchPayload)
          })
          result = await searchResponse.json()
          break
          
        case 'hybrid_search':
          // Hybrid search combining keyword and vector search
          const hybridPayload = {
            query: {
              Get: {
                [targetClass]: [
                  ...Object.keys(data || {}),
                  '_additional { id score }'
                ]
              }
            },
            hybridSearch: {
              query: query,
              alpha: 0.5,
              vector: vector
            }
          }
          
          const hybridResponse = await fetch(`${config.endpoint}/v1/graphql`, {
            method: 'POST',
            headers,
            body: JSON.stringify(hybridPayload)
          })
          result = await hybridResponse.json()
          break
          
        case 'delete':
          // Delete object
          const deleteResponse = await fetch(`${config.endpoint}/v1/objects/${data.id}`, {
            method: 'DELETE',
            headers
          })
          result = { deleted: deleteResponse.ok }
          break
          
        default:
          throw new Error(`Unsupported operation: ${operation}`)
      }
      
      return {
        success: true,
        data: result,
        operation: operation,
        className: targetClass,
        timestamp: new Date().toISOString()
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
        requestsPerMinute: 600
      },
      vectorOperations: {
        supportsInsert: true,
        supportsSearch: true,
        supportsHybridSearch: true,
        supportsFiltering: true,
        maxVectorDimensions: 1536
      }
    }
  }
}