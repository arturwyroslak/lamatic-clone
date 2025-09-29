import { WorkerEnv } from '../types'

export async function handleWidget(request: Request, env: WorkerEnv, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url)
  const widgetId = url.pathname.split('/').pop()
  const widgetType = url.searchParams.get('type') || 'chat'
  
  if (!widgetId) {
    return new Response('Widget ID required', { status: 400 })
  }

  // Handle different widget types
  switch (widgetType) {
    case 'chat':
      return handleChatWidget(request, widgetId, env, ctx)
    case 'search':
      return handleSearchWidget(request, widgetId, env, ctx)
    case 'embed':
      return handleEmbedWidget(request, widgetId, env, ctx)
    default:
      return new Response('Invalid widget type', { status: 400 })
  }
}

async function handleChatWidget(request: Request, widgetId: string, env: WorkerEnv, ctx: ExecutionContext): Promise<Response> {
  const method = request.method

  if (method === 'GET') {
    // Return chat widget HTML/JS
    const widgetHTML = generateChatWidgetHTML(widgetId, env)
    
    return new Response(widgetHTML, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600',
        'X-Lamatic-Widget': 'chat'
      }
    })
  } else if (method === 'POST') {
    // Handle chat message
    try {
      const { message, sessionId, context } = await request.json() as { message: string; sessionId: string; context: any }
      
      // Get widget configuration
      const widgetConfig = await getWidgetConfig(widgetId, env)
      if (!widgetConfig) {
        return new Response('Widget not found', { status: 404 })
      }

      // Process chat message through AI workflow
      const response = await processChatMessage(message, sessionId, widgetConfig, context, env)
      
      return new Response(JSON.stringify(response), {
        headers: {
          'Content-Type': 'application/json',
          'X-Lamatic-Widget-Id': widgetId,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
    } catch (error) {
      return new Response(JSON.stringify({
        error: 'Failed to process chat message',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  } else if (method === 'OPTIONS') {
    // Handle CORS preflight
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
  }

  return new Response('Method not allowed', { status: 405 })
}

async function handleSearchWidget(request: Request, widgetId: string, env: WorkerEnv, ctx: ExecutionContext): Promise<Response> {
  if (request.method === 'GET') {
    // Return search widget HTML/JS
    const widgetHTML = generateSearchWidgetHTML(widgetId, env)
    
    return new Response(widgetHTML, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600',
        'X-Lamatic-Widget': 'search'
      }
    })
  } else if (request.method === 'POST') {
    // Handle search query
    try {
      const { query, filters, limit = 10 } = await request.json() as { query: string; filters: any; limit?: number }
      
      const widgetConfig = await getWidgetConfig(widgetId, env)
      if (!widgetConfig) {
        return new Response('Widget not found', { status: 404 })
      }

      // Process search query
      const results = await processSearchQuery(query, filters, limit, widgetConfig, env)
      
      return new Response(JSON.stringify(results), {
        headers: {
          'Content-Type': 'application/json',
          'X-Lamatic-Widget-Id': widgetId,
          'Access-Control-Allow-Origin': '*'
        }
      })
    } catch (error) {
      return new Response(JSON.stringify({
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }

  return new Response('Method not allowed', { status: 405 })
}

async function handleEmbedWidget(request: Request, widgetId: string, env: WorkerEnv, ctx: ExecutionContext): Promise<Response> {
  // Return embeddable JavaScript widget
  const widgetJS = generateEmbedWidgetJS(widgetId, env)
  
  return new Response(widgetJS, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600',
      'X-Lamatic-Widget': 'embed'
    }
  })
}

function generateChatWidgetHTML(widgetId: string, env: WorkerEnv): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Lamatic Chat Widget</title>
    <style>
        .lamatic-chat-widget {
            width: 100%; height: 500px; border: 1px solid #ddd;
            border-radius: 8px; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .lamatic-chat-header {
            background: #0066cc; color: white; padding: 12px; font-weight: 600;
        }
        .lamatic-chat-messages {
            height: 400px; overflow-y: auto; padding: 12px; background: #f9f9f9;
        }
        .lamatic-chat-input {
            padding: 12px; border-top: 1px solid #ddd; background: white;
        }
        .lamatic-chat-input input {
            width: calc(100% - 80px); padding: 8px; border: 1px solid #ddd; border-radius: 4px;
        }
        .lamatic-chat-input button {
            width: 70px; padding: 8px; background: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer;
        }
        .message { margin-bottom: 12px; }
        .message.user { text-align: right; }
        .message.bot { text-align: left; }
        .message-content {
            display: inline-block; padding: 8px 12px; border-radius: 12px; max-width: 80%;
        }
        .message.user .message-content { background: #0066cc; color: white; }
        .message.bot .message-content { background: white; border: 1px solid #ddd; }
    </style>
</head>
<body>
    <div class="lamatic-chat-widget">
        <div class="lamatic-chat-header">AI Assistant</div>
        <div class="lamatic-chat-messages" id="messages">
            <div class="message bot">
                <div class="message-content">Hello! How can I help you today?</div>
            </div>
        </div>
        <div class="lamatic-chat-input">
            <input type="text" id="messageInput" placeholder="Type your message..." onkeypress="handleKeyPress(event)">
            <button onclick="sendMessage()">Send</button>
        </div>
    </div>
    
    <script>
        const widgetId = '${widgetId}';
        const sessionId = Math.random().toString(36);
        
        function handleKeyPress(event) {
            if (event.key === 'Enter') sendMessage();
        }
        
        async function sendMessage() {
            const input = document.getElementById('messageInput');
            const message = input.value.trim();
            if (!message) return;
            
            addMessage(message, 'user');
            input.value = '';
            
            try {
                const response = await fetch('/widget/' + widgetId + '?type=chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message, sessionId })
                });
                
                const data = await response.json();
                addMessage(data.response || 'Sorry, I could not process your request.', 'bot');
            } catch (error) {
                addMessage('Sorry, there was an error processing your request.', 'bot');
            }
        }
        
        function addMessage(content, sender) {
            const messages = document.getElementById('messages');
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message ' + sender;
            messageDiv.innerHTML = '<div class="message-content">' + content + '</div>';
            messages.appendChild(messageDiv);
            messages.scrollTop = messages.scrollHeight;
        }
    </script>
</body>
</html>
  `.trim()
}

function generateSearchWidgetHTML(widgetId: string, env: WorkerEnv): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Lamatic Search Widget</title>
    <style>
        .lamatic-search-widget { width: 100%; max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
        .search-input { width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; }
        .search-input:focus { outline: none; border-color: #0066cc; }
        .search-results { margin-top: 16px; }
        .result-item { padding: 12px; border: 1px solid #eee; border-radius: 6px; margin-bottom: 8px; }
        .result-title { font-weight: 600; color: #0066cc; margin-bottom: 4px; }
        .result-snippet { color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="lamatic-search-widget">
        <input type="text" class="search-input" placeholder="Search..." onkeypress="handleKeyPress(event)" id="searchInput">
        <div class="search-results" id="results"></div>
    </div>
    
    <script>
        const widgetId = '${widgetId}';
        
        function handleKeyPress(event) {
            if (event.key === 'Enter') performSearch();
        }
        
        async function performSearch() {
            const input = document.getElementById('searchInput');
            const query = input.value.trim();
            if (!query) return;
            
            const results = document.getElementById('results');
            results.innerHTML = '<div>Searching...</div>';
            
            try {
                const response = await fetch('/widget/' + widgetId + '?type=search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query })
                });
                
                const data = await response.json();
                displayResults(data.results || []);
            } catch (error) {
                results.innerHTML = '<div>Search error occurred</div>';
            }
        }
        
        function displayResults(results) {
            const container = document.getElementById('results');
            if (results.length === 0) {
                container.innerHTML = '<div>No results found</div>';
                return;
            }
            
            container.innerHTML = results.map(result => 
                '<div class="result-item">' +
                '<div class="result-title">' + result.title + '</div>' +
                '<div class="result-snippet">' + result.snippet + '</div>' +
                '</div>'
            ).join('');
        }
    </script>
</body>
</html>
  `.trim()
}

function generateEmbedWidgetJS(widgetId: string, env: WorkerEnv): string {
  return `
(function() {
    const widgetId = '${widgetId}';
    
    function createLamaticWidget() {
        const container = document.getElementById('lamatic-widget-' + widgetId);
        if (!container) return;
        
        const iframe = document.createElement('iframe');
        iframe.src = '/widget/' + widgetId + '?type=chat';
        iframe.style.width = '100%';
        iframe.style.height = '500px';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '8px';
        
        container.appendChild(iframe);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createLamaticWidget);
    } else {
        createLamaticWidget();
    }
})();
  `.trim()
}

async function getWidgetConfig(widgetId: string, env: WorkerEnv): Promise<any> {
  try {
    if (env.WIDGETS_KV) {
      const config = await env.WIDGETS_KV.get(`widget:${widgetId}`)
      return config ? JSON.parse(config) : null
    }
    
    // Fallback configuration
    return {
      id: widgetId,
      type: 'chat',
      workflowId: 'chat_workflow_123',
      settings: {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 500
      }
    }
  } catch (error) {
    console.error('Error getting widget config:', error)
    return null
  }
}

async function processChatMessage(message: string, sessionId: string, config: any, context: any, env: WorkerEnv): Promise<any> {
  // Simulate AI chat response
  const responses = [
    "I understand your question. Let me help you with that.",
    "That's an interesting point. Here's what I think...",
    "I can help you with that. Based on the information provided...",
    "Great question! Let me break this down for you.",
    "I'm here to assist you. Here's my response..."
  ]
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)]
  
  return {
    response: randomResponse,
    sessionId: sessionId,
    timestamp: new Date().toISOString(),
    model: config.settings?.model || 'gpt-4'
  }
}

async function processSearchQuery(query: string, filters: any, limit: number, config: any, env: WorkerEnv): Promise<any> {
  // Simulate search results
  const results = []
  for (let i = 1; i <= Math.min(limit, 5); i++) {
    results.push({
      id: `result_${i}`,
      title: `Search Result ${i} for "${query}"`,
      snippet: `This is a relevant result that matches your search query. It contains information about ${query} and related topics.`,
      url: `https://example.com/result-${i}`,
      score: Math.random()
    })
  }
  
  return {
    query: query,
    results: results,
    total: results.length,
    timestamp: new Date().toISOString()
  }
}