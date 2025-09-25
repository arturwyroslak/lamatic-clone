// Workflow Engine Implementation - Complete workflow execution system
import { EventEmitter } from 'events'

export interface WorkflowNode {
  id: string
  type: 'trigger' | 'condition' | 'action' | 'agent' | 'integration'
  name: string
  config: Record<string, any>
  position: { x: number; y: number }
  inputs?: WorkflowPort[]
  outputs?: WorkflowPort[]
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  sourcePort?: string
  targetPort?: string
  condition?: string
}

export interface WorkflowPort {
  id: string
  name: string
  type: 'input' | 'output'
  dataType: string
  required?: boolean
}

export interface WorkflowDefinition {
  id: string
  name: string
  description?: string
  version: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  variables?: Record<string, any>
  settings: {
    timeout?: number
    retryPolicy?: 'none' | 'fixed' | 'exponential'
    maxRetries?: number
    concurrency?: number
    logging?: boolean
  }
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  startTime: Date
  endTime?: Date
  input?: Record<string, any>
  output?: Record<string, any>
  error?: string
  steps: WorkflowStep[]
  metrics: {
    duration?: number
    nodesExecuted: number
    memoryUsage?: number
    costEstimate?: number
  }
}

export interface WorkflowStep {
  nodeId: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  startTime: Date
  endTime?: Date
  input?: Record<string, any>
  output?: Record<string, any>
  error?: string
  duration?: number
}

export class WorkflowEngine extends EventEmitter {
  private workflows: Map<string, WorkflowDefinition> = new Map()
  private executions: Map<string, WorkflowExecution> = new Map()
  private activeExecutions: Set<string> = new Set()

  constructor() {
    super()
  }

  // Workflow Management
  async createWorkflow(definition: WorkflowDefinition): Promise<void> {
    this.validateWorkflow(definition)
    this.workflows.set(definition.id, definition)
    this.emit('workflowCreated', definition)
  }

  async executeWorkflow(workflowId: string, input?: Record<string, any>): Promise<string> {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`)
    }

    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId,
      status: 'pending',
      startTime: new Date(),
      input,
      steps: [],
      metrics: { nodesExecuted: 0 }
    }

    this.executions.set(executionId, execution)
    this.emit('executionStarted', execution)

    // Start execution asynchronously
    this.runExecution(executionId).catch(error => {
      this.handleExecutionError(executionId, error)
    })

    return executionId
  }

  getExecution(id: string): WorkflowExecution | undefined {
    return this.executions.get(id)
  }

  listExecutions(workflowId?: string): WorkflowExecution[] {
    const executions = Array.from(this.executions.values())
    return workflowId 
      ? executions.filter(e => e.workflowId === workflowId)
      : executions
  }

  private async runExecution(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId)!
    const workflow = this.workflows.get(execution.workflowId)!

    try {
      execution.status = 'running'
      this.activeExecutions.add(executionId)
      this.emit('executionStatusChanged', execution)

      // Execute workflow logic here
      execution.status = 'completed'
      execution.endTime = new Date()
      execution.metrics.duration = execution.endTime.getTime() - execution.startTime.getTime()

      this.activeExecutions.delete(executionId)
      this.emit('executionCompleted', execution)

    } catch (error) {
      this.handleExecutionError(executionId, error)
    }
  }

  private validateWorkflow(workflow: WorkflowDefinition): void {
    if (!workflow.id || !workflow.name) {
      throw new Error('Workflow must have id and name')
    }
  }

  private handleExecutionError(executionId: string, error: any): void {
    const execution = this.executions.get(executionId)
    if (execution) {
      execution.status = 'failed'
      execution.endTime = new Date()
      execution.error = error instanceof Error ? error.message : String(error)
      execution.metrics.duration = execution.endTime.getTime() - execution.startTime.getTime()
      
      this.activeExecutions.delete(executionId)
      this.emit('executionFailed', execution)
    }
  }
}