import { handleWorkflowExecution, handleWorkflowStatus } from './handlers/workflow'
import { handleGraphQLProxy } from './handlers/graphql'
import { handleWebhook } from './handlers/webhook'
import { handleWidget } from './handlers/widget'
import { errorResponse, successResponse, corsResponse } from './utils/response'
import type { WorkerEnv } from './types'

// Health check endpoint
async function handleHealthCheck(env: WorkerEnv): Promise<Response> {
  try {
    return successResponse({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: env.ENVIRONMENT || 'unknown'
    })
  } catch (error) {
    return errorResponse(`Health check failed: ${error}`, 500)
  }
}

// Analytics endpoint  
async function handleAnalytics(request: Request, env: WorkerEnv): Promise<Response> {
  try {
    const url = new URL(request.url)
    const timeframe = url.searchParams.get('timeframe') || '24h'
    
    // Mock analytics data
    const analytics = {
      total_requests: 1250,
      successful_requests: 1200,
      failed_requests: 50,
      avg_duration: 245,
      timeframe
    }

    return successResponse(analytics)
  } catch (error) {
    return errorResponse(`Analytics failed: ${error}`, 500)
  }
}

// Router function
async function route(request: Request, env: WorkerEnv, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url)
  const path = url.pathname
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return corsResponse()
  }
  
  // Route handling
  if (path === '/health') {
    return handleHealthCheck(env)
  }
  
  if (path.startsWith('/graphql')) {
    return handleGraphQLProxy(request, env, ctx)
  }
  
  if (path.startsWith('/webhooks/')) {
    return handleWebhook(request, env, ctx)
  }
  
  if (path.startsWith('/widgets/')) {
    return handleWidget(request, env, ctx)
  }
  
  if (path.startsWith('/workflows/') && path.includes('/execute')) {
    return handleWorkflowExecution(request, env)
  }
  
  if (path.startsWith('/workflows/') && path.includes('/status')) {
    return handleWorkflowStatus(request, env)
  }
  
  if (path.startsWith('/analytics')) {
    return handleAnalytics(request, env)
  }
  
  return errorResponse('Not found', 404)
}

// Worker entry point
export default {
  async fetch(request: Request, env: WorkerEnv, ctx: ExecutionContext): Promise<Response> {
    try {
      return await route(request, env, ctx)
    } catch (error) {
      console.error('Worker error:', error)
      return errorResponse('Internal server error', 500)
    }
  }
}
