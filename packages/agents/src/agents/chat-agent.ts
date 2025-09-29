// Conversational Chat Agent
import { BaseAgent, AgentConfig, AgentContext, AgentResult } from '../types'
import { ConversationMemory } from '../memory'

export interface ChatAgentConfig extends AgentConfig {
  persona?: string
  conversationStyle?: 'professional' | 'casual' | 'creative' | 'analytical'
  maxContextLength?: number
  memoryRetention?: 'session' | 'persistent' | 'rolling'
  responseFormat?: 'text' | 'markdown' | 'structured'
}

export class ChatAgent extends BaseAgent {
  private conversationMemory: ConversationMemory
  private persona: string
  private style: string
  private maxContextLength: number

  constructor(config: ChatAgentConfig) {
    super({
      ...config,
      type: 'chat',
      capabilities: ['conversation', 'context-awareness', 'personality', 'memory'],
      description: 'Conversational agent with personality and memory'
    })

    this.persona = config.persona || 'A helpful and knowledgeable assistant'
    this.style = config.conversationStyle || 'professional'
    this.maxContextLength = config.maxContextLength || 4000
    this.conversationMemory = new ConversationMemory()
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now()
    
    try {
      // Get conversation history
      const history = await this.conversationMemory.getHistory(context.sessionId || 'default')
      
      // Build conversation context
      const conversationContext = this.buildConversationContext(history, context.input)
      
      // Generate response based on conversation style
      const response = await this.generateResponse(conversationContext, context)
      
      // Store in conversation memory
      await this.conversationMemory.addMessage(context.sessionId || 'default', {
        role: 'user',
        content: context.input,
        timestamp: new Date()
      })
      
      await this.conversationMemory.addMessage(context.sessionId || 'default', {
        role: 'assistant',
        content: response.content,
        timestamp: new Date()
      })

      return {
        success: true,
        content: response.content,
        metadata: {
          executionTime: Date.now() - startTime,
          conversationTurns: history.length / 2 + 1,
          persona: this.persona,
          style: this.style,
          memoryUsed: response.memoryUsed
        },
        usage: response.usage
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Chat generation failed',
        metadata: {
          executionTime: Date.now() - startTime
        }
      }
    }
  }

  private buildConversationContext(history: any[], currentInput: string): string {
    let context = `Persona: ${this.persona}\n`
    context += `Style: ${this.style}\n`
    context += `Instructions: Respond in a ${this.style} manner while maintaining your persona.\n\n`
    
    // Add recent conversation history
    const recentHistory = history.slice(-10) // Last 10 messages
    if (recentHistory.length > 0) {
      context += 'Recent conversation:\n'
      for (const message of recentHistory) {
        context += `${message.role}: ${message.content}\n`
      }
      context += '\n'
    }
    
    context += `User: ${currentInput}\nAssistant:`
    
    return context
  }

  private async generateResponse(conversationContext: string, context: AgentContext): Promise<{
    content: string
    usage?: any
    memoryUsed: number
  }> {
    // Simulate AI model call (would integrate with actual AI service)
    const modelResponse = await this.callLanguageModel({
      prompt: conversationContext,
      maxTokens: 500,
      temperature: this.style === 'creative' ? 0.8 : 0.7,
      style: this.style
    })

    return {
      content: modelResponse.text,
      usage: modelResponse.usage,
      memoryUsed: conversationContext.length
    }
  }

  private async callLanguageModel(params: {
    prompt: string
    maxTokens: number
    temperature: number
    style: string
  }): Promise<{ text: string; usage?: any }> {
    // Mock implementation - replace with actual AI model integration
    const responses = {
      professional: "I understand your request and I'm here to help. Let me provide you with a comprehensive response based on the information available.",
      casual: "Hey! I got what you're asking about. Let me break this down for you in a way that makes sense.",
      creative: "What an interesting question! Let me explore this with you and share some creative insights that might spark new ideas.",
      analytical: "Based on the data and context provided, I can analyze this systematically and provide you with a structured response."
    }

    const baseResponse = responses[params.style as keyof typeof responses] || responses.professional
    
    return {
      text: `${baseResponse} [Generated response for: "${params.prompt.slice(-100)}..."]`,
      usage: {
        prompt_tokens: params.prompt.length / 4,
        completion_tokens: 100,
        total_tokens: params.prompt.length / 4 + 100
      }
    }
  }

  async getConversationHistory(sessionId: string): Promise<any[]> {
    return this.conversationMemory.getHistory(sessionId)
  }

  async clearConversationHistory(sessionId: string): Promise<void> {
    await this.conversationMemory.clearHistory(sessionId)
  }

  async setPersona(persona: string): Promise<void> {
    this.persona = persona
  }

  async setStyle(style: 'professional' | 'casual' | 'creative' | 'analytical'): Promise<void> {
    this.style = style
  }
}