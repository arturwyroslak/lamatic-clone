// Workflow triggers for various events
import { WorkflowDefinition, WorkflowContext } from '../types'
import { workflowExecutor } from './executor'

export interface WorkflowTrigger {
  id: string
  type: 'webhook' | 'schedule' | 'event' | 'manual' | 'form' | 'file_upload' | 'form_submission' | 'iot_stream' | 'behavioral_tracking'
  workflowId: string
  config: Record<string, any>
  enabled: boolean
  lastTriggered?: Date
  triggerCount: number
}

export class TriggerManager {
  private triggers: Map<string, WorkflowTrigger> = new Map()
  private webhookEndpoints: Map<string, string> = new Map()
  private eventListeners: Map<string, Function[]> = new Map()

  registerTrigger(
    workflowId: string,
    type: WorkflowTrigger['type'],
    config: Record<string, any>
  ): string {
    const triggerId = this.generateTriggerId()
    
    const trigger: WorkflowTrigger = {
      id: triggerId,
      type,
      workflowId,
      config,
      enabled: true,
      triggerCount: 0
    }
    
    this.triggers.set(triggerId, trigger)
    
    // Set up trigger based on type
    this.setupTrigger(trigger)
    
    return triggerId
  }

  unregisterTrigger(triggerId: string): boolean {
    const trigger = this.triggers.get(triggerId)
    if (!trigger) return false
    
    this.teardownTrigger(trigger)
    this.triggers.delete(triggerId)
    
    return true
  }

  enableTrigger(triggerId: string): boolean {
    const trigger = this.triggers.get(triggerId)
    if (!trigger) return false
    
    trigger.enabled = true
    this.setupTrigger(trigger)
    
    return true
  }

  disableTrigger(triggerId: string): boolean {
    const trigger = this.triggers.get(triggerId)
    if (!trigger) return false
    
    trigger.enabled = false
    this.teardownTrigger(trigger)
    
    return true
  }

  async triggerWorkflow(
    triggerId: string,
    input: any,
    context: Partial<WorkflowContext> = {}
  ): Promise<string | null> {
    const trigger = this.triggers.get(triggerId)
    if (!trigger || !trigger.enabled) return null
    
    // Update trigger stats
    trigger.lastTriggered = new Date()
    trigger.triggerCount++
    
    // Mock workflow definition lookup
    const workflowDefinition: WorkflowDefinition = {
      id: trigger.workflowId,
      name: `Triggered Workflow ${trigger.workflowId}`,
      description: 'Workflow triggered by event',
      version: '1.0',
      nodes: [],
      connections: [],
      settings: {}
    }
    
    // Create execution context
    const executionContext: WorkflowContext = {
      executionId: this.generateExecutionId(),
      workflowId: trigger.workflowId,
      userId: context.userId || 'system',
      workspaceId: context.workspaceId || 'default',
      variables: context.variables || {},
      sessionId: context.sessionId,
      metadata: {
        ...context.metadata,
        triggerId,
        triggerType: trigger.type,
        triggerConfig: trigger.config
      }
    }
    
    try {
      const execution = await workflowExecutor.executeWorkflow(
        workflowDefinition,
        input,
        executionContext
      )
      
      console.log(`Workflow triggered successfully: ${execution.id}`)
      return execution.id
      
    } catch (error: any) {
      console.error(`Workflow trigger failed: ${error.message}`)
      return null
    }
  }

  // Webhook handling
  handleWebhook(endpoint: string, payload: any, headers: Record<string, string>): Promise<string | null> {
    const triggerId = this.webhookEndpoints.get(endpoint)
    if (!triggerId) return Promise.resolve(null)
    
    return this.triggerWorkflow(triggerId, { payload, headers })
  }

  // Event handling
  emitEvent(eventType: string, data: any): Promise<(string | null)[]> {
    const listeners = this.eventListeners.get(eventType) || []
    return Promise.all(listeners.map(listener => listener(data)))
  }

  // Manual trigger
  async manualTrigger(workflowId: string, input: any, context: Partial<WorkflowContext> = {}): Promise<string | null> {
    // Find manual trigger for this workflow
    const trigger = Array.from(this.triggers.values()).find(
      t => t.workflowId === workflowId && t.type === 'manual'
    )
    
    if (!trigger) {
      // Create temporary manual trigger
      const triggerId = this.registerTrigger(workflowId, 'manual', {})
      return this.triggerWorkflow(triggerId, input, context)
    }
    
    return this.triggerWorkflow(trigger.id, input, context)
  }

  getTriggers(): WorkflowTrigger[] {
    return Array.from(this.triggers.values())
  }

  getTrigger(triggerId: string): WorkflowTrigger | undefined {
    return this.triggers.get(triggerId)
  }

  private setupTrigger(trigger: WorkflowTrigger): void {
    switch (trigger.type) {
      case 'webhook':
        this.setupWebhookTrigger(trigger)
        break
      case 'event':
        this.setupEventTrigger(trigger)
        break
      case 'form':
      case 'file_upload':
      case 'form_submission':
      case 'iot_stream':
      case 'behavioral_tracking':
        this.setupCustomTrigger(trigger)
        break
    }
  }

  private teardownTrigger(trigger: WorkflowTrigger): void {
    switch (trigger.type) {
      case 'webhook':
        this.teardownWebhookTrigger(trigger)
        break
      case 'event':
        this.teardownEventTrigger(trigger)
        break
    }
  }

  private setupWebhookTrigger(trigger: WorkflowTrigger): void {
    const endpoint = trigger.config.endpoint || `/webhooks/${trigger.id}`
    this.webhookEndpoints.set(endpoint, trigger.id)
    console.log(`Webhook trigger registered: ${endpoint}`)
  }

  private teardownWebhookTrigger(trigger: WorkflowTrigger): void {
    const endpoint = trigger.config.endpoint || `/webhooks/${trigger.id}`
    this.webhookEndpoints.delete(endpoint)
    console.log(`Webhook trigger unregistered: ${endpoint}`)
  }

  private setupEventTrigger(trigger: WorkflowTrigger): void {
    const eventType = trigger.config.eventType
    if (!eventType) return
    
    const listener = (data: any) => this.triggerWorkflow(trigger.id, data)
    
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, [])
    }
    
    this.eventListeners.get(eventType)!.push(listener)
    console.log(`Event trigger registered: ${eventType}`)
  }

  private teardownEventTrigger(trigger: WorkflowTrigger): void {
    const eventType = trigger.config.eventType
    if (!eventType) return
    
    const listeners = this.eventListeners.get(eventType) || []
    // Remove listeners associated with this trigger (simplified)
    this.eventListeners.set(eventType, [])
    console.log(`Event trigger unregistered: ${eventType}`)
  }

  private setupCustomTrigger(trigger: WorkflowTrigger): void {
    // Custom trigger setup based on type
    console.log(`Custom trigger registered: ${trigger.type}`)
  }

  private generateTriggerId(): string {
    return `trigger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

export const triggerManager = new TriggerManager()