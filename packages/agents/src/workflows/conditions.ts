// Workflow conditions for decision making
export interface WorkflowCondition {
  id: string
  type: 'comparison' | 'logical' | 'existence' | 'pattern' | 'custom'
  operator: string
  operands: any[]
  description?: string
}

export class ConditionEvaluator {
  evaluate(condition: WorkflowCondition, context: Record<string, any>): boolean {
    switch (condition.type) {
      case 'comparison':
        return this.evaluateComparison(condition, context)
      case 'logical':
        return this.evaluateLogical(condition, context)
      case 'existence':
        return this.evaluateExistence(condition, context)
      case 'pattern':
        return this.evaluatePattern(condition, context)
      case 'custom':
        return this.evaluateCustom(condition, context)
      default:
        throw new Error(`Unknown condition type: ${condition.type}`)
    }
  }

  private evaluateComparison(condition: WorkflowCondition, context: Record<string, any>): boolean {
    const [left, right] = condition.operands.map(operand => this.resolveValue(operand, context))
    
    switch (condition.operator) {
      case 'eq':
      case '==':
        return left == right
      case 'neq':
      case '!=':
        return left != right
      case 'gt':
      case '>':
        return left > right
      case 'gte':
      case '>=':
        return left >= right
      case 'lt':
      case '<':
        return left < right
      case 'lte':
      case '<=':
        return left <= right
      case 'contains':
        return String(left).includes(String(right))
      case 'startsWith':
        return String(left).startsWith(String(right))
      case 'endsWith':
        return String(left).endsWith(String(right))
      case 'in':
        return Array.isArray(right) && right.includes(left)
      default:
        throw new Error(`Unknown comparison operator: ${condition.operator}`)
    }
  }

  private evaluateLogical(condition: WorkflowCondition, context: Record<string, any>): boolean {
    switch (condition.operator) {
      case 'and':
        return condition.operands.every(operand => this.evaluateCondition(operand, context))
      case 'or':
        return condition.operands.some(operand => this.evaluateCondition(operand, context))
      case 'not':
        return !this.evaluateCondition(condition.operands[0], context)
      default:
        throw new Error(`Unknown logical operator: ${condition.operator}`)
    }
  }

  private evaluateExistence(condition: WorkflowCondition, context: Record<string, any>): boolean {
    const value = this.resolveValue(condition.operands[0], context)
    
    switch (condition.operator) {
      case 'exists':
        return value !== undefined && value !== null
      case 'notExists':
        return value === undefined || value === null
      case 'empty':
        return !value || (Array.isArray(value) && value.length === 0) || (typeof value === 'object' && Object.keys(value).length === 0)
      case 'notEmpty':
        return value && (!Array.isArray(value) || value.length > 0) && (typeof value !== 'object' || Object.keys(value).length > 0)
      default:
        throw new Error(`Unknown existence operator: ${condition.operator}`)
    }
  }

  private evaluatePattern(condition: WorkflowCondition, context: Record<string, any>): boolean {
    const value = String(this.resolveValue(condition.operands[0], context))
    const pattern = condition.operands[1]
    
    switch (condition.operator) {
      case 'regex':
        const regex = new RegExp(pattern)
        return regex.test(value)
      case 'glob':
        // Simple glob matching (in real implementation use minimatch or similar)
        const globRegex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'))
        return globRegex.test(value)
      default:
        throw new Error(`Unknown pattern operator: ${condition.operator}`)
    }
  }

  private evaluateCustom(condition: WorkflowCondition, context: Record<string, any>): boolean {
    // Custom condition evaluation
    try {
      // In a real implementation, this would use a safe expression evaluator
      const expression = condition.operands[0]
      return this.evaluateExpression(expression, context)
    } catch (error) {
      console.error('Custom condition evaluation failed:', error)
      return false
    }
  }

  private evaluateCondition(operand: any, context: Record<string, any>): boolean {
    if (typeof operand === 'object' && operand.type) {
      return this.evaluate(operand as WorkflowCondition, context)
    }
    return Boolean(this.resolveValue(operand, context))
  }

  private resolveValue(operand: any, context: Record<string, any>): any {
    if (typeof operand === 'string' && operand.startsWith('$')) {
      // Variable reference
      const path = operand.slice(1)
      return this.getNestedValue(context, path)
    }
    return operand
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined
    }, obj)
  }

  private evaluateExpression(expression: string, context: Record<string, any>): boolean {
    // Mock expression evaluation (in real implementation use a safe evaluator like expr-eval)
    // This is a simplified version for demonstration
    try {
      // Replace variable references
      let processedExpression = expression
      const variableRegex = /\$([a-zA-Z_][a-zA-Z0-9_.]*)/g
      processedExpression = processedExpression.replace(variableRegex, (match, varName) => {
        const value = this.getNestedValue(context, varName)
        return typeof value === 'string' ? `"${value}"` : String(value)
      })
      
      // For safety, only allow basic operations (in real implementation use a proper parser)
      if (!/^[a-zA-Z0-9\s+\-*/%()><=!"&|.]+$/.test(processedExpression)) {
        throw new Error('Invalid expression')
      }
      
      // Mock evaluation - in real implementation, use a safe evaluator
      return Math.random() > 0.5
    } catch {
      return false
    }
  }
}

export const conditionEvaluator = new ConditionEvaluator()

// Common condition builders
export const Conditions = {
  equals: (left: any, right: any): WorkflowCondition => ({
    id: generateId(),
    type: 'comparison',
    operator: 'eq',
    operands: [left, right]
  }),

  notEquals: (left: any, right: any): WorkflowCondition => ({
    id: generateId(),
    type: 'comparison',
    operator: 'neq',
    operands: [left, right]
  }),

  greaterThan: (left: any, right: any): WorkflowCondition => ({
    id: generateId(),
    type: 'comparison',
    operator: 'gt',
    operands: [left, right]
  }),

  lessThan: (left: any, right: any): WorkflowCondition => ({
    id: generateId(),
    type: 'comparison',
    operator: 'lt',
    operands: [left, right]
  }),

  contains: (left: any, right: any): WorkflowCondition => ({
    id: generateId(),
    type: 'comparison',
    operator: 'contains',
    operands: [left, right]
  }),

  exists: (value: any): WorkflowCondition => ({
    id: generateId(),
    type: 'existence',
    operator: 'exists',
    operands: [value]
  }),

  isEmpty: (value: any): WorkflowCondition => ({
    id: generateId(),
    type: 'existence',
    operator: 'empty',
    operands: [value]
  }),

  regex: (value: any, pattern: string): WorkflowCondition => ({
    id: generateId(),
    type: 'pattern',
    operator: 'regex',
    operands: [value, pattern]
  }),

  and: (...conditions: WorkflowCondition[]): WorkflowCondition => ({
    id: generateId(),
    type: 'logical',
    operator: 'and',
    operands: conditions
  }),

  or: (...conditions: WorkflowCondition[]): WorkflowCondition => ({
    id: generateId(),
    type: 'logical',
    operator: 'or',
    operands: conditions
  }),

  not: (condition: WorkflowCondition): WorkflowCondition => ({
    id: generateId(),
    type: 'logical',
    operator: 'not',
    operands: [condition]
  }),

  custom: (expression: string): WorkflowCondition => ({
    id: generateId(),
    type: 'custom',
    operator: 'expression',
    operands: [expression]
  })
}

function generateId(): string {
  return `cond_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}