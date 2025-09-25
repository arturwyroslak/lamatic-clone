import { ConversationMessage, MemoryConfig } from '../types'

export class ConversationMemory {
  private conversations: Map<string, ConversationMessage[]> = new Map()
  private config: Map<string, MemoryConfig> = new Map()

  async addMessage(sessionId: string, message: ConversationMessage): Promise<void> {
    const conversation = this.conversations.get(sessionId) || []
    const config = this.config.get(sessionId)
    
    conversation.push({
      ...message,
      timestamp: new Date()
    })

    // Apply retention policy
    if (config?.maxSize && conversation.length > config.maxSize) {
      conversation.splice(0, conversation.length - config.maxSize)
    }

    this.conversations.set(sessionId, conversation)
    
    // Schedule cleanup based on retention days
    if (config?.retentionDays) {
      this.scheduleCleanup(sessionId, config.retentionDays)
    }
  }

  async getHistory(sessionId: string, limit?: number): Promise<ConversationMessage[]> {
    const conversation = this.conversations.get(sessionId) || []
    
    if (limit) {
      return conversation.slice(-limit)
    }
    
    return [...conversation]
  }

  async getMessagesByRole(sessionId: string, role: string): Promise<ConversationMessage[]> {
    const conversation = this.conversations.get(sessionId) || []
    return conversation.filter(msg => msg.role === role)
  }

  async getMessagesByDateRange(sessionId: string, startDate: Date, endDate: Date): Promise<ConversationMessage[]> {
    const conversation = this.conversations.get(sessionId) || []
    return conversation.filter(msg => 
      msg.timestamp >= startDate && msg.timestamp <= endDate
    )
  }

  async searchMessages(sessionId: string, query: string): Promise<ConversationMessage[]> {
    const conversation = this.conversations.get(sessionId) || []
    const lowerQuery = query.toLowerCase()
    
    return conversation.filter(msg => {
      if (typeof msg.content === 'string') {
        return msg.content.toLowerCase().includes(lowerQuery)
      }
      
      if (typeof msg.content === 'object') {
        return JSON.stringify(msg.content).toLowerCase().includes(lowerQuery)
      }
      
      return false
    })
  }

  async updateMessage(sessionId: string, messageId: string, updates: Partial<ConversationMessage>): Promise<boolean> {
    const conversation = this.conversations.get(sessionId) || []
    const messageIndex = conversation.findIndex(msg => msg.id === messageId)
    
    if (messageIndex === -1) {
      return false
    }
    
    conversation[messageIndex] = {
      ...conversation[messageIndex],
      ...updates,
      timestamp: conversation[messageIndex].timestamp // Preserve original timestamp
    }
    
    this.conversations.set(sessionId, conversation)
    return true
  }

  async deleteMessage(sessionId: string, messageId: string): Promise<boolean> {
    const conversation = this.conversations.get(sessionId) || []
    const initialLength = conversation.length
    
    const filteredConversation = conversation.filter(msg => msg.id !== messageId)
    
    if (filteredConversation.length < initialLength) {
      this.conversations.set(sessionId, filteredConversation)
      return true
    }
    
    return false
  }

  async clearHistory(sessionId: string): Promise<void> {
    this.conversations.delete(sessionId)
    this.config.delete(sessionId)
  }

  async configure(sessionId: string, config: MemoryConfig): Promise<void> {
    this.config.set(sessionId, config)
    
    // Apply configuration immediately
    const conversation = this.conversations.get(sessionId) || []
    
    if (config.maxSize && conversation.length > config.maxSize) {
      const trimmedConversation = conversation.slice(-config.maxSize)
      this.conversations.set(sessionId, trimmedConversation)
    }
  }

  async getStats(sessionId: string): Promise<any> {
    const conversation = this.conversations.get(sessionId) || []
    const config = this.config.get(sessionId)
    
    const messagesByRole = conversation.reduce((acc, msg) => {
      acc[msg.role] = (acc[msg.role] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const totalTokens = conversation.reduce((acc, msg) => {
      if (typeof msg.content === 'string') {
        return acc + Math.ceil(msg.content.length / 4) // Rough token estimate
      }
      return acc + 50 // Rough estimate for non-string content
    }, 0)
    
    const oldestMessage = conversation.length > 0 ? conversation[0].timestamp : null
    const newestMessage = conversation.length > 0 ? conversation[conversation.length - 1].timestamp : null
    
    return {
      messageCount: conversation.length,
      messagesByRole,
      estimatedTokens: totalTokens,
      oldestMessage,
      newestMessage,
      size: JSON.stringify(conversation).length,
      config: config || null
    }
  }

  async exportConversation(sessionId: string): Promise<any> {
    const conversation = this.conversations.get(sessionId) || []
    const config = this.config.get(sessionId)
    const stats = await this.getStats(sessionId)
    
    return {
      sessionId,
      conversation,
      config,
      stats,
      exportedAt: new Date()
    }
  }

  async importConversation(sessionId: string, data: any): Promise<void> {
    if (data.conversation && Array.isArray(data.conversation)) {
      this.conversations.set(sessionId, data.conversation)
    }
    
    if (data.config) {
      this.config.set(sessionId, data.config)
    }
  }

  private scheduleCleanup(sessionId: string, retentionDays: number): void {
    // In a real implementation, this would use a job queue or scheduler
    setTimeout(() => {
      this.cleanupOldMessages(sessionId, retentionDays)
    }, 24 * 60 * 60 * 1000) // Check daily
  }

  private async cleanupOldMessages(sessionId: string, retentionDays: number): Promise<void> {
    const conversation = this.conversations.get(sessionId) || []
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)
    
    const filteredConversation = conversation.filter(msg => 
      msg.timestamp > cutoffDate
    )
    
    if (filteredConversation.length !== conversation.length) {
      this.conversations.set(sessionId, filteredConversation)
    }
  }

  // Utility methods
  async getSummary(sessionId: string): Promise<string> {
    const conversation = this.conversations.get(sessionId) || []
    
    if (conversation.length === 0) {
      return 'No conversation history available.'
    }
    
    const stats = await this.getStats(sessionId)
    
    return `Conversation contains ${stats.messageCount} messages with ${stats.estimatedTokens} estimated tokens. ` +
           `Messages by role: ${Object.entries(stats.messagesByRole).map(([role, count]) => `${role}: ${count}`).join(', ')}.`
  }

  async getContextWindow(sessionId: string, windowSize: number = 4000): Promise<ConversationMessage[]> {
    const conversation = this.conversations.get(sessionId) || []
    const result: ConversationMessage[] = []
    let currentTokens = 0
    
    // Work backwards from the most recent messages
    for (let i = conversation.length - 1; i >= 0; i--) {
      const message = conversation[i]
      const messageTokens = typeof message.content === 'string' 
        ? Math.ceil(message.content.length / 4) 
        : 50
      
      if (currentTokens + messageTokens > windowSize && result.length > 0) {
        break
      }
      
      result.unshift(message)
      currentTokens += messageTokens
    }
    
    return result
  }
}