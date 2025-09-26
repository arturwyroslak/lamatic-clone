import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface SquareConfig extends ConnectionConfig {
  accessToken: string
  applicationId: string
  environment: 'sandbox' | 'production'
  locationId?: string
}

export class SquareConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'square'
  public readonly name = 'Square'
  public readonly description = 'Point of sale system with payments, inventory, customers, and order management'
  public readonly category = 'finance'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'accessToken',
        label: 'Access Token',
        type: 'password' as const,
        required: true,
        description: 'Square API access token'
      },
      {
        key: 'applicationId',
        label: 'Application ID',
        type: 'text' as const,
        required: true,
        description: 'Square application ID'
      },
      {
        key: 'environment',
        label: 'Environment',
        type: 'select' as const,
        required: true,
        options: [
          { value: 'sandbox', label: 'Sandbox' },
          { value: 'production', label: 'Production' }
        ],
        default: 'sandbox',
        description: 'Square environment'
      },
      {
        key: 'locationId',
        label: 'Location ID',
        type: 'text' as const,
        required: false,
        description: 'Default Square location ID'
      }
    ]
  }

  async validateConnection(config: SquareConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const baseUrl = config.environment === 'sandbox' 
        ? 'https://connect.squareupsandbox.com'
        : 'https://connect.squareup.com'

      const response = await fetch(`${baseUrl}/v2/locations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Square-Version': '2023-10-18',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        return { valid: false, error: 'Invalid Square credentials' }
      }

      return { valid: true }
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown validation error' 
      }
    }
  }

  async execute(input: any, config: SquareConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation, ...params } = input
      const baseUrl = config.environment === 'sandbox' 
        ? 'https://connect.squareupsandbox.com'
        : 'https://connect.squareup.com'

      const headers = {
        'Authorization': `Bearer ${config.accessToken}`,
        'Square-Version': '2023-10-18',
        'Content-Type': 'application/json'
      }

      let result
      switch (operation) {
        case 'createPayment':
          result = await this.createPayment(params, headers, baseUrl)
          break
        case 'listPayments':
          result = await this.listPayments(params, headers, baseUrl)
          break
        case 'createCustomer':
          result = await this.createCustomer(params, headers, baseUrl)
          break
        case 'listCustomers':
          result = await this.listCustomers(params, headers, baseUrl)
          break
        case 'createOrder':
          result = await this.createOrder(params, headers, baseUrl)
          break
        case 'listOrders':
          result = await this.listOrders(params, headers, baseUrl)
          break
        case 'createCatalogItem':
          result = await this.createCatalogItem(params, headers, baseUrl)
          break
        case 'listCatalogItems':
          result = await this.listCatalogItems(params, headers, baseUrl)
          break
        case 'getInventory':
          result = await this.getInventory(params, headers, baseUrl)
          break
        case 'updateInventory':
          result = await this.updateInventory(params, headers, baseUrl)
          break
        case 'listLocations':
          result = await this.listLocations(params, headers, baseUrl)
          break
        case 'createRefund':
          result = await this.createRefund(params, headers, baseUrl)
          break
        default:
          throw new Error(`Unsupported operation: ${operation}`)
      }

      return {
        success: true,
        data: result,
        operation: operation,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  }

  private async createPayment(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/v2/payments`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        source_id: params.source_id,
        idempotency_key: params.idempotency_key || Date.now().toString(),
        amount_money: params.amount_money,
        location_id: params.location_id,
        order_id: params.order_id,
        reference_id: params.reference_id,
        note: params.note
      })
    })
    return await response.json()
  }

  private async listPayments(params: any, headers: any, baseUrl: string): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params.begin_time) queryParams.append('begin_time', params.begin_time)
    if (params.end_time) queryParams.append('end_time', params.end_time)
    if (params.sort_order) queryParams.append('sort_order', params.sort_order)
    if (params.cursor) queryParams.append('cursor', params.cursor)
    if (params.location_id) queryParams.append('location_id', params.location_id)

    const response = await fetch(`${baseUrl}/v2/payments?${queryParams}`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async createCustomer(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/v2/customers`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        given_name: params.given_name,
        family_name: params.family_name,
        company_name: params.company_name,
        nickname: params.nickname,
        email_address: params.email_address,
        address: params.address,
        phone_number: params.phone_number,
        reference_id: params.reference_id,
        note: params.note
      })
    })
    return await response.json()
  }

  private async listCustomers(params: any, headers: any, baseUrl: string): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params.cursor) queryParams.append('cursor', params.cursor)
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.sort_field) queryParams.append('sort_field', params.sort_field)
    if (params.sort_order) queryParams.append('sort_order', params.sort_order)

    const response = await fetch(`${baseUrl}/v2/customers?${queryParams}`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async createOrder(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/v2/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        order: {
          location_id: params.location_id,
          reference_id: params.reference_id,
          source: params.source,
          customer_id: params.customer_id,
          line_items: params.line_items,
          taxes: params.taxes,
          discounts: params.discounts,
          service_charges: params.service_charges,
          pricing_options: params.pricing_options,
          rewards: params.rewards
        },
        idempotency_key: params.idempotency_key || Date.now().toString()
      })
    })
    return await response.json()
  }

  private async listOrders(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/v2/orders/search`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        location_ids: params.location_ids,
        cursor: params.cursor,
        query: {
          filter: params.filter,
          sort: params.sort
        },
        limit: params.limit || 100
      })
    })
    return await response.json()
  }

  private async createCatalogItem(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/v2/catalog/object`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        idempotency_key: params.idempotency_key || Date.now().toString(),
        object: {
          type: 'ITEM',
          id: params.id,
          item_data: {
            name: params.name,
            description: params.description,
            abbreviation: params.abbreviation,
            label_color: params.label_color,
            available_online: params.available_online,
            available_for_pickup: params.available_for_pickup,
            available_electronically: params.available_electronically,
            category_id: params.category_id,
            tax_ids: params.tax_ids,
            modifier_list_info: params.modifier_list_info,
            variations: params.variations,
            product_type: params.product_type,
            skip_modifier_screen: params.skip_modifier_screen,
            item_options: params.item_options,
            image_ids: params.image_ids,
            sort_name: params.sort_name,
            description_html: params.description_html,
            description_plaintext: params.description_plaintext
          }
        }
      })
    })
    return await response.json()
  }

  private async listCatalogItems(params: any, headers: any, baseUrl: string): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params.cursor) queryParams.append('cursor', params.cursor)
    if (params.types) queryParams.append('types', params.types)
    if (params.catalog_version) queryParams.append('catalog_version', params.catalog_version.toString())

    const response = await fetch(`${baseUrl}/v2/catalog/list?${queryParams}`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async getInventory(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/v2/inventory/counts/batch-retrieve`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        catalog_object_ids: params.catalog_object_ids,
        location_ids: params.location_ids,
        updated_after: params.updated_after,
        cursor: params.cursor,
        states: params.states
      })
    })
    return await response.json()
  }

  private async updateInventory(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/v2/inventory/changes/batch-create`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        idempotency_key: params.idempotency_key || Date.now().toString(),
        changes: params.changes,
        ignore_unchanged_counts: params.ignore_unchanged_counts
      })
    })
    return await response.json()
  }

  private async listLocations(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/v2/locations`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async createRefund(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/v2/refunds`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        idempotency_key: params.idempotency_key || Date.now().toString(),
        amount_money: params.amount_money,
        payment_id: params.payment_id,
        reason: params.reason,
        location_id: params.location_id
      })
    })
    return await response.json()
  }

  getCapabilities() {
    return {
      supportsBatch: true,
      supportsStreaming: false,
      supportsFiles: false,
      maxConcurrency: 10,
      rateLimits: {
        requestsPerMinute: 1000,
        requestsPerDay: 50000
      },
      posFeatures: {
        supportsPayments: true,
        supportsInventory: true,
        supportsCustomers: true,
        supportsOrders: true,
        supportsCatalog: true,
        supportsRefunds: true,
        supportsReporting: true,
        maxItemsPerOrder: 500
      }
    }
  }
}