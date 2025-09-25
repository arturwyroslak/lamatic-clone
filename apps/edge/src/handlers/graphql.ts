import { WorkerEnv } from '../types'

export async function handleGraphQLProxy(request: Request, env: WorkerEnv, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url)
  
  // Extract GraphQL query and variables from request
  let body: any = {}
  if (request.method === 'POST') {
    try {
      body = await request.json()
    } catch (error) {
      return new Response('Invalid JSON in request body', { status: 400 })
    }
  }

  // Get user authentication
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401 })
  }

  const token = authHeader.replace('Bearer ', '')
  
  try {
    // Forward request to main GraphQL API server
    const apiUrl = env.GRAPHQL_API_URL || 'http://localhost:4000/graphql'
    
    const response = await fetch(apiUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Forwarded-For': request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || '',
        'User-Agent': request.headers.get('User-Agent') || 'Lamatic-Edge-Worker'
      },
      body: JSON.stringify(body)
    })

    const result = await response.json()
    
    // Add edge caching headers
    const responseHeaders = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60, s-maxage=300',
      'X-Edge-Cache': 'MISS',
      'X-Lamatic-Edge': 'true'
    })

    // Cache successful queries for faster subsequent requests
    if (response.ok && !result.errors) {
      const cacheKey = `graphql:${JSON.stringify(body)}`
      
      // Cache in Cloudflare KV (if available)
      if (env.CACHE) {
        ctx.waitUntil(
          env.CACHE.put(cacheKey, JSON.stringify(result), {
            expirationTtl: 300 // 5 minutes
          })
        )
      }
      
      responseHeaders.set('X-Edge-Cache', 'CACHED')
    }

    return new Response(JSON.stringify(result), {
      status: response.status,
      headers: responseHeaders
    })
  } catch (error) {
    console.error('GraphQL Proxy Error:', error)
    
    return new Response(JSON.stringify({
      errors: [{ message: 'Internal server error' }]
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Handle GraphQL subscriptions via WebSocket
export async function handleGraphQLSubscription(request: Request, env: WorkerEnv): Promise<Response> {
  const upgradeHeader = request.headers.get('Upgrade')
  
  if (upgradeHeader !== 'websocket') {
    return new Response('Expected Upgrade: websocket', { status: 426 })
  }

  // Create WebSocket pair
  const webSocketPair = new WebSocketPair()
  const [client, server] = Object.values(webSocketPair)

  // Accept the WebSocket connection
  server.accept()

  // Handle WebSocket messages
  server.addEventListener('message', async (event) => {
    try {
      const message = JSON.parse(event.data)
      
      switch (message.type) {
        case 'connection_init':
          server.send(JSON.stringify({ type: 'connection_ack' }))
          break
          
        case 'start':
          // Handle subscription start
          const subscriptionId = message.id
          const query = message.payload
          
          // In a real implementation, this would connect to the GraphQL subscription server
          // For now, send a sample subscription response
          server.send(JSON.stringify({
            id: subscriptionId,
            type: 'data',
            payload: {
              data: {
                workflowExecutionUpdates: {
                  id: 'exec_123',
                  status: 'running',
                  progress: 0.5,
                  timestamp: new Date().toISOString()
                }
              }
            }
          }))
          break
          
        case 'stop':
          // Handle subscription stop
          server.send(JSON.stringify({
            id: message.id,
            type: 'complete'
          }))
          break
          
        default:
          console.log('Unknown message type:', message.type)
      }
    } catch (error) {
      console.error('WebSocket message error:', error)
      server.send(JSON.stringify({
        type: 'error',
        payload: { message: 'Invalid message format' }
      }))
    }
  })

  server.addEventListener('close', () => {
    console.log('WebSocket connection closed')
  })

  return new Response(null, {
    status: 101,
    webSocket: client
  })
}