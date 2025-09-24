import { Router } from 'itty-router'
import { handleWorkflowExecution } from './handlers/workflow'
import { handleGraphQLProxy } from './handlers/graphql'
import { handleWebhook } from './handlers/webhook'
import { handleWidget } from './handlers/widget'
import { corsHeaders, errorResponse, successResponse } from './utils/response'
import { validateRequest } from './middleware/auth'
import { rateLimiter } from './middleware/rateLimit'
import { cacheMiddleware } from './middleware/cache'
import type { WorkerEnv } from './types'

// Initialize router
const router = Router()

// Global middleware
router.all('*', corsHeaders)
router.all('/api/*', rateLimiter)

// Health check endpoint
router.get('/health', () => {
  return successResponse({ status: 'ok', timestamp: Date.now() })
})

// GraphQL proxy endpoint with caching
router.all('/graphql', cacheMiddleware, handleGraphQLProxy)

// Workflow execution endpoints
router.post('/api/workflows/:workflowId/execute', validateRequest, handleWorkflowExecution)
router.get('/api/workflows/:workflowId/status', validateRequest, cacheMiddleware, async (request, env: WorkerEnv) => {
  const { workflowId } = request.params as { workflowId: string }
  
  try {
    // Get workflow status from D1 database
    const result = await env.DB.prepare(
      'SELECT status, last_execution, metrics FROM workflow_status WHERE workflow_id = ?'
    ).bind(workflowId).first()
    
    if (!result) {
      return errorResponse('Workflow not found', 404)
    }
    
    return successResponse({
      workflowId,
      status: result.status,
      lastExecution: result.last_execution,
      metrics: JSON.parse(result.metrics as string)
    })
  } catch (error) {
    console.error('Error getting workflow status:', error)
    return errorResponse('Internal server error', 500)
  }
})

// Webhook endpoints
router.post('/webhooks/:workflowId', handleWebhook)
router.post('/webhooks/:workflowId/:trigger', handleWebhook)

// Widget endpoints
router.get('/widgets/:type', cacheMiddleware, handleWidget)
router.post('/widgets/:type/config', validateRequest, async (request, env: WorkerEnv) => {
  const { type } = request.params as { type: string }
  const config = await request.json()
  
  try {
    // Store widget configuration
    await env.CACHE.put(`widget:${type}:config`, JSON.stringify(config), {
      expirationTtl: 86400 // 24 hours
    })
    
    return successResponse({ message: 'Widget configuration saved' })
  } catch (error) {
    console.error('Error saving widget config:', error)
    return errorResponse('Failed to save configuration', 500)
  }
})

// Analytics endpoints
router.get('/api/analytics/:workspaceId', validateRequest, cacheMiddleware, async (request, env: WorkerEnv) => {
  const { workspaceId } = request.params as { workspaceId: string }
  const url = new URL(request.url)
  const timeRange = url.searchParams.get('timeRange') || '24h'
  
  try {
    // Get analytics data from D1
    const analytics = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total_executions,
        AVG(duration) as avg_duration,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful_executions,
        SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as failed_executions
      FROM executions 
      WHERE workspace_id = ? AND created_at > datetime('now', '-' || ? || ' hours')
    `).bind(workspaceId, timeRange === '24h' ? '24' : '168').first()
    
    return successResponse({
      timeRange,
      executions: {
        total: analytics?.total_executions || 0,
        successful: analytics?.successful_executions || 0,
        failed: analytics?.failed_executions || 0,
        avgDuration: analytics?.avg_duration || 0
      }
    })
  } catch (error) {
    console.error('Error getting analytics:', error)
    return errorResponse('Failed to get analytics', 500)
  }
})

// Error handling
router.all('*', () => errorResponse('Not found', 404))

// Worker entry point
export default {
  async fetch(request: Request, env: WorkerEnv, ctx: ExecutionContext): Promise<Response> {
    try {
      return await router.handle(request, env, ctx)
    } catch (error) {
      console.error('Worker error:', error)
      return errorResponse('Internal server error', 500)
    }
  }
}