import { Agent, AgentConfig, AgentExecution, AgentContext } from './types'
import { AgentExecutor } from './executor'
import { MemoryManager } from './memory'
// import { ToolRegistry } from './tools'  // TODO: Implement ToolRegistry
import { EventEmitter } from 'events'

export class AgentEngine extends EventEmitter {
  private agents: Map<string, Agent> = new Map()
  private executor: AgentExecutor
  private memory: MemoryManager
  // private tools: ToolRegistry  // TODO: Implement ToolRegistry
  private activeExecutions: Map<string, AgentExecution> = new Map()

  constructor() {
    super()
    this.executor = new AgentExecutor()
    this.memory = new MemoryManager()
    // this.tools = new ToolRegistry()  // TODO: Implement ToolRegistry
  }

  // Register agent
  registerAgent(agent: Agent): void {
    this.agents.set(agent.id, agent)
    this.emit('agent:registered', agent)
  }

  // Unregister agent
  unregisterAgent(agentId: string): void {
    const agent = this.agents.get(agentId)
    if (agent) {
      this.agents.delete(agentId)
      this.emit('agent:unregistered', agent)
    }
  }

  // Get agent by ID
  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId)
  }

  // List all agents
  listAgents(): Agent[] {
    return Array.from(this.agents.values())
  }

  // Execute agent
  async executeAgent(
    agentId: string,
    input: any,
    context?: Partial<AgentContext>
  ): Promise<AgentExecution> {
    const agent = this.agents.get(agentId)
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`)
    }

    const executionId = this.generateExecutionId()
    const execution: AgentExecution = {
      id: executionId,
      agentId,
      input,
      status: 'pending',
      startTime: new Date(),
      context: {
        sessionId: context?.sessionId || this.generateSessionId(),
        userId: context?.userId,
        metadata: context?.metadata || {},
        tools: [], // TODO: Implement ToolRegistry
        memory: this.memory
      }
    }

    this.activeExecutions.set(executionId, execution)
    this.emit('execution:started', execution)

    try {
      execution.status = 'running'
      this.emit('execution:running', execution)

      // Execute agent
      const result = await this.executor.execute(agent, input, execution.context)
      
      execution.status = 'completed'
      execution.output = result
      execution.endTime = new Date()
      execution.duration = execution.endTime.getTime() - execution.startTime.getTime()

      this.emit('execution:completed', execution)
      return execution

    } catch (error) {
      execution.status = 'failed'
      execution.error = error instanceof Error ? error.message : 'Unknown error'
      execution.endTime = new Date()
      execution.duration = execution.endTime.getTime() - execution.startTime.getTime()

      this.emit('execution:failed', execution)
      throw error
    } finally {
      this.activeExecutions.delete(executionId)
    }
  }

  // Get execution status
  getExecution(executionId: string): AgentExecution | undefined {
    return this.activeExecutions.get(executionId)
  }

  // Cancel execution
  async cancelExecution(executionId: string): Promise<boolean> {
    const execution = this.activeExecutions.get(executionId)
    if (!execution || execution.status !== 'running') {
      return false
    }

    execution.status = 'cancelled'
    execution.endTime = new Date()
    execution.duration = execution.endTime.getTime() - execution.startTime.getTime()
    
    this.activeExecutions.delete(executionId)
    this.emit('execution:cancelled', execution)
    return true
  }

  // Create agent from config
  async createAgent(config: AgentConfig): Promise<Agent> {
    const agent: Agent = {
      id: this.generateAgentId(),
      name: config.name,
      description: config.description || '',
      type: config.type,
      model: config.model,
      systemPrompt: config.systemPrompt,
      tools: config.tools || [],
      memory: config.memory,
      config: config.config || {},
      metadata: config.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.registerAgent(agent)
    return agent
  }

  // Update agent
  async updateAgent(agentId: string, updates: Partial<AgentConfig>): Promise<Agent> {
    const agent = this.agents.get(agentId)
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`)
    }

    Object.assign(agent, {
      ...updates,
      updatedAt: new Date()
    })

    this.agents.set(agentId, agent)
    this.emit('agent:updated', agent)
    return agent
  }

  // Delete agent
  async deleteAgent(agentId: string): Promise<boolean> {
    const agent = this.agents.get(agentId)
    if (!agent) {
      return false
    }

    this.unregisterAgent(agentId)
    this.emit('agent:deleted', { id: agentId })
    return true
  }

  // Agent collaboration
  async executeMultiAgent(
    agentIds: string[],
    input: any,
    collaboration: 'sequential' | 'parallel' | 'hierarchical' = 'sequential'
  ): Promise<any> {
    const agents = agentIds.map(id => this.agents.get(id)).filter(Boolean) as Agent[]
    
    if (agents.length !== agentIds.length) {
      throw new Error('Some agents not found')
    }

    switch (collaboration) {
      case 'sequential':
        return this.executeSequentialAgents(agents, input)
      case 'parallel':
        return this.executeParallelAgents(agents, input)
      case 'hierarchical':
        return this.executeHierarchicalAgents(agents, input)
      default:
        throw new Error(`Unknown collaboration type: ${collaboration}`)
    }
  }

  private async executeSequentialAgents(agents: Agent[], input: any): Promise<any> {
    let currentInput = input
    const results = []

    for (const agent of agents) {
      const execution = await this.executeAgent(agent.id, currentInput)
      results.push(execution.output)
      currentInput = execution.output
    }

    return {
      type: 'sequential',
      results,
      finalOutput: currentInput
    }
  }

  private async executeParallelAgents(agents: Agent[], input: any): Promise<any> {
    const executions = await Promise.all(
      agents.map(agent => this.executeAgent(agent.id, input))
    )

    return {
      type: 'parallel',
      results: executions.map(exec => exec.output),
      executions
    }
  }

  private async executeHierarchicalAgents(agents: Agent[], input: any): Promise<any> {
    // First agent is the coordinator
    const coordinator = agents[0]
    const workers = agents.slice(1)

    // Coordinator decides task distribution
    const coordinatorExecution = await this.executeAgent(coordinator.id, {
      input,
      workers: workers.map(w => ({ id: w.id, name: w.name, type: w.type })),
      task: 'coordinate'
    })

    // Execute worker agents based on coordinator decision
    const workerExecutions = await Promise.all(
      workers.map(worker => this.executeAgent(worker.id, coordinatorExecution.output))
    )

    // Final coordination
    const finalExecution = await this.executeAgent(coordinator.id, {
      workerResults: workerExecutions.map(exec => exec.output),
      task: 'synthesize'
    })

    return {
      type: 'hierarchical',
      coordinator: coordinatorExecution.output,
      workerResults: workerExecutions.map(exec => exec.output),
      finalOutput: finalExecution.output
    }
  }

  // Utility methods
  private generateAgentId(): string {
    return `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Agent templates
  async createFromTemplate(templateName: string, config: Partial<AgentConfig>): Promise<Agent> {
    const templates = {
      'customer-support': {
        name: 'Customer Support Agent',
        type: 'chat' as const,
        systemPrompt: `You are a helpful customer support agent. You provide friendly, accurate, and helpful responses to customer inquiries. Always be polite and professional.`,
        tools: ['search', 'knowledge-base', 'ticket-creation']
      },
      'data-analysis': {
        name: 'Data Analysis Agent',
        type: 'multimodal' as const,
        systemPrompt: `You are a data analysis expert. You can analyze datasets, create visualizations, and provide insights. You explain your findings clearly and suggest actionable recommendations.`,
        tools: ['code-execution', 'chart-generation', 'statistical-analysis']
      },
      'content-generation': {
        name: 'Content Generation Agent',
        type: 'text' as const,
        systemPrompt: `You are a creative content writer. You can generate high-quality content for various purposes including blog posts, marketing copy, and social media content.`,
        tools: ['web-search', 'style-guide', 'seo-optimization']
      }
    }

    const template = templates[templateName as keyof typeof templates]
    if (!template) {
      throw new Error(`Template ${templateName} not found`)
    }

    return this.createAgent({
      ...template,
      ...config,
      model: config.model || 'gpt-3.5-turbo'
    })
  }

  // Metrics and monitoring
  getMetrics(): any {
    const agents = this.listAgents()
    const activeExecutions = Array.from(this.activeExecutions.values())

    return {
      totalAgents: agents.length,
      activeExecutions: activeExecutions.length,
      agentsByType: agents.reduce((acc, agent) => {
        acc[agent.type] = (acc[agent.type] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      executionsByStatus: activeExecutions.reduce((acc, exec) => {
        acc[exec.status] = (acc[exec.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }
  }
}