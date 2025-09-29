// File processing tools for common file operations
import { BaseTool, ToolInput, ToolOutput, ToolCategory } from '../types'

export class FileProcessor implements BaseTool {
  readonly id = 'file_processor'
  readonly name = 'File Processor'
  readonly description = 'Process and manipulate files'
  readonly category: ToolCategory = 'file'

  async execute(input: ToolInput): Promise<ToolOutput> {
    try {
      const { operation, filePath, content, encoding = 'utf8' } = input

      switch (operation) {
        case 'read':
          return {
            success: true,
            data: {
              content: `Mock file content from ${filePath}`,
              size: 1024,
              encoding
            }
          }
        
        case 'write':
          return {
            success: true,
            data: {
              bytesWritten: content?.length || 0,
              path: filePath
            }
          }
        
        case 'exists':
          return {
            success: true,
            data: {
              exists: true,
              isFile: true,
              isDirectory: false
            }
          }
        
        case 'stats':
          return {
            success: true,
            data: {
              size: 1024,
              created: new Date(),
              modified: new Date(),
              accessed: new Date()
            }
          }
        
        default:
          return {
            success: false,
            error: `Unsupported operation: ${operation}`
          }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `File processing failed: ${error.message || 'Unknown error'}`
      }
    }
  }
}

export class TextProcessor implements BaseTool {
  readonly id = 'text_processor'
  readonly name = 'Text Processor'
  readonly description = 'Process and analyze text content'
  readonly category: ToolCategory = 'utility'

  async execute(input: ToolInput): Promise<ToolOutput> {
    try {
      const { text, operation, options = {} } = input

      if (!text) {
        return {
          success: false,
          error: 'Text content is required'
        }
      }

      switch (operation) {
        case 'word_count':
          return {
            success: true,
            data: {
              words: text.split(/\s+/).length,
              characters: text.length,
              charactersNoSpaces: text.replace(/\s/g, '').length,
              sentences: text.split(/[.!?]+/).length - 1,
              paragraphs: text.split(/\n\s*\n/).length
            }
          }
        
        case 'extract_keywords':
          const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 3)
          const wordCount = words.reduce((acc, word) => {
            acc[word] = (acc[word] || 0) + 1
            return acc
          }, {} as Record<string, number>)
          
          const keywords = Object.entries(wordCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, options.limit || 10)
            .map(([word, count]) => ({ word, count }))
          
          return {
            success: true,
            data: { keywords }
          }
        
        case 'sentiment':
          // Mock sentiment analysis
          const positive = ['good', 'great', 'excellent', 'amazing', 'wonderful']
          const negative = ['bad', 'terrible', 'awful', 'horrible', 'disappointing']
          
          const textLower = text.toLowerCase()
          const positiveCount = positive.reduce((acc, word) => acc + (textLower.includes(word) ? 1 : 0), 0)
          const negativeCount = negative.reduce((acc, word) => acc + (textLower.includes(word) ? 1 : 0), 0)
          
          let sentiment: string
          let score: number
          
          if (positiveCount > negativeCount) {
            sentiment = 'positive'
            score = 0.7
          } else if (negativeCount > positiveCount) {
            sentiment = 'negative'
            score = -0.7
          } else {
            sentiment = 'neutral'
            score = 0
          }
          
          return {
            success: true,
            data: { sentiment, score, positiveCount, negativeCount }
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
        error: `Text processing failed: ${error.message || 'Unknown error'}`
      }
    }
  }
}

export const FILE_PROCESSING_TOOLS = [
  new FileProcessor(),
  new TextProcessor()
]