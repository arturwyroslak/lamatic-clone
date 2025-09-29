// Data validation tools
import { BaseTool, ToolInput, ToolOutput, ToolCategory } from '../types'

export class DataValidator implements BaseTool {
  readonly id = 'data_validator'
  readonly name = 'Data Validator'
  readonly description = 'Validate data against various formats and schemas'
  readonly category: ToolCategory = 'utility'

  async execute(input: ToolInput): Promise<ToolOutput> {
    try {
      const { data, validationType, schema, options = {} } = input

      switch (validationType) {
        case 'email':
          return this.validateEmail(data)
        
        case 'url':
          return this.validateURL(data)
        
        case 'phone':
          return this.validatePhone(data, options.country)
        
        case 'json':
          return this.validateJSON(data)
        
        case 'schema':
          return this.validateSchema(data, schema)
        
        case 'credit_card':
          return this.validateCreditCard(data)
        
        case 'date':
          return this.validateDate(data)
        
        default:
          return {
            success: false,
            error: `Unsupported validation type: ${validationType}`
          }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Validation failed: ${error.message || 'Unknown error'}`
      }
    }
  }

  private validateEmail(email: string): ToolOutput {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const isValid = emailRegex.test(email)
    
    return {
      success: true,
      data: {
        valid: isValid,
        value: email,
        errors: isValid ? [] : ['Invalid email format']
      }
    }
  }

  private validateURL(url: string): ToolOutput {
    try {
      new URL(url)
      return {
        success: true,
        data: {
          valid: true,
          value: url,
          errors: []
        }
      }
    } catch {
      return {
        success: true,
        data: {
          valid: false,
          value: url,
          errors: ['Invalid URL format']
        }
      }
    }
  }

  private validatePhone(phone: string, country?: string): ToolOutput {
    // Simple phone validation - in reality would use libphonenumber
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
    const isValid = phoneRegex.test(phone)
    
    return {
      success: true,
      data: {
        valid: isValid,
        value: phone,
        country: country || 'unknown',
        errors: isValid ? [] : ['Invalid phone number format']
      }
    }
  }

  private validateJSON(jsonString: string): ToolOutput {
    try {
      JSON.parse(jsonString)
      return {
        success: true,
        data: {
          valid: true,
          value: jsonString,
          errors: []
        }
      }
    } catch (error: any) {
      return {
        success: true,
        data: {
          valid: false,
          value: jsonString,
          errors: [error.message]
        }
      }
    }
  }

  private validateSchema(data: any, schema: any): ToolOutput {
    // Mock schema validation - in reality would use ajv or joi
    const errors: string[] = []
    
    if (schema.required) {
      for (const field of schema.required) {
        if (!data[field]) {
          errors.push(`Missing required field: ${field}`)
        }
      }
    }
    
    if (schema.properties) {
      for (const [field, fieldSchema] of Object.entries(schema.properties)) {
        if (data[field] && (fieldSchema as any).type) {
          const expectedType = (fieldSchema as any).type
          const actualType = typeof data[field]
          
          if (expectedType !== actualType) {
            errors.push(`Field ${field} should be ${expectedType}, got ${actualType}`)
          }
        }
      }
    }
    
    return {
      success: true,
      data: {
        valid: errors.length === 0,
        value: data,
        errors
      }
    }
  }

  private validateCreditCard(cardNumber: string): ToolOutput {
    // Luhn algorithm implementation
    const cleanNumber = cardNumber.replace(/\D/g, '')
    
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      return {
        success: true,
        data: {
          valid: false,
          value: cardNumber,
          errors: ['Invalid credit card number length']
        }
      }
    }
    
    let sum = 0
    let isEven = false
    
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber[i])
      
      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }
      
      sum += digit
      isEven = !isEven
    }
    
    const isValid = sum % 10 === 0
    
    return {
      success: true,
      data: {
        valid: isValid,
        value: cardNumber,
        errors: isValid ? [] : ['Invalid credit card number']
      }
    }
  }

  private validateDate(dateString: string): ToolOutput {
    const date = new Date(dateString)
    const isValid = !isNaN(date.getTime())
    
    return {
      success: true,
      data: {
        valid: isValid,
        value: dateString,
        parsed: isValid ? date.toISOString() : null,
        errors: isValid ? [] : ['Invalid date format']
      }
    }
  }
}

export const VALIDATION_TOOLS = [
  new DataValidator()
]