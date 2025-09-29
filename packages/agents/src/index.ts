// Complete AI Agent system based on Lamatic.ai architecture

export * from './types'
// export * from './agent'  // TODO: Create agent base class
export * from './executor'
export * from './memory'
export * from './tools'
// Avoid re-exporting templates to prevent duplicate exports
// export * from './templates'

// Main agent engine
export { AgentEngine } from './engine'

// Agent types - only export existing ones
export { TextAgent } from './agents/text-agent'
export { ChatAgent } from './agents/chat-agent'
export { MultimodalAgent } from './agents/multimodal-agent'
// TODO: Export additional agents when implemented
// export { CodeAgent } from './agents/code-agent'
// export { AnalysisAgent } from './agents/analysis-agent'
// export { WorkflowAgent } from './agents/workflow-agent'

// TODO: Export tools when implemented
// export { VectorTool } from './tools/vector-tool'
// export { WebSearchTool } from './tools/web-search-tool'
// export { CodeExecutorTool } from './tools/code-executor-tool'
// export { DatabaseTool } from './tools/database-tool'
// export { APITool } from './tools/api-tool'

// TODO: Export memory systems when implemented
// export { ConversationMemory } from './memory/conversation-memory'
// export { VectorMemory } from './memory/vector-memory'
// export { ContextMemory } from './memory/context-memory'

// TODO: Export agent templates when implemented
// export { CustomerSupportAgent } from './templates/customer-support'
// export { DataAnalysisAgent } from './templates/data-analysis'
// export { ContentGenerationAgent } from './templates/content-generation'
// export { CodeReviewAgent } from './templates/code-review'
// export { ResearchAgent } from './templates/research'