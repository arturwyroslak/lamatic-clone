import { errorResponse, successResponse } from '../utils/response'
import type { WorkerEnv } from '../types'

export async function handleWorkflowExecution(request: Request, env: WorkerEnv): Promise<Response> {
  try {
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const workflowId = pathParts[pathParts.length - 1]

    if (!workflowId) {
      return errorResponse('Workflow ID is required', 400)
    }

    const body = await request.json() as any
    
    // Execute workflow logic here
    const execution = {
      id: crypto.randomUUID(),
      workflowId,
      status: 'running',
      input: body.input,
      createdAt: new Date().toISOString()
    }

    // Store execution in KV or database
    if (env.CACHE) {
      await env.CACHE.put(`execution:${execution.id}`, JSON.stringify(execution))
    }

    return successResponse(execution)
  } catch (error) {
    return errorResponse(`Workflow execution failed: ${error}`, 500)
  }
}

export async function handleWorkflowStatus(request: Request, env: WorkerEnv): Promise<Response> {
  try {
    const url = new URL(request.url)
    const executionId = url.searchParams.get('executionId')

    if (!executionId) {
      return errorResponse('Execution ID is required', 400)
    }

    // Get execution status from KV or database
    let execution = null
    if (env.CACHE) {
      const stored = await env.CACHE.get(`execution:${executionId}`)
      if (stored) {
        execution = JSON.parse(stored)
      }
    }

    if (!execution) {
      return errorResponse('Execution not found', 404)
    }

    return successResponse(execution)
  } catch (error) {
    return errorResponse(`Failed to get workflow status: ${error}`, 500)
  }
}
