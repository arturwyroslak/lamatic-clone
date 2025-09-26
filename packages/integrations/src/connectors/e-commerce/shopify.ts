import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface ShopifyConfig extends ConnectionConfig {
  shopDomain: string
  accessToken: string
  apiVersion?: string
}

export class ShopifyConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'shopify'
  public readonly name = 'Shopify'
  public readonly description = 'Connect to Shopify for e-commerce operations and store management'
  public readonly category = 'e-commerce'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'shopDomain',
        label: 'Shop Domain',
        type: 'text' as const,
        required: true,
        description: 'Your Shopify shop domain (e.g., mystore.myshopify.com)'
      },
      {
        key: 'accessToken',
        label: 'Access Token',
        type: 'password' as const,
        required: true,
        description: 'Your Shopify Admin API access token'
      }
    ]
  }

  async validateConnection(config: ShopifyConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch(`https://${config.shopDomain}/admin/api/2024-01/shop.json`, {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': config.accessToken,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        return {
          valid: false,
          error: `Shopify API error: ${response.status} ${response.statusText}`
        }
      }

      return { valid: true }
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown connection error'
      }
    }
  }

  async execute(input: any, config: ShopifyConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation } = input
      const baseUrl = `https://${config.shopDomain}/admin/api/2024-01`
      const headers = {
        'X-Shopify-Access-Token': config.accessToken,
        'Content-Type': 'application/json'
      }

      switch (operation) {
        case 'getShop': {
          const response = await fetch(`${baseUrl}/shop.json`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`Shopify API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            shop: result.shop
          }
        }

        default:
          throw new Error(`Unsupported operation: ${operation}`)
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  }

  getCapabilities() {
    return {
      supportsBatch: false,
      supportsStreaming: false,
      supportsFiles: false,
      maxConcurrency: 2,
      rateLimits: {
        requestsPerMinute: 40
      },
      operations: [
        'getShop'
      ]
    }
  }
}