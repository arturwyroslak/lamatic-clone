import { EventEmitter } from 'events'
import { WorkflowDefinition, WorkflowExecution, WorkflowNode, WorkflowConnection, WorkflowContext } from '../types'
import { AgentEngine } from '../engine'
import { IntegrationManager } from '../../../integrations/src/manager'

export interface WorkflowExecutionStep {
  nodeId: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  input?: any
  output?: any
  error?: string
  startTime?: Date
  endTime?: Date
  duration?: number
}

export interface WorkflowExecutionTrace {
  executionId: string
  workflowId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  steps: WorkflowExecutionStep[]
  startTime: Date
  endTime?: Date
  duration?: number
  context: WorkflowContext
  input: any
  output?: any
  error?: string
}

export class WorkflowEngine extends EventEmitter {
  private workflows: Map<string, WorkflowDefinition> = new Map()
  private executions: Map<string, WorkflowExecutionTrace> = new Map()
  private agentEngine: AgentEngine
  private integrationManager: IntegrationManager

  constructor(agentEngine: AgentEngine, integrationManager: IntegrationManager) {
    super()
    this.agentEngine = agentEngine
    this.integrationManager = integrationManager
  }

  // Register workflow
  registerWorkflow(workflow: WorkflowDefinition): void {
    this.workflows.set(workflow.id, workflow)
    this.emit('workflow:registered', workflow)
  }

