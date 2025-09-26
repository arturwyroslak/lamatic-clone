import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface PayPalConfig extends ConnectionConfig {
  clientId: string
  clientSecret: string
  environment: 'sandbox' | 'live'
  webhookId?: string
}

export class PayPalConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'paypal'
  public readonly name = 'PayPal'
  public readonly description = 'Complete payment processing with transactions, subscriptions, invoicing, and dispute management'
  public readonly category = 'finance'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'clientId',
        label: 'Client ID',
        type: 'text' as const,
        required: true,
        description: 'PayPal application client ID'
      },
      {
        key: 'clientSecret',
        label: 'Client Secret',
        type: 'password' as const,
        required: true,
        description: 'PayPal application client secret'
      },
      {
        key: 'environment',
        label: 'Environment',
        type: 'select' as const,
        required: true,
        options: [
          { value: 'sandbox', label: 'Sandbox' },
          { value: 'live', label: 'Live' }
        ],
        default: 'sandbox',
        description: 'PayPal environment (sandbox for testing, live for production)'
      },
      {
        key: 'webhookId',
        label: 'Webhook ID',
        type: 'text' as const,
        required: false,
        description: 'PayPal webhook ID for event notifications'
      }
    ]
  }

  async validateConnection(config: PayPalConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const baseUrl = config.environment === 'sandbox' 
        ? 'https://api-m.sandbox.paypal.com'
        : 'https://api-m.paypal.com'

      // Get access token
      const authResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en_US',
          'Authorization': `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      })

      if (!authResponse.ok) {
        return { valid: false, error: 'Invalid PayPal credentials' }
      }

      return { valid: true }
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown validation error' 
      }
    }
  }

  async execute(input: any, config: PayPalConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation, ...params } = input
      const baseUrl = config.environment === 'sandbox' 
        ? 'https://api-m.sandbox.paypal.com'
        : 'https://api-m.paypal.com'

      // Get access token
      const authResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en_US',
          'Authorization': `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      })

      const authData = await authResponse.json()
      const accessToken = authData.access_token

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': context.executionId || Date.now().toString()
      }

      let result
      switch (operation) {
        case 'createPayment':
          result = await this.createPayment(params, headers, baseUrl)
          break
        case 'capturePayment':
          result = await this.capturePayment(params, headers, baseUrl)
          break
        case 'refundPayment':
          result = await this.refundPayment(params, headers, baseUrl)
          break
        case 'createSubscription':
          result = await this.createSubscription(params, headers, baseUrl)
          break
        case 'createInvoice':
          result = await this.createInvoice(params, headers, baseUrl)
          break
        case 'getTransactions':
          result = await this.getTransactions(params, headers, baseUrl)
          break
        case 'getPaymentDetails':
          result = await this.getPaymentDetails(params, headers, baseUrl)
          break
        case 'createProduct':
          result = await this.createProduct(params, headers, baseUrl)
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
    const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        intent: params.intent || 'CAPTURE',
        purchase_units: params.purchase_units,
        payment_source: params.payment_source,
        application_context: params.application_context
      })
    })
    return await response.json()
  }

  private async capturePayment(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/v2/checkout/orders/${params.orderId}/capture`, {
      method: 'POST',
      headers,
      body: JSON.stringify(params.capture_details || {})
    })
    return await response.json()
  }

  private async refundPayment(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/v2/payments/captures/${params.captureId}/refund`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        amount: params.amount,
        note_to_payer: params.note_to_payer
      })
    })
    return await response.json()
  }

  private async createSubscription(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/v1/billing/subscriptions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        plan_id: params.plan_id,
        subscriber: params.subscriber,
        application_context: params.application_context
      })
    })
    return await response.json()
  }

  private async createInvoice(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/v2/invoicing/invoices`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        detail: params.detail,
        invoicer: params.invoicer,
        primary_recipients: params.primary_recipients,
        items: params.items,
        configuration: params.configuration
      })
    })
    return await response.json()
  }

  private async getTransactions(params: any, headers: any, baseUrl: string): Promise<any> {
    const queryParams = new URLSearchParams({
      start_date: params.start_date,
      end_date: params.end_date,
      fields: params.fields || 'all',
      page_size: params.page_size || '100'
    })

    const response = await fetch(`${baseUrl}/v1/reporting/transactions?${queryParams}`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async getPaymentDetails(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/v2/checkout/orders/${params.orderId}`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async createProduct(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/v1/catalogs/products`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: params.name,
        description: params.description,
        type: params.type || 'SERVICE',
        category: params.category,
        image_url: params.image_url,
        home_url: params.home_url
      })
    })
    return await response.json()
  }

  getCapabilities() {
    return {
      supportsBatch: false,
      supportsStreaming: false,
      supportsFiles: false,
      maxConcurrency: 10,
      rateLimits: {
        requestsPerMinute: 300,
        requestsPerDay: 50000
      },
      paymentFeatures: {
        supportsOneTimePayments: true,
        supportsSubscriptions: true,
        supportsInvoicing: true,
        supportsRefunds: true,
        supportsDisputes: true,
        supportedCurrencies: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'],
        maxTransactionAmount: 10000
      }
    }
  }
}