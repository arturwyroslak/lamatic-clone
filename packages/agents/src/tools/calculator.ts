// Calculator Tool for AI Agents
export class CalculatorTool {
  name = 'calculator'
  description = 'Perform mathematical calculations'

  async execute(expression: string): Promise<number> {
    // Safe mathematical expression evaluation
    try {
      // Remove any non-mathematical characters for security
      const cleanExpression = expression.replace(/[^0-9+\-*/().\s]/g, '')
      return Function(`"use strict"; return (${cleanExpression})`)()
    } catch (error) {
      throw new Error(`Invalid mathematical expression: ${expression}`)
    }
  }
}