// Workflow executor for running workflow definitions
import { WorkflowDefinition, WorkflowExecution, WorkflowContext, ExecutionStatus } from '../types'

export class WorkflowExecutor {
  private executions = new Map<string, WorkflowExecution>()

  async executeWorkflow(
    workflow: WorkflowDefinition,
    context: WorkflowContext,
    input: any = {}
  ): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      id: this.generateExecutionId(),
      workflowId: workflow.id,
      status: 'pending',
      input,
      startTime: new Date(),
      context,
      trace: []
    }

    this.executions.set(execution.id, execution)

    try {
      execution.status = 'running'
      
      // Mock workflow execution
      await this.runWorkflowNodes(workflow, execution)
      
      execution.status = 'completed'
      execution.endTime = new Date()
      execution.duration = execution.endTime.getTime() - execution.startTime.getTime()
      execution.output = {
        result: 'Workflow completed successfully',
        nodesExecuted: workflow.nodes.length,
        executionTime: execution.duration
      }

    } catch (error: any) {
      execution.status = 'failed'
      execution.endTime = new Date()
      execution.error = error.message
      execution.duration = execution.endTime.getTime() - execution.startTime.getTime()
    }

    return execution
  }

  async getExecution(executionId: string): Promise<WorkflowExecution | undefined> {
    return this.executions.get(executionId)
  }

  async stopExecution(executionId: string): Promise<boolean> {
    const execution = this.executions.get(executionId)
    if (execution && execution.status === 'running') {
      execution.status = 'stopped'
      execution.endTime = new Date()
      execution.duration = execution.endTime.getTime() - execution.startTime.getTime()
      return true
    }
    return false
  }

  async listExecutions(workflowId?: string): Promise<WorkflowExecution[]> {
    const executions = Array.from(this.executions.values())
    if (workflowId) {
      return executions.filter(e => e.workflowId === workflowId)
    }
    return executions
  }

  private async runWorkflowNodes(workflow: WorkflowDefinition, execution: WorkflowExecution): Promise<void> {
    const startNodes = workflow.nodes.filter(node => node.type === 'start')
    
    if (startNodes.length === 0) {
      throw new Error('No start node found in workflow')
    }

    // Simple sequential execution for demo
    for (const node of workflow.nodes) {
      const traceEntry = {
        nodeId: node.id,
        type: node.type,
        startTime: new Date(),
        status: 'running' as const,
        input: execution.input
      }

      execution.trace?.push(traceEntry)

      // Mock node execution
      await this.executeNode(node, execution)

      traceEntry.endTime = new Date()
      traceEntry.status = 'completed'
      traceEntry.output = {
        result: `Node ${node.id} executed successfully`,
        data: node.data
      }
    }
  }

  private async executeNode(node: any, execution: WorkflowExecution): Promise<any> {
    // Mock node execution delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    switch (node.type) {
      case 'start':
        return { message: 'Workflow started' }
      
      case 'agent':
        return { 
          message: `Agent ${node.data.agent || 'default'} executed`,
          result: 'Agent processing completed'
        }
      
      case 'integration':
        return {
          message: `Integration ${node.data.integration || 'default'} executed`,
          result: 'Integration call completed'
        }
      
      case 'condition':
        return {
          message: 'Condition evaluated',
          result: true,
          branch: 'true'
        }
      
      case 'end':
        return { message: 'Workflow completed' }
      
      default:
        return { 
          message: `Node type ${node.type} executed`,
          result: 'Generic node execution completed'
        }
    }
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Global workflow executor instance
export const workflowExecutor = new WorkflowExecutor()