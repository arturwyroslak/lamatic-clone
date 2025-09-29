// Workflow actions for executing tasks
export interface WorkflowAction {
  id: string
  type: 'http' | 'email' | 'webhook' | 'database' | 'file' | 'notification' | 'custom'
  config: Record<string, any>
  retryPolicy?: {
    maxRetries: number
    backoffStrategy: 'fixed' | 'exponential' | 'linear'
    initialDelay: number
  }
}

export interface ActionResult {
  success: boolean
  data?: any
  error?: string
  executionTime: number
  retryCount?: number
}

export class ActionExecutor {
  async executeAction(action: WorkflowAction, context: Record<string, any>): Promise<ActionResult> {
    const startTime = Date.now()
    let retryCount = 0
    const maxRetries = action.retryPolicy?.maxRetries || 0
    
    while (retryCount <= maxRetries) {
      try {
        const result = await this.performAction(action, context)
        
        return {
          ...result,
          executionTime: Date.now() - startTime,
          retryCount
        }
      } catch (error: any) {
        retryCount++
        
        if (retryCount > maxRetries) {
          return {
            success: false,
            error: error.message,
            executionTime: Date.now() - startTime,
            retryCount
          }
        }
        
        // Wait before retry
        const delay = this.calculateRetryDelay(action.retryPolicy!, retryCount)
        await this.delay(delay)
      }
    }
    
    return {
      success: false,
      error: 'Max retries exceeded',
      executionTime: Date.now() - startTime,
      retryCount
    }
  }

  private async performAction(action: WorkflowAction, context: Record<string, any>): Promise<ActionResult> {
    switch (action.type) {
      case 'http':
        return this.executeHttpAction(action, context)
      case 'email':
        return this.executeEmailAction(action, context)
      case 'webhook':
        return this.executeWebhookAction(action, context)
      case 'database':
        return this.executeDatabaseAction(action, context)
      case 'file':
        return this.executeFileAction(action, context)
      case 'notification':
        return this.executeNotificationAction(action, context)
      case 'custom':
        return this.executeCustomAction(action, context)
      default:
        throw new Error(`Unknown action type: ${action.type}`)
    }
  }

  private async executeHttpAction(action: WorkflowAction, context: Record<string, any>): Promise<ActionResult> {
    const { url, method = 'GET', headers = {}, body, timeout = 10000 } = action.config
    
    // Resolve variables in URL and body
    const resolvedUrl = this.resolveVariables(url, context)
    const resolvedBody = this.resolveVariables(body, context)
    const resolvedHeaders = this.resolveVariables(headers, context)
    
    // Mock HTTP request
    await this.delay(100) // Simulate network delay
    
    if (resolvedUrl.includes('error')) {
      throw new Error('HTTP request failed')
    }
    
    return {
      success: true,
      data: {
        status: 200,
        statusText: 'OK',
        data: {
          message: 'HTTP action executed successfully',
          url: resolvedUrl,
          method,
          timestamp: new Date().toISOString()
        }
      },
      executionTime: 0
    }
  }

  private async executeEmailAction(action: WorkflowAction, context: Record<string, any>): Promise<ActionResult> {
    const { to, subject, body, from, attachments = [] } = action.config
    
    // Resolve variables
    const resolvedTo = this.resolveVariables(to, context)
    const resolvedSubject = this.resolveVariables(subject, context)
    const resolvedBody = this.resolveVariables(body, context)
    
    // Mock email sending
    await this.delay(200)
    
    return {
      success: true,
      data: {
        messageId: `msg_${Date.now()}`,
        to: resolvedTo,
        subject: resolvedSubject,
        sentAt: new Date().toISOString(),
        attachmentCount: attachments.length
      },
      executionTime: 0
    }
  }

  private async executeWebhookAction(action: WorkflowAction, context: Record<string, any>): Promise<ActionResult> {
    const { url, payload, headers = {}, method = 'POST' } = action.config
    
    // Resolve variables
    const resolvedUrl = this.resolveVariables(url, context)
    const resolvedPayload = this.resolveVariables(payload, context)
    
    // Mock webhook call
    await this.delay(150)
    
    return {
      success: true,
      data: {
        webhookUrl: resolvedUrl,
        method,
        payloadSize: JSON.stringify(resolvedPayload).length,
        deliveredAt: new Date().toISOString()
      },
      executionTime: 0
    }
  }

