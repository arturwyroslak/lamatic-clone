import { WorkerEnv } from '../types'

export async function handleWebhook(request: Request, env: WorkerEnv, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url)
  const webhookId = url.pathname.split('/').pop()
  
  if (!webhookId) {
    return new Response('Webhook ID required', { status: 400 })
  }

  // Validate webhook signature if configured
  const signature = request.headers.get('x-lamatic-signature')
  if (env.WEBHOOK_SECRET && signature) {
    const isValid = await validateWebhookSignature(request, env.WEBHOOK_SECRET, signature)
    if (!isValid) {
      return new Response('Invalid webhook signature', { status: 401 })
    }
  }

  try {
    // Get webhook configuration from KV storage
    const webhookConfig = await getWebhookConfig(webhookId, env)
    if (!webhookConfig) {
      return new Response('Webhook not found', { status: 404 })
    }

    // Parse webhook payload
    let payload: any = {}
    const contentType = request.headers.get('content-type')
    
    if (contentType?.includes('application/json')) {
      payload = await request.json()
    } else if (contentType?.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData()
      payload = Object.fromEntries(formData)
    } else {
      payload = { body: await request.text() }
    }

    // Add request metadata
    const executionData = {
      webhookId,
      timestamp: new Date().toISOString(),
      headers: Object.fromEntries(request.headers),
      method: request.method,
      url: request.url,
      payload
    }

    // Execute workflow asynchronously
    ctx.waitUntil(executeWorkflow(webhookConfig.workflowId, executionData, env))

    // Log webhook execution
    await logWebhookExecution(webhookId, executionData, env)

    // Return immediate response
    const response = webhookConfig.responseConfig || {
      status: 200,
      body: { success: true, message: 'Webhook received' }
    }

    return new Response(JSON.stringify(response.body), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'X-Lamatic-Webhook-Id': webhookId,
        'X-Lamatic-Execution-Id': crypto.randomUUID()
      }
    })
  } catch (error) {
    console.error('Webhook execution error:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Webhook execution failed'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

async function validateWebhookSignature(request: Request, secret: string, signature: string): Promise<boolean> {
  try {
    const body = await request.clone().text()
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
    const expectedSignature = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    return signature === `sha256=${expectedSignature}`
  } catch (error) {
    console.error('Signature validation error:', error)
    return false
  }
}

async function getWebhookConfig(webhookId: string, env: WorkerEnv): Promise<any> {
  try {
    if (env.WEBHOOKS_KV) {
      const config = await env.WEBHOOKS_KV.get(`webhook:${webhookId}`)
      return config ? JSON.parse(config) : null
    }
    
    // Fallback: simulate webhook configuration
    return {
      id: webhookId,
      workflowId: 'workflow_123',
      responseConfig: {
        status: 200,
        body: { success: true, webhookId }
      },
      settings: {
        async: true,
        retries: 3,
        timeout: 30000
      }
    }
  } catch (error) {
    console.error('Error getting webhook config:', error)
    return null
  }
}

async function executeWorkflow(workflowId: string, data: any, env: WorkerEnv): Promise<void> {
  try {
    // In a real implementation, this would trigger the workflow execution
    // For now, we'll simulate the workflow execution
    const executionId = crypto.randomUUID()
    
    console.log(`Executing workflow ${workflowId} with execution ID ${executionId}`)
    
    // Store execution in KV for tracking
    if (env.EXECUTIONS_KV) {
      await env.EXECUTIONS_KV.put(`execution:${executionId}`, JSON.stringify({
        id: executionId,
        workflowId,
        status: 'running',
        startTime: new Date().toISOString(),
        input: data,
        trigger: 'webhook'
      }))
    }
    
    // Simulate workflow execution delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Update execution status
    if (env.EXECUTIONS_KV) {
      await env.EXECUTIONS_KV.put(`execution:${executionId}`, JSON.stringify({
        id: executionId,
        workflowId,
        status: 'completed',
        startTime: data.timestamp,
        endTime: new Date().toISOString(),
        input: data,
        output: { result: 'success', processedAt: new Date().toISOString() },
        trigger: 'webhook'
      }))
    }
    
    console.log(`Workflow ${workflowId} execution ${executionId} completed`)
  } catch (error) {
    console.error('Workflow execution error:', error)
  }
}

async function logWebhookExecution(webhookId: string, data: any, env: WorkerEnv): Promise<void> {
  try {
    if (env.LOGS_KV) {
      const logEntry = {
        webhookId,
        timestamp: data.timestamp,
        method: data.method,
        userAgent: data.headers['user-agent'],
        ip: data.headers['cf-connecting-ip'] || data.headers['x-forwarded-for'],
        payloadSize: JSON.stringify(data.payload).length
      }
      
      await env.LOGS_KV.put(`webhook-log:${webhookId}:${Date.now()}`, JSON.stringify(logEntry))
    }
  } catch (error) {
    console.error('Error logging webhook execution:', error)
  }
}