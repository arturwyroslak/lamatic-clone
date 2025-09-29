// API client tools for making HTTP requests
import { BaseTool, ToolInput, ToolOutput, ToolCategory } from '../types'

export class HTTPClient implements BaseTool {
  readonly id = 'http_client'
  readonly name = 'HTTP Client'
  readonly description = 'Make HTTP requests to APIs and web services'
  readonly category: ToolCategory = 'api'

  async execute(input: ToolInput): Promise<ToolOutput> {
    try {
      const { 
        method = 'GET', 
        url, 
        headers = {}, 
        body, 
        timeout = 30000,
        followRedirects = true 
      } = input

      if (!url) {
        return {
          success: false,
          error: 'URL is required'
        }
      }

      // Mock HTTP request - in reality would use fetch or axios
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        headers: {
          'content-type': 'application/json',
          'x-response-time': '150ms'
        },
        data: {
          message: `Mock response for ${method} ${url}`,
          timestamp: new Date().toISOString(),
          requestBody: body || null
        }
      }

      return {
        success: true,
        data: {
          response: mockResponse,
          responseTime: 150,
          size: JSON.stringify(mockResponse.data).length
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `HTTP request failed: ${error.message || 'Unknown error'}`
      }
    }
  }
}

export class GraphQLClient implements BaseTool {
  readonly id = 'graphql_client'
  readonly name = 'GraphQL Client'
  readonly description = 'Execute GraphQL queries and mutations'
  readonly category: ToolCategory = 'api'

  async execute(input: ToolInput): Promise<ToolOutput> {
    try {
      const { 
        endpoint, 
        query, 
        variables = {}, 
        headers = {},
        operationName
      } = input

      if (!endpoint || !query) {
        return {
          success: false,
          error: 'Both endpoint and query are required'
        }
      }

      // Mock GraphQL response
      const mockResponse = {
        data: {
          mockField: `Mock GraphQL response for operation: ${operationName || 'unnamed'}`,
          variables: variables,
          timestamp: new Date().toISOString()
        },
        extensions: {
          tracing: {
            duration: 125000000
          }
        }
      }

      return {
        success: true,
        data: {
          response: mockResponse,
          query,
          variables,
          operationName,
          responseTime: 125
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `GraphQL request failed: ${error.message || 'Unknown error'}`
      }
    }
  }
}

export class WebhookSender implements BaseTool {
  readonly id = 'webhook_sender'
  readonly name = 'Webhook Sender'
  readonly description = 'Send webhook notifications to external services'
  readonly category: ToolCategory = 'api'

  async execute(input: ToolInput): Promise<ToolOutput> {
    try {
      const { 
        url, 
        payload, 
        headers = {}, 
        secret, 
        retries = 3,
        timeout = 10000 
      } = input

      if (!url || !payload) {
        return {
          success: false,
          error: 'URL and payload are required'
        }
      }

      // Mock webhook sending
      const webhookHeaders = {
        'Content-Type': 'application/json',
        'User-Agent': 'Lamatic-Webhook/1.0',
        ...headers
      }

      if (secret) {
        // Mock signature generation
        webhookHeaders['X-Webhook-Signature'] = `sha256=mock_signature_${Date.now()}`
      }

      const mockResult = {
        status: 200,
        statusText: 'OK',
        responseTime: 250,
        attempt: 1,
        headers: webhookHeaders,
        payload: payload
      }

      return {
        success: true,
        data: {
          delivered: true,
          ...mockResult
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Webhook delivery failed: ${error.message || 'Unknown error'}`
      }
    }
  }
}

export class URLShortener implements BaseTool {
  readonly id = 'url_shortener'
  readonly name = 'URL Shortener'
  readonly description = 'Create shortened URLs for long URLs'
  readonly category: ToolCategory = 'utility'

  async execute(input: ToolInput): Promise<ToolOutput> {
    try {
      const { url, customAlias, expiration } = input

      if (!url) {
        return {
          success: false,
          error: 'URL is required'
        }
      }

      // Validate URL
      try {
        new URL(url)
      } catch {
        return {
          success: false,
          error: 'Invalid URL format'
        }
      }

      // Mock URL shortening
      const shortId = customAlias || this.generateShortId()
      const shortUrl = `https://short.ly/${shortId}`

      return {
        success: true,
        data: {
          originalUrl: url,
          shortUrl: shortUrl,
          shortId: shortId,
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(shortUrl)}`,
          clickCount: 0,
          createdAt: new Date().toISOString(),
          expiration: expiration || null
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `URL shortening failed: ${error.message || 'Unknown error'}`
      }
    }
  }

  private generateShortId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
}

export const API_CLIENT_TOOLS = [
  new HTTPClient(),
  new GraphQLClient(),
  new WebhookSender(),
  new URLShortener()
]