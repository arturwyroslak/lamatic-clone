// Data formatting tools
import { BaseTool, ToolInput, ToolOutput, ToolCategory } from '../types'

export class TextFormatter implements BaseTool {
  readonly id = 'text_formatter'
  readonly name = 'Text Formatter'
  readonly description = 'Format and transform text in various ways'
  readonly category: ToolCategory = 'utility'

  async execute(input: ToolInput): Promise<ToolOutput> {
    try {
      const { text, operation, options = {} } = input

      if (!text) {
        return {
          success: false,
          error: 'Text is required'
        }
      }

      switch (operation) {
        case 'uppercase':
          return {
            success: true,
            data: { result: text.toUpperCase() }
          }
        
        case 'lowercase':
          return {
            success: true,
            data: { result: text.toLowerCase() }
          }
        
        case 'title_case':
          const titleCase = text.replace(/\w\S*/g, (txt: string) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
          )
          return {
            success: true,
            data: { result: titleCase }
          }
        
        case 'camel_case':
          const camelCase = text
            .replace(/(?:^\w|[A-Z]|\b\w)/g, (word: string, index: number) => 
              index === 0 ? word.toLowerCase() : word.toUpperCase()
            )
            .replace(/\s+/g, '')
          return {
            success: true,
            data: { result: camelCase }
          }
        
        case 'snake_case':
          const snakeCase = text
            .replace(/\W+/g, ' ')
            .split(/ |\B(?=[A-Z])/)
            .map((word: string) => word.toLowerCase())
            .join('_')
          return {
            success: true,
            data: { result: snakeCase }
          }
        
        case 'kebab_case':
          const kebabCase = text
            .replace(/\W+/g, ' ')
            .split(/ |\B(?=[A-Z])/)
            .map((word: string) => word.toLowerCase())
            .join('-')
          return {
            success: true,
            data: { result: kebabCase }
          }
        
        case 'trim':
          return {
            success: true,
            data: { result: text.trim() }
          }
        
        case 'remove_extra_spaces':
          const cleaned = text.replace(/\s+/g, ' ').trim()
          return {
            success: true,
            data: { result: cleaned }
          }
        
        case 'truncate':
          const maxLength = options.maxLength || 100
          const suffix = options.suffix || '...'
          const truncated = text.length > maxLength 
            ? text.substring(0, maxLength - suffix.length) + suffix
            : text
          return {
            success: true,
            data: { result: truncated, truncated: text.length > maxLength }
          }
        
        case 'pad':
          const length = options.length || text.length
          const padChar = options.padChar || ' '
          const side = options.side || 'both'
          
          let padded: string
          if (side === 'left') {
            padded = text.padStart(length, padChar)
          } else if (side === 'right') {
            padded = text.padEnd(length, padChar)
          } else {
            const totalPad = Math.max(0, length - text.length)
            const leftPad = Math.floor(totalPad / 2)
            const rightPad = totalPad - leftPad
            padded = padChar.repeat(leftPad) + text + padChar.repeat(rightPad)
          }
          
          return {
            success: true,
            data: { result: padded }
          }
        
        default:
          return {
            success: false,
            error: `Unsupported text operation: ${operation}`
          }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Text formatting failed: ${error.message || 'Unknown error'}`
      }
    }
  }
}

export class NumberFormatter implements BaseTool {
  readonly id = 'number_formatter'
  readonly name = 'Number Formatter'
  readonly description = 'Format numbers in various formats'
  readonly category: ToolCategory = 'utility'

  async execute(input: ToolInput): Promise<ToolOutput> {
    try {
      const { number, operation, options = {} } = input

      const num = parseFloat(number)
      if (isNaN(num)) {
        return {
          success: false,
          error: 'Invalid number format'
        }
      }

      switch (operation) {
        case 'currency':
          const currency = options.currency || 'USD'
          const locale = options.locale || 'en-US'
          const formatted = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency
          }).format(num)
          
          return {
            success: true,
            data: { result: formatted, currency, locale }
          }
        
        case 'percentage':
          const percentage = new Intl.NumberFormat(options.locale || 'en-US', {
            style: 'percent',
            minimumFractionDigits: options.decimals || 2
          }).format(num)
          
          return {
            success: true,
            data: { result: percentage }
          }
        
        case 'decimal':
          const decimals = options.decimals || 2
          const decimal = num.toFixed(decimals)
          
          return {
            success: true,
            data: { result: decimal }
          }
        
        case 'scientific':
          const scientific = num.toExponential(options.precision || 2)
          
          return {
            success: true,
            data: { result: scientific }
          }
        
        case 'ordinal':
          const ordinal = this.getOrdinal(Math.floor(num))
          
          return {
            success: true,
            data: { result: ordinal }
          }
        
        case 'bytes':
          const bytes = this.formatBytes(num, options.decimals || 2)
          
          return {
            success: true,
            data: { result: bytes }
          }
        
        default:
          return {
            success: false,
            error: `Unsupported number operation: ${operation}`
          }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Number formatting failed: ${error.message || 'Unknown error'}`
      }
    }
  }

  private getOrdinal(num: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd']
    const v = num % 100
    return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0])
  }

  private formatBytes(bytes: number, decimals: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
  }
}

export const FORMATTING_TOOLS = [
  new TextFormatter(),
  new NumberFormatter()
]