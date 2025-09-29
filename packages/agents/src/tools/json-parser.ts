// JSON parsing and manipulation tools
import { BaseTool, ToolInput, ToolOutput, ToolCategory } from '../types'

export class JSONParser implements BaseTool {
  readonly id = 'json_parser'
  readonly name = 'JSON Parser'
  readonly description = 'Parse, validate, and manipulate JSON data'
  readonly category: ToolCategory = 'utility'

  async execute(input: ToolInput): Promise<ToolOutput> {
    try {
      const { operation, data, path, value } = input

      switch (operation) {
        case 'parse':
          try {
            const parsed = JSON.parse(data)
            return {
              success: true,
              data: {
                parsed,
                valid: true,
                type: Array.isArray(parsed) ? 'array' : typeof parsed
              }
            }
          } catch (error: any) {
            return {
              success: false,
              error: `JSON parsing failed: ${error.message}`
            }
          }
        
        case 'stringify':
          try {
            const stringified = JSON.stringify(data, null, 2)
            return {
              success: true,
              data: {
                json: stringified,
                size: stringified.length
              }
            }
          } catch (error: any) {
            return {
              success: false,
              error: `JSON stringification failed: ${error.message}`
            }
          }
        
        case 'validate':
          try {
            JSON.parse(data)
            return {
              success: true,
              data: { valid: true }
            }
          } catch (error: any) {
            return {
              success: true,
              data: { 
                valid: false, 
                error: error.message 
              }
            }
          }
        
        case 'get':
          try {
            const obj = typeof data === 'string' ? JSON.parse(data) : data
            const result = this.getValueByPath(obj, path)
            return {
              success: true,
              data: { value: result }
            }
          } catch (error: any) {
            return {
              success: false,
              error: `Failed to get value: ${error.message}`
            }
          }
        
        case 'set':
          try {
            const obj = typeof data === 'string' ? JSON.parse(data) : data
            this.setValueByPath(obj, path, value)
            return {
              success: true,
              data: { result: obj }
            }
          } catch (error: any) {
            return {
              success: false,
              error: `Failed to set value: ${error.message}`
            }
          }
        
        default:
          return {
            success: false,
            error: `Unsupported JSON operation: ${operation}`
          }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `JSON processing failed: ${error.message || 'Unknown error'}`
      }
    }
  }

  private getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined
    }, obj)
  }

  private setValueByPath(obj: any, path: string, value: any): void {
    const keys = path.split('.')
    const lastKey = keys.pop()!
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {}
      return current[key]
    }, obj)
    target[lastKey] = value
  }
}

export class JSONPathQuery implements BaseTool {
  readonly id = 'json_path_query'
  readonly name = 'JSON Path Query'
  readonly description = 'Query JSON data using JSONPath expressions'
  readonly category: ToolCategory = 'utility'

  async execute(input: ToolInput): Promise<ToolOutput> {
    try {
      const { data, query } = input

      if (!data || !query) {
        return {
          success: false,
          error: 'Both data and query are required'
        }
      }

      const obj = typeof data === 'string' ? JSON.parse(data) : data
      
      // Mock JSONPath query implementation
      // In a real implementation, you'd use a library like jsonpath
      const results = this.mockJSONPathQuery(obj, query)

      return {
        success: true,
        data: {
          results,
          count: results.length,
          query
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `JSONPath query failed: ${error.message || 'Unknown error'}`
      }
    }
  }

  private mockJSONPathQuery(obj: any, query: string): any[] {
    // Very basic mock implementation
    if (query === '$') return [obj]
    if (query === '$..*') return this.getAllValues(obj)
    
    // Handle simple property access like $.property
    if (query.startsWith('$.')) {
      const path = query.substring(2)
      const value = this.getValueByPath(obj, path)
      return value !== undefined ? [value] : []
    }
    
    return []
  }

  private getAllValues(obj: any): any[] {
    const values: any[] = []
    
    const traverse = (current: any) => {
      if (current !== null && typeof current === 'object') {
        if (Array.isArray(current)) {
          current.forEach(item => {
            values.push(item)
            traverse(item)
          })
        } else {
          Object.values(current).forEach(value => {
            values.push(value)
            traverse(value)
          })
        }
      }
    }
    
    traverse(obj)
    return values
  }

  private getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined
    }, obj)
  }
}

export const JSON_TOOLS = [
  new JSONParser(),
  new JSONPathQuery()
]