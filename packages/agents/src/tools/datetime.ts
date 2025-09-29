// Date and time processing tools
import { BaseTool, ToolInput, ToolOutput, ToolCategory } from '../types'

export class DateTimeProcessor implements BaseTool {
  readonly id = 'datetime_processor'
  readonly name = 'DateTime Processor'
  readonly description = 'Process and manipulate date and time values'
  readonly category: ToolCategory = 'utility'

  async execute(input: ToolInput): Promise<ToolOutput> {
    try {
      const { operation, date, format, timezone, locale = 'en-US' } = input

      switch (operation) {
        case 'parse':
          const parsedDate = new Date(date)
          if (isNaN(parsedDate.getTime())) {
            return {
              success: false,
              error: 'Invalid date format'
            }
          }
          
          return {
            success: true,
            data: {
              date: parsedDate.toISOString(),
              timestamp: parsedDate.getTime(),
              valid: true
            }
          }
        
        case 'format':
          const dateObj = new Date(date)
          if (isNaN(dateObj.getTime())) {
            return {
              success: false,
              error: 'Invalid date'
            }
          }
          
          let formatted: string
          switch (format) {
            case 'iso':
              formatted = dateObj.toISOString()
              break
            case 'date':
              formatted = dateObj.toDateString()
              break
            case 'time':
              formatted = dateObj.toTimeString()
              break
            case 'locale':
              formatted = dateObj.toLocaleString(locale)
              break
            default:
              formatted = dateObj.toString()
          }
          
          return {
            success: true,
            data: { formatted }
          }
        
        case 'add':
          const { amount, unit } = input
          const baseDate = new Date(date)
          const result = this.addToDate(baseDate, amount, unit)
          
          return {
            success: true,
            data: {
              result: result.toISOString(),
              timestamp: result.getTime()
            }
          }
        
        case 'diff':
          const { endDate } = input
          const startDate = new Date(date)
          const end = new Date(endDate)
          
          const diffMs = end.getTime() - startDate.getTime()
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
          const diffMinutes = Math.floor(diffMs / (1000 * 60))
          
          return {
            success: true,
            data: {
              milliseconds: diffMs,
              seconds: Math.floor(diffMs / 1000),
              minutes: diffMinutes,
              hours: diffHours,
              days: diffDays
            }
          }
        
        case 'now':
          const now = new Date()
          return {
            success: true,
            data: {
              iso: now.toISOString(),
              timestamp: now.getTime(),
              date: now.toDateString(),
              time: now.toTimeString()
            }
          }
        
        default:
          return {
            success: false,
            error: `Unsupported datetime operation: ${operation}`
          }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `DateTime processing failed: ${error.message || 'Unknown error'}`
      }
    }
  }

  private addToDate(date: Date, amount: number, unit: string): Date {
    const result = new Date(date)
    
    switch (unit) {
      case 'years':
        result.setFullYear(result.getFullYear() + amount)
        break
      case 'months':
        result.setMonth(result.getMonth() + amount)
        break
      case 'days':
        result.setDate(result.getDate() + amount)
        break
      case 'hours':
        result.setHours(result.getHours() + amount)
        break
      case 'minutes':
        result.setMinutes(result.getMinutes() + amount)
        break
      case 'seconds':
        result.setSeconds(result.getSeconds() + amount)
        break
      default:
        throw new Error(`Unsupported time unit: ${unit}`)
    }
    
    return result
  }
}

export class TimezoneConverter implements BaseTool {
  readonly id = 'timezone_converter'
  readonly name = 'Timezone Converter'
  readonly description = 'Convert times between different timezones'
  readonly category: ToolCategory = 'utility'

  async execute(input: ToolInput): Promise<ToolOutput> {
    try {
      const { date, fromTimezone, toTimezone } = input

      if (!date) {
        return {
          success: false,
          error: 'Date is required'
        }
      }

      const dateObj = new Date(date)
      if (isNaN(dateObj.getTime())) {
        return {
          success: false,
          error: 'Invalid date format'
        }
      }

      // Mock timezone conversion
      // In a real implementation, you'd use libraries like moment-timezone or date-fns-tz
      const converted = new Date(dateObj.getTime())
      
      return {
        success: true,
        data: {
          original: {
            date: dateObj.toISOString(),
            timezone: fromTimezone || 'UTC'
          },
          converted: {
            date: converted.toISOString(),
            timezone: toTimezone || 'UTC'
          },
          offset: 0 // Mock offset
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Timezone conversion failed: ${error.message || 'Unknown error'}`
      }
    }
  }
}

export const DATETIME_TOOLS = [
  new DateTimeProcessor(),
  new TimezoneConverter()
]