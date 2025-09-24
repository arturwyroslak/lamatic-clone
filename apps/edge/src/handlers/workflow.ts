import { WorkflowExecutor } from '../services/workflow-executor'
import { errorResponse, successResponse } from '../utils/response'
import type { WorkerEnv } from '../types'

export async function handleWorkflowExecution(
  request: Request,
  env: WorkerEnv
): Promise<Response> {
  const { workflowId } = request.params as { workflowId: string }
  
  try {
    // Parse request body
    const payload = await request.json().catch(() => ({}))
    
    // Get workflow definition from main API
    const workflowResponse = await fetch(`${env.GRAPHQL_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || ''
      },
      body: JSON.stringify({
        query: `
          query GetWorkflow($id: ID!) {
            workflow(id: $id) {
              id
              name
              definition
              status
            }
          }
        `,
        variables: { id: workflowId }
      })
    })
    
    if (!workflowResponse.ok) {
      return errorResponse('Failed to fetch workflow', 500)
    }
    
    const workflowData = await workflowResponse.json()
    const workflow = workflowData.data?.workflow
    
    if (!workflow || workflow.status !== 'published') {
      return errorResponse('Workflow not found or not published', 404)
    }
    
    // Execute workflow
    const executor = new WorkflowExecutor(env)
    const execution = await executor.execute(workflow, payload)
    
    // Store execution record
    await env.DB.prepare(`
      INSERT INTO executions (id, workflow_id, status, input, output, duration, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      execution.id,
      workflowId,
      execution.status,
      JSON.stringify(payload),
      JSON.stringify(execution.output),
      execution.duration
    ).run()
    
    // Update workflow metrics
    await env.DB.prepare(`
      INSERT OR REPLACE INTO workflow_status (workflow_id, status, last_execution, metrics)
      VALUES (?, 'active', datetime('now'), ?)
    `).bind(
      workflowId,
      JSON.stringify({
        totalExecutions: (await env.DB.prepare(
          'SELECT COUNT(*) as count FROM executions WHERE workflow_id = ?'
        ).bind(workflowId).first())?.count || 0,
        lastExecution: new Date().toISOString(),
        avgDuration: execution.duration
      })
    ).run()
    
    return successResponse({
      executionId: execution.id,
      status: execution.status,
      output: execution.output,
      duration: execution.duration,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Workflow execution error:', error)
    
    // Log error to D1
    try {
      await env.DB.prepare(`
        INSERT INTO executions (id, workflow_id, status, input, error, created_at)
        VALUES (?, ?, 'error', ?, ?, datetime('now'))
      `).bind(
        `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        workflowId,
        JSON.stringify(await request.json().catch(() => ({}))),
        error instanceof Error ? error.message : 'Unknown error'
      ).run()
    } catch (dbError) {
      console.error('Failed to log error to database:', dbError)
    }
    
    return errorResponse(
      error instanceof Error ? error.message : 'Workflow execution failed',
      500
    )
  }
}