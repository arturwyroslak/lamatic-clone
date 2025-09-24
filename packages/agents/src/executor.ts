import { Agent, AgentContext, ConversationMessage, ToolCall, ExecutionMetrics } from './types'
import { EventEmitter } from 'events'

export class AgentExecutor extends EventEmitter {
  private activeExecutions: Map<string, AbortController> = new Map()

  async execute(agent: Agent, input: any, context: AgentContext): Promise<any> {
    const executionId = this.generateExecutionId()
    const abortController = new AbortController()
    this.activeExecutions.set(executionId, abortController)

    try {
      this.emit('execution:start', { executionId, agentId: agent.id, input })

      const metrics: ExecutionMetrics = {
        tokensUsed: 0,
        cost: 0,
        latency: 0,
        toolCalls: 0,
        memoryAccess: 0,
        errors: 0
      }

      const startTime = Date.now()
      let result: any

      switch (agent.type) {
        case 'text':
          result = await this.executeTextAgent(agent, input, context, metrics, abortController.signal)
          break
        case 'chat':
          result = await this.executeChatAgent(agent, input, context, metrics, abortController.signal)
          break
        case 'multimodal':
          result = await this.executeMultimodalAgent(agent, input, context, metrics, abortController.signal)
          break
        case 'code':
          result = await this.executeCodeAgent(agent, input, context, metrics, abortController.signal)
          break
        case 'analysis':
          result = await this.executeAnalysisAgent(agent, input, context, metrics, abortController.signal)
          break
        case 'workflow':
          result = await this.executeWorkflowAgent(agent, input, context, metrics, abortController.signal)
          break
        default:
          throw new Error(`Unsupported agent type: ${agent.type}`)
      }

      metrics.latency = Date.now() - startTime

      this.emit('execution:complete', { 
        executionId, 
        agentId: agent.id, 
        result, 
        metrics 
      })

      return result

    } catch (error) {
      this.emit('execution:error', { 
        executionId, 
        agentId: agent.id, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      throw error
    } finally {
      this.activeExecutions.delete(executionId)
    }
  }

  private async executeTextAgent(
    agent: Agent, 
    input: any, 
    context: AgentContext, 
    metrics: ExecutionMetrics,
    signal: AbortSignal
  ): Promise<any> {
    // Prepare the prompt
    const prompt = this.buildPrompt(agent.systemPrompt, input, context)
    
    // Call the model
    const response = await this.callModel(agent.model, prompt, metrics, signal)
    
    // Process output format
    const config = agent.config
    if (config.outputFormat === 'json') {
      try {
        return JSON.parse(response.content)
      } catch {
        return { content: response.content }
      }
    }
    
    return {
      content: response.content,
      type: 'text',
      format: config.outputFormat || 'plain'
    }
  }

  private async executeChatAgent(
    agent: Agent, 
    input: any, 
    context: AgentContext, 
    metrics: ExecutionMetrics,
    signal: AbortSignal
  ): Promise<any> {
    // Get conversation history from memory
    const history = await this.getConversationHistory(context, agent.config.conversationHistory || 10)
    metrics.memoryAccess++

    // Build conversation messages
    const messages: ConversationMessage[] = [
      {
        id: this.generateMessageId(),
        role: 'system',
        content: agent.systemPrompt,
        timestamp: new Date()
      },
      ...history,
      {
        id: this.generateMessageId(),
        role: 'user',
        content: input,
        timestamp: new Date()
      }
    ]

    // Execute tools if needed
    const toolCalls = await this.executeTools(agent.tools, input, context, metrics, signal)
    
    // Call model with conversation context
    const response = await this.callModelWithConversation(agent.model, messages, toolCalls, metrics, signal)
    
    // Store conversation in memory
    await this.storeConversation(context, messages.concat([{
      id: this.generateMessageId(),
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      toolCalls
    }]))
    metrics.memoryAccess++

    return {
      content: response.content,
      type: 'chat',
      conversationId: context.sessionId,
      toolCalls
    }
  }

  private async executeMultimodalAgent(
    agent: Agent, 
    input: any, 
    context: AgentContext, 
    metrics: ExecutionMetrics,
    signal: AbortSignal
  ): Promise<any> {
    // Process different input types
    const processedInput = await this.processMultimodalInput(input, agent.config.supportedMimeTypes || [])
    
    // Build multimodal prompt
    const prompt = this.buildMultimodalPrompt(agent.systemPrompt, processedInput, context)
    
    // Call multimodal model
    const response = await this.callMultimodalModel(agent.model, prompt, metrics, signal)
    
    return {
      content: response.content,
      type: 'multimodal',
      inputTypes: processedInput.types,
      outputType: response.type
    }
  }

  private async executeCodeAgent(
    agent: Agent, 
    input: any, 
    context: AgentContext, 
    metrics: ExecutionMetrics,
    signal: AbortSignal
  ): Promise<any> {
    // Prepare code execution environment
    const environment = await this.setupCodeEnvironment(
      agent.config.executionEnvironment || 'sandbox',
      agent.config.securityLevel || 'sandbox'
    )

    // Build code prompt
    const prompt = this.buildCodePrompt(agent.systemPrompt, input, agent.config.supportedLanguages || [])
    
    // Generate code
    const codeResponse = await this.callModel(agent.model, prompt, metrics, signal)
    
    // Execute code if requested
    let executionResult = null
    if (input.execute !== false) {
      try {
        executionResult = await this.executeCode(
          codeResponse.content, 
          environment, 
          signal
        )
      } catch (error) {
        metrics.errors++
        executionResult = {
          error: error instanceof Error ? error.message : 'Execution failed'
        }
      }
    }

    return {
      code: codeResponse.content,
      execution: executionResult,
      type: 'code',
      language: this.detectLanguage(codeResponse.content)
    }
  }

  private async executeAnalysisAgent(
    agent: Agent, 
    input: any, 
    context: AgentContext, 
    metrics: ExecutionMetrics,
    signal: AbortSignal
  ): Promise<any> {
    // Load analysis tools
    const analysisTools = await this.loadAnalysisTools(agent.config.analyticsTypes || [])
    
    // Process data
    const processedData = await this.processAnalysisData(input)
    
    // Build analysis prompt
    const prompt = this.buildAnalysisPrompt(agent.systemPrompt, processedData, analysisTools)
    
    // Generate analysis
    const analysisResponse = await this.callModel(agent.model, prompt, metrics, signal)
    
    // Generate visualizations if requested
    let visualizations = null
    if (agent.config.dataVisualization) {
      visualizations = await this.generateVisualizations(processedData, analysisResponse.content)
    }

    return {
      analysis: analysisResponse.content,
      data: processedData,
      visualizations,
      type: 'analysis',
      format: agent.config.outputFormat || 'markdown'
    }
  }

  private async executeWorkflowAgent(
    agent: Agent, 
    input: any, 
    context: AgentContext, 
    metrics: ExecutionMetrics,
    signal: AbortSignal
  ): Promise<any> {
    // Parse workflow definition
    const workflow = this.parseWorkflow(input.workflow || input)
    
    // Execute workflow steps
    const results = []
    const maxSteps = agent.config.maxSteps || 100
    
    for (let i = 0; i < Math.min(workflow.steps.length, maxSteps); i++) {
      if (signal.aborted) {
        throw new Error('Execution aborted')
      }

      const step = workflow.steps[i]
      
      try {
        const stepResult = await this.executeWorkflowStep(step, context, metrics, signal)
        results.push(stepResult)
        
        // Check for conditional flow
        if (step.condition && !this.evaluateCondition(step.condition, stepResult)) {
          break
        }
        
      } catch (error) {
        metrics.errors++
        
        if (agent.config.errorHandling === 'stop') {
          throw error
        } else if (agent.config.errorHandling === 'retry') {
          // Retry logic
          const retryResult = await this.retryWorkflowStep(step, context, metrics, signal)
          results.push(retryResult)
        } else {
          // Continue with error logged
          results.push({ error: error instanceof Error ? error.message : 'Step failed' })
        }
      }
    }

    return {
      workflow: workflow.name,
      steps: results,
      type: 'workflow',
      completed: results.length,
      total: workflow.steps.length
    }
  }

  // Utility methods
  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private buildPrompt(systemPrompt: string, input: any, context: AgentContext): string {
    return `${systemPrompt}\n\nUser: ${typeof input === 'string' ? input : JSON.stringify(input)}`
  }

  private buildMultimodalPrompt(systemPrompt: string, input: any, context: AgentContext): any {
    return {
      system: systemPrompt,
      input: input,
      context: context.metadata
    }
  }

  private buildCodePrompt(systemPrompt: string, input: any, languages: string[]): string {
    const supportedLangs = languages.length > 0 ? languages.join(', ') : 'any'
    return `${systemPrompt}\n\nSupported languages: ${supportedLangs}\n\nRequest: ${typeof input === 'string' ? input : JSON.stringify(input)}`
  }

  private buildAnalysisPrompt(systemPrompt: string, data: any, tools: any[]): string {
    return `${systemPrompt}\n\nAvailable tools: ${tools.map(t => t.name).join(', ')}\n\nData to analyze: ${JSON.stringify(data)}`
  }

  private async callModel(model: any, prompt: string, metrics: ExecutionMetrics, signal: AbortSignal): Promise<any> {
    // Mock implementation - in real app, this would call the actual model API
    metrics.tokensUsed = (metrics.tokensUsed || 0) + prompt.length / 4 // Rough estimate
    metrics.cost = (metrics.cost || 0) + (metrics.tokensUsed * 0.00002) // Rough estimate
    
    await new Promise(resolve => setTimeout(resolve, 100)) // Simulate API call
    
    return {
      content: `Response to: ${prompt.substring(0, 100)}...`,
      type: 'text'
    }
  }

  private async callModelWithConversation(model: any, messages: ConversationMessage[], toolCalls: ToolCall[], metrics: ExecutionMetrics, signal: AbortSignal): Promise<any> {
    const totalTokens = messages.reduce((acc, msg) => acc + (typeof msg.content === 'string' ? msg.content.length : 100), 0) / 4
    metrics.tokensUsed = (metrics.tokensUsed || 0) + totalTokens
    metrics.cost = (metrics.cost || 0) + (totalTokens * 0.00002)
    
    await new Promise(resolve => setTimeout(resolve, 150)) // Simulate API call
    
    return {
      content: `Chat response based on conversation history`,
      type: 'chat'
    }
  }

  private async callMultimodalModel(model: any, prompt: any, metrics: ExecutionMetrics, signal: AbortSignal): Promise<any> {
    metrics.tokensUsed = (metrics.tokensUsed || 0) + 200 // Higher token usage for multimodal
    metrics.cost = (metrics.cost || 0) + (200 * 0.00005) // Higher cost for multimodal
    
    await new Promise(resolve => setTimeout(resolve, 200)) // Simulate API call
    
    return {
      content: `Multimodal analysis result`,
      type: 'multimodal'
    }
  }

  private async getConversationHistory(context: AgentContext, limit: number): Promise<ConversationMessage[]> {
    // Mock implementation - would retrieve from memory system
    return []
  }

  private async storeConversation(context: AgentContext, messages: ConversationMessage[]): Promise<void> {
    // Mock implementation - would store in memory system
  }

  private async executeTools(tools: string[], input: any, context: AgentContext, metrics: ExecutionMetrics, signal: AbortSignal): Promise<ToolCall[]> {
    // Mock implementation - would execute actual tools
    metrics.toolCalls = (metrics.toolCalls || 0) + tools.length
    return []
  }

  private async processMultimodalInput(input: any, supportedTypes: string[]): Promise<any> {
    return { data: input, types: ['text'] }
  }

  private async setupCodeEnvironment(environment: string, securityLevel: string): Promise<any> {
    return { environment, securityLevel }
  }

  private async executeCode(code: string, environment: any, signal: AbortSignal): Promise<any> {
    // Mock implementation - would execute in secure environment
    return { output: 'Code executed successfully', exitCode: 0 }
  }

  private detectLanguage(code: string): string {
    if (code.includes('def ') && code.includes(':')) return 'python'
    if (code.includes('function ') || code.includes('=>')) return 'javascript'
    if (code.includes('public class ')) return 'java'
    return 'unknown'
  }

  private async loadAnalysisTools(types: string[]): Promise<any[]> {
    return types.map(type => ({ name: type, type: 'analysis' }))
  }

  private async processAnalysisData(input: any): Promise<any> {
    return { processed: true, data: input }
  }

  private async generateVisualizations(data: any, analysis: string): Promise<any> {
    return { charts: [], graphs: [] }
  }

  private parseWorkflow(workflow: any): any {
    if (typeof workflow === 'string') {
      try {
        return JSON.parse(workflow)
      } catch {
        return { name: 'Simple Workflow', steps: [{ action: workflow }] }
      }
    }
    return workflow
  }

  private async executeWorkflowStep(step: any, context: AgentContext, metrics: ExecutionMetrics, signal: AbortSignal): Promise<any> {
    // Mock implementation - would execute workflow step
    await new Promise(resolve => setTimeout(resolve, 50))
    return { stepId: step.id, result: 'completed', output: step.action }
  }

  private async retryWorkflowStep(step: any, context: AgentContext, metrics: ExecutionMetrics, signal: AbortSignal): Promise<any> {
    return this.executeWorkflowStep(step, context, metrics, signal)
  }

  private evaluateCondition(condition: string, result: any): boolean {
    // Simple condition evaluation - in real app would be more sophisticated
    return true
  }

  cancel(executionId: string): boolean {
    const controller = this.activeExecutions.get(executionId)
    if (controller) {
      controller.abort()
      this.activeExecutions.delete(executionId)
      return true
    }
    return false
  }
}