  // Execute workflow
  async executeWorkflow(
    workflowId: string,
    input: any,
    context?: Partial<WorkflowContext>
  ): Promise<WorkflowExecutionTrace> {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`)
    }

    const executionId = this.generateExecutionId()
    const execution: WorkflowExecutionTrace = {
      executionId,
      workflowId,
      status: 'pending',
      steps: [],
      startTime: new Date(),
      context: {
        executionId,
        workflowId,
        userId: context?.userId || 'anonymous',
        workspaceId: context?.workspaceId || 'default',
        variables: context?.variables || {},
        ...context
      },
      input
    }

    this.executions.set(executionId, execution)
    this.emit('workflow:started', execution)

    try {
      execution.status = 'running'
      this.emit('workflow:running', execution)

      // Execute workflow steps
      await this.executeWorkflowSteps(workflow, execution)

      execution.status = 'completed'
      execution.endTime = new Date()
      execution.duration = execution.endTime.getTime() - execution.startTime.getTime()

      this.emit('workflow:completed', execution)
      return execution

    } catch (error) {
      execution.status = 'failed'
      execution.error = error instanceof Error ? error.message : 'Unknown error'
      execution.endTime = new Date()
      execution.duration = execution.endTime.getTime() - execution.startTime.getTime()

      this.emit('workflow:failed', execution)
      throw error
    }
  }

  // Execute workflow steps with proper sequencing
  private async executeWorkflowSteps(
    workflow: WorkflowDefinition,
    execution: WorkflowExecutionTrace
  ): Promise<void> {
    const nodeMap = new Map(workflow.nodes.map(node => [node.id, node]))
    const connectionMap = this.buildConnectionMap(workflow.connections)
    const executedNodes = new Set<string>()
    const nodeOutputs = new Map<string, any>()

    // Find entry nodes (nodes with no incoming connections)
    const entryNodes = workflow.nodes.filter(
      node => !workflow.connections.some(conn => conn.target === node.id)
    )

    if (entryNodes.length === 0) {
      throw new Error('Workflow has no entry nodes')
    }

    // Execute workflow using topological sort
    const nodesToExecute = [...entryNodes]

    while (nodesToExecute.length > 0) {
      const currentBatch = [...nodesToExecute]
      nodesToExecute.length = 0

      // Execute current batch (can be parallel if no dependencies between them)
      const batchPromises = currentBatch.map(async node => {
        if (executedNodes.has(node.id)) return

        // Check if all dependencies are satisfied
        const incomingConnections = workflow.connections.filter(conn => conn.target === node.id)
        const dependenciesSatisfied = incomingConnections.every(conn => 
          executedNodes.has(conn.source)
        )

        if (!dependenciesSatisfied) {
          // Re-add to queue for later execution
          nodesToExecute.push(node)
          return
        }

        // Collect inputs from previous nodes
        const nodeInput = this.collectNodeInputs(node, incomingConnections, nodeOutputs, execution.input)

        // Execute the node
        const stepResult = await this.executeWorkflowNode(node, nodeInput, execution.context)
        
        // Update execution trace
        execution.steps.push(stepResult)
        executedNodes.add(node.id)
        nodeOutputs.set(node.id, stepResult.output)

        this.emit('workflow:step_completed', { execution, step: stepResult })

        // Add next nodes to execution queue
        const outgoingConnections = connectionMap.get(node.id) || []
        outgoingConnections.forEach(conn => {
          const targetNode = nodeMap.get(conn.target)
          if (targetNode && !executedNodes.has(targetNode.id)) {
            nodesToExecute.push(targetNode)
          }
        })
      })

      await Promise.all(batchPromises)
    }

    // Set final output (from final nodes)
    const finalNodes = workflow.nodes.filter(
      node => !workflow.connections.some(conn => conn.source === node.id)
    )
    
    if (finalNodes.length === 1) {
      execution.output = nodeOutputs.get(finalNodes[0].id)
    } else if (finalNodes.length > 1) {
      execution.output = Object.fromEntries(
        finalNodes.map(node => [node.id, nodeOutputs.get(node.id)])
      )
    }
  }

  // Execute individual workflow node
  private async executeWorkflowNode(
    node: WorkflowNode,
    input: any,
    context: WorkflowContext
  ): Promise<WorkflowExecutionStep> {
    const step: WorkflowExecutionStep = {
      nodeId: node.id,
      status: 'running',
      input,
      startTime: new Date()
    }

    try {
      let output: any

      switch (node.type) {
        case 'agent':
          // Execute AI agent
          const agentExecution = await this.agentEngine.executeAgent(
            node.data.agentId,
            input,
            context
          )
          output = agentExecution.output
          break

        case 'integration':
          // Execute integration action
          output = await this.integrationManager.executeAction(
            node.data.connectorId,
            node.data.action,
            input
          )
          break

        case 'transform':
          // Data transformation
          output = this.executeTransformation(node.data.transformation, input)
          break

        case 'condition':
          // Conditional logic
          output = this.evaluateCondition(node.data.condition, input)
          break

        case 'delay':
          // Add delay
          await this.delay(node.data.duration || 1000)
          output = input
          break

        case 'parallel':
          // Execute parallel branches
          output = await this.executeParallelBranches(node.data.branches, input, context)
          break

        default:
          throw new Error(`Unknown node type: ${node.type}`)
      }

      step.status = 'completed'
      step.output = output
      step.endTime = new Date()
      step.duration = step.endTime.getTime() - step.startTime!.getTime()

      return step

    } catch (error) {
      step.status = 'failed'
      step.error = error instanceof Error ? error.message : 'Unknown error'
      step.endTime = new Date()
      step.duration = step.endTime.getTime() - step.startTime!.getTime()

      throw error
    }
  }

  // Helper methods
  private buildConnectionMap(connections: WorkflowConnection[]): Map<string, WorkflowConnection[]> {
    const map = new Map<string, WorkflowConnection[]>()
    connections.forEach(conn => {
      if (!map.has(conn.source)) {
        map.set(conn.source, [])
      }
      map.get(conn.source)!.push(conn)
    })
    return map
  }

  private collectNodeInputs(
    node: WorkflowNode,
    incomingConnections: WorkflowConnection[],
    nodeOutputs: Map<string, any>,
    workflowInput: any
  ): any {
    if (incomingConnections.length === 0) {
      return workflowInput
    }

    if (incomingConnections.length === 1) {
      return nodeOutputs.get(incomingConnections[0].source)
    }

    // Multiple inputs - combine them
    const inputs: Record<string, any> = {}
    incomingConnections.forEach(conn => {
      inputs[conn.source] = nodeOutputs.get(conn.source)
    })
    return inputs
  }

  private executeTransformation(transformation: any, input: any): any {
    // Simple transformation logic - would be more sophisticated in practice
    if (transformation.type === 'javascript') {
      // Execute JavaScript transformation
      const func = new Function('input', transformation.code)
      return func(input)
    }
    return input
  }

  private evaluateCondition(condition: any, input: any): any {
    // Simple condition evaluation
    const func = new Function('input', `return ${condition.expression}`)
    return func(input)
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private async executeParallelBranches(branches: any[], input: any, context: WorkflowContext): Promise<any> {
    const results = await Promise.all(
      branches.map(branch => this.executeBranch(branch, input, context))
    )
    return results
  }

  private async executeBranch(branch: any, input: any, context: WorkflowContext): Promise<any> {
    // Execute a branch of parallel execution
    // This would recursively execute a sub-workflow
    return input // Simplified for now
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Get execution status
  getExecution(executionId: string): WorkflowExecutionTrace | undefined {
    return this.executions.get(executionId)
  }

  // List all executions
  listExecutions(): WorkflowExecutionTrace[] {
    return Array.from(this.executions.values())
  }

  // Stop execution
  async stopExecution(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId)
    if (execution && execution.status === 'running') {
      execution.status = 'failed'
      execution.error = 'Execution stopped by user'
      execution.endTime = new Date()
      execution.duration = execution.endTime.getTime() - execution.startTime.getTime()
      
      this.emit('workflow:stopped', execution)
    }
  }
}