  private async executeDatabaseAction(action: WorkflowAction, context: Record<string, any>): Promise<ActionResult> {
    const { operation, table, data, query, conditions } = action.config
    
    // Mock database operation
    await this.delay(50)
    
    let result: any
    
    switch (operation) {
      case 'insert':
        result = {
          operation: 'insert',
          table,
          insertedId: `id_${Date.now()}`,
          rowsAffected: 1
        }
        break
      case 'update':
        result = {
          operation: 'update',
          table,
          rowsAffected: Math.floor(Math.random() * 5) + 1
        }
        break
      case 'delete':
        result = {
          operation: 'delete',
          table,
          rowsAffected: Math.floor(Math.random() * 3) + 1
        }
        break
      case 'select':
        result = {
          operation: 'select',
          table,
          rows: [
            { id: 1, name: 'Sample Row 1', createdAt: new Date().toISOString() },
            { id: 2, name: 'Sample Row 2', createdAt: new Date().toISOString() }
          ]
        }
        break
      default:
        throw new Error(`Unknown database operation: ${operation}`)
    }
    
    return {
      success: true,
      data: result,
      executionTime: 0
    }
  }

  private async executeFileAction(action: WorkflowAction, context: Record<string, any>): Promise<ActionResult> {
    const { operation, path, content, encoding = 'utf8' } = action.config
    
    // Mock file operation
    await this.delay(100)
    
    let result: any
    
    switch (operation) {
      case 'read':
        result = {
          operation: 'read',
          path,
          content: 'Mock file content',
          size: 1024,
          encoding
        }
        break
      case 'write':
        result = {
          operation: 'write',
          path,
          bytesWritten: content ? content.length : 0,
          encoding
        }
        break
      case 'delete':
        result = {
          operation: 'delete',
          path,
          deleted: true
        }
        break
      case 'copy':
        result = {
          operation: 'copy',
          sourcePath: path,
          destinationPath: action.config.destinationPath,
          copied: true
        }
        break
      default:
        throw new Error(`Unknown file operation: ${operation}`)
    }
    
    return {
      success: true,
      data: result,
      executionTime: 0
    }
  }

  private async executeNotificationAction(action: WorkflowAction, context: Record<string, any>): Promise<ActionResult> {
    const { type, title, message, recipients, channel } = action.config
    
    // Resolve variables
    const resolvedTitle = this.resolveVariables(title, context)
    const resolvedMessage = this.resolveVariables(message, context)
    
    // Mock notification sending
    await this.delay(100)
    
    return {
      success: true,
      data: {
        notificationType: type,
        title: resolvedTitle,
        message: resolvedMessage,
        recipients: Array.isArray(recipients) ? recipients.length : 1,
        channel,
        sentAt: new Date().toISOString(),
        notificationId: `notif_${Date.now()}`
      },
      executionTime: 0
    }
  }

  private async executeCustomAction(action: WorkflowAction, context: Record<string, any>): Promise<ActionResult> {
    const { script, timeout = 5000 } = action.config
    
    // Mock custom action execution
    await this.delay(Math.random() * 500)
    
    return {
      success: true,
      data: {
        customActionResult: 'Custom action executed successfully',
        script: script || 'default',
        context: Object.keys(context),
        executedAt: new Date().toISOString()
      },
      executionTime: 0
    }
  }

  private resolveVariables(value: any, context: Record<string, any>): any {
    if (typeof value === 'string') {
      // Replace variable placeholders like ${variable.path}
      return value.replace(/\$\{([^}]+)\}/g, (match, path) => {
        const resolved = this.getNestedValue(context, path)
        return resolved !== undefined ? String(resolved) : match
      })
    }
    
    if (Array.isArray(value)) {
      return value.map(item => this.resolveVariables(item, context))
    }
    
    if (value && typeof value === 'object') {
      const resolved: any = {}
      for (const [key, val] of Object.entries(value)) {
        resolved[key] = this.resolveVariables(val, context)
      }
      return resolved
    }
    
    return value
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined
    }, obj)
  }

  private calculateRetryDelay(retryPolicy: NonNullable<WorkflowAction['retryPolicy']>, attempt: number): number {
    const { backoffStrategy, initialDelay } = retryPolicy
    
    switch (backoffStrategy) {
      case 'fixed':
        return initialDelay
      case 'linear':
        return initialDelay * attempt
      case 'exponential':
        return initialDelay * Math.pow(2, attempt - 1)
      default:
        return initialDelay
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const actionExecutor = new ActionExecutor()

// Common action builders
export const Actions = {
  http: (config: { url: string; method?: string; headers?: Record<string, string>; body?: any }): WorkflowAction => ({
    id: generateActionId(),
    type: 'http',
    config
  }),

  email: (config: { to: string; subject: string; body: string; from?: string }): WorkflowAction => ({
    id: generateActionId(),
    type: 'email',
    config
  }),

  webhook: (config: { url: string; payload: any; headers?: Record<string, string> }): WorkflowAction => ({
    id: generateActionId(),
    type: 'webhook',
    config
  }),

  database: (config: { operation: string; table: string; data?: any; query?: string }): WorkflowAction => ({
    id: generateActionId(),
    type: 'database',
    config
  }),

  notification: (config: { type: string; title: string; message: string; recipients?: string[] }): WorkflowAction => ({
    id: generateActionId(),
    type: 'notification',
    config
  })
}

function generateActionId(): string {
  return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}