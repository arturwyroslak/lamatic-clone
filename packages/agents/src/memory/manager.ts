import { ConversationMessage, MemoryConfig } from '../types'
import { ConversationMemory } from './conversation-memory'
import { VectorMemory } from './vector-memory'
import { ContextMemory } from './context-memory'

export class MemoryManager {
  private conversationMemory: ConversationMemory
  private vectorMemory: VectorMemory
  private contextMemory: ContextMemory

  constructor() {
    this.conversationMemory = new ConversationMemory()
    this.vectorMemory = new VectorMemory()
    this.contextMemory = new ContextMemory()
  }

  // Conversation Memory Methods
  async addConversationMessage(sessionId: string, message: ConversationMessage): Promise<void> {
    await this.conversationMemory.addMessage(sessionId, message)
  }

  async getConversationHistory(sessionId: string, limit?: number): Promise<ConversationMessage[]> {
    return await this.conversationMemory.getHistory(sessionId, limit)
  }

  async clearConversationHistory(sessionId: string): Promise<void> {
    await this.conversationMemory.clearHistory(sessionId)
  }

  // Vector Memory Methods
  async storeVectorDocument(sessionId: string, document: any): Promise<string> {
    return await this.vectorMemory.storeDocument(sessionId, document)
  }

  async searchVectorDocuments(sessionId: string, query: string, limit?: number): Promise<any[]> {
    return await this.vectorMemory.searchDocuments(sessionId, query, limit)
  }

  async deleteVectorDocument(sessionId: string, documentId: string): Promise<boolean> {
    return await this.vectorMemory.deleteDocument(sessionId, documentId)
  }

  // Context Memory Methods
  async setContext(sessionId: string, key: string, value: any): Promise<void> {
    await this.contextMemory.setContext(sessionId, key, value)
  }

  async getContext(sessionId: string, key?: string): Promise<any> {
    return await this.contextMemory.getContext(sessionId, key)
  }

  async clearContext(sessionId: string): Promise<void> {
    await this.contextMemory.clearContext(sessionId)
  }

  // Hybrid memory operations
  async getFullContext(sessionId: string, query?: string): Promise<any> {
    const [conversation, context, vectorResults] = await Promise.all([
      this.getConversationHistory(sessionId, 10),
      this.getContext(sessionId),
      query ? this.searchVectorDocuments(sessionId, query, 5) : []
    ])

    return {
      conversation,
      context,
      vectorResults,
      sessionId
    }
  }

  async clearAllMemory(sessionId: string): Promise<void> {
    await Promise.all([
      this.clearConversationHistory(sessionId),
      this.clearContext(sessionId),
      // Note: Vector memory might need special handling for cleanup
    ])
  }

  // Memory configuration
  async configureMemory(sessionId: string, config: MemoryConfig): Promise<void> {
    // Configure memory systems based on config
    if (config.type === 'conversation' || config.type === 'hybrid') {
      await this.conversationMemory.configure(sessionId, config)
    }

    if (config.type === 'vector' || config.type === 'hybrid') {
      await this.vectorMemory.configure(sessionId, config)
    }

    if (config.type === 'context' || config.type === 'hybrid') {
      await this.contextMemory.configure(sessionId, config)
    }
  }

  // Memory analytics
  async getMemoryStats(sessionId: string): Promise<any> {
    const [conversationStats, vectorStats, contextStats] = await Promise.all([
      this.conversationMemory.getStats(sessionId),
      this.vectorMemory.getStats(sessionId),
      this.contextMemory.getStats(sessionId)
    ])

    return {
      conversation: conversationStats,
      vector: vectorStats,
      context: contextStats,
      totalSize: conversationStats.size + vectorStats.size + contextStats.size
    }
  }
}