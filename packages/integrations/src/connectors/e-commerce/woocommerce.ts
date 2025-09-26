import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface WooCommerceConfig extends ConnectionConfig {
  siteUrl: string
  consumerKey: string
  consumerSecret: string
}

export class WooCommerceConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'woocommerce'
  public readonly name = 'WooCommerce'
  public readonly description = 'Connect to WooCommerce for e-commerce store management and operations'
  public readonly category = 'e-commerce'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'siteUrl',
        label: 'Site URL',
        type: 'text' as const,
        required: true,
        description: 'Your WooCommerce store URL (e.g., https://mystore.com)'
      },
      {
        key: 'consumerKey',
        label: 'Consumer Key',
        type: 'password' as const,
        required: true,
        description: 'WooCommerce REST API consumer key'
      },
      {
        key: 'consumerSecret',
        label: 'Consumer Secret',
        type: 'password' as const,
        required: true,
        description: 'WooCommerce REST API consumer secret'
      }
    ]
  }

  private getAuthHeader(config: WooCommerceConfig): string {
    return Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString('base64')
  }

  async validateConnection(config: WooCommerceConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch(`${config.siteUrl}/wp-json/wc/v3/system_status`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${this.getAuthHeader(config)}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        return {
          valid: false,
          error: `WooCommerce API error: ${response.status} ${response.statusText}`
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

  async execute(input: any, config: WooCommerceConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation, ...params } = input
      const headers = {
        'Authorization': `Basic ${this.getAuthHeader(config)}`,
        'Content-Type': 'application/json'
      }

      switch (operation) {
        case 'getProducts': {
          const { 
            per_page = 10, 
            page = 1, 
            search, 
            category, 
            tag, 
            status = 'publish',
            orderby = 'date',
            order = 'desc'
          } = params

          const queryParams = new URLSearchParams({
            per_page: per_page.toString(),
            page: page.toString(),
            status,
            orderby,
            order
          })

          if (search) queryParams.append('search', search)
          if (category) queryParams.append('category', category)
          if (tag) queryParams.append('tag', tag)

          const response = await fetch(`${config.siteUrl}/wp-json/wc/v3/products?${queryParams.toString()}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`WooCommerce API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          const totalPages = response.headers.get('X-WP-TotalPages')
          const totalProducts = response.headers.get('X-WP-Total')

          return {
            success: true,
            data: result,
            products: result,
            pagination: {
              page,
              per_page,
              total: totalProducts ? parseInt(totalProducts) : 0,
              total_pages: totalPages ? parseInt(totalPages) : 0
            }
          }
        }

        case 'getProduct': {
          const { productId } = params

          if (!productId) {
            throw new Error('Product ID is required')
          }

          const response = await fetch(`${config.siteUrl}/wp-json/wc/v3/products/${productId}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`WooCommerce API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            product: result
          }
        }

        case 'createProduct': {
          const { product } = params

          if (!product) {
            throw new Error('Product data is required')
          }

          const response = await fetch(`${config.siteUrl}/wp-json/wc/v3/products`, {
            method: 'POST',
            headers,
            body: JSON.stringify(product)
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`WooCommerce API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            product: result
          }
        }

        case 'updateProduct': {
          const { productId, product } = params

          if (!productId || !product) {
            throw new Error('Product ID and product data are required')
          }

          const response = await fetch(`${config.siteUrl}/wp-json/wc/v3/products/${productId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(product)
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`WooCommerce API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            product: result
          }
        }

        case 'getOrders': {
          const { 
            per_page = 10, 
            page = 1, 
            status, 
            customer, 
            product,
            after,
            before,
            orderby = 'date',
            order = 'desc'
          } = params

          const queryParams = new URLSearchParams({
            per_page: per_page.toString(),
            page: page.toString(),
            orderby,
            order
          })

          if (status) queryParams.append('status', status)
          if (customer) queryParams.append('customer', customer.toString())
          if (product) queryParams.append('product', product.toString())
          if (after) queryParams.append('after', after)
          if (before) queryParams.append('before', before)

          const response = await fetch(`${config.siteUrl}/wp-json/wc/v3/orders?${queryParams.toString()}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`WooCommerce API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          const totalPages = response.headers.get('X-WP-TotalPages')
          const totalOrders = response.headers.get('X-WP-Total')

          return {
            success: true,
            data: result,
            orders: result,
            pagination: {
              page,
              per_page,
              total: totalOrders ? parseInt(totalOrders) : 0,
              total_pages: totalPages ? parseInt(totalPages) : 0
            }
          }
        }

        case 'getOrder': {
          const { orderId } = params

          if (!orderId) {
            throw new Error('Order ID is required')
          }

          const response = await fetch(`${config.siteUrl}/wp-json/wc/v3/orders/${orderId}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`WooCommerce API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            order: result
          }
        }

        case 'updateOrder': {
          const { orderId, order } = params

          if (!orderId || !order) {
            throw new Error('Order ID and order data are required')
          }

          const response = await fetch(`${config.siteUrl}/wp-json/wc/v3/orders/${orderId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(order)
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`WooCommerce API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            order: result
          }
        }

        case 'getCustomers': {
          const { per_page = 10, page = 1, search, email, orderby = 'date', order = 'desc' } = params

          const queryParams = new URLSearchParams({
            per_page: per_page.toString(),
            page: page.toString(),
            orderby,
            order
          })

          if (search) queryParams.append('search', search)
          if (email) queryParams.append('email', email)

          const response = await fetch(`${config.siteUrl}/wp-json/wc/v3/customers?${queryParams.toString()}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`WooCommerce API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          const totalPages = response.headers.get('X-WP-TotalPages')
          const totalCustomers = response.headers.get('X-WP-Total')

          return {
            success: true,
            data: result,
            customers: result,
            pagination: {
              page,
              per_page,
              total: totalCustomers ? parseInt(totalCustomers) : 0,
              total_pages: totalPages ? parseInt(totalPages) : 0
            }
          }
        }

        case 'createCustomer': {
          const { customer } = params

          if (!customer) {
            throw new Error('Customer data is required')
          }

          const response = await fetch(`${config.siteUrl}/wp-json/wc/v3/customers`, {
            method: 'POST',
            headers,
            body: JSON.stringify(customer)
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`WooCommerce API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            customer: result
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
      maxConcurrency: 5,
      rateLimits: {
        requestsPerMinute: 60
      },
      operations: [
        'getProducts',
        'getProduct',
        'createProduct',
        'updateProduct',
        'getOrders',
        'getOrder',
        'updateOrder',
        'getCustomers',
        'createCustomer'
      ]
    }
  }
}