import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface QuickBooksConfig extends ConnectionConfig {
  clientId: string
  clientSecret: string
  accessToken: string
  refreshToken: string
  realmId: string
  environment: 'sandbox' | 'production'
  baseURL?: string
}

export class QuickBooksConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'quickbooks'
  public readonly name = 'QuickBooks Online'
  public readonly description = 'Connect to QuickBooks Online for accounting and financial data management'
  public readonly category = 'finance'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'clientId',
        label: 'Client ID',
        type: 'text' as const,
        required: true,
        description: 'QuickBooks app client ID'
      },
      {
        key: 'clientSecret',
        label: 'Client Secret',
        type: 'password' as const,
        required: true,
        description: 'QuickBooks app client secret'
      },
      {
        key: 'accessToken',
        label: 'Access Token',
        type: 'password' as const,
        required: true,
        description: 'OAuth access token'
      },
      {
        key: 'refreshToken',
        label: 'Refresh Token', 
        type: 'password' as const,
        required: true,
        description: 'OAuth refresh token'
      },
      {
        key: 'realmId',
        label: 'Company ID',
        type: 'text' as const,
        required: true,
        description: 'QuickBooks company ID (Realm ID)'
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
        description: 'QuickBooks environment'
      }
    ]
  }

  async validateConnection(config: QuickBooksConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const baseURL = config.baseURL || (config.environment === 'sandbox' 
        ? 'https://sandbox-quickbooks.api.intuit.com'
        : 'https://quickbooks.api.intuit.com')
      
      // Test connection by fetching company info
      const response = await fetch(`${baseURL}/v3/company/${config.realmId}/companyinfo/${config.realmId}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${config.accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error(`QuickBooks API returned ${response.status}: ${response.statusText}`)
      }

      return { valid: true }
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown connection error'
      }
    }
  }

  async execute(input: any, config: QuickBooksConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation, ...params } = input
      const baseURL = config.baseURL || (config.environment === 'sandbox' 
        ? 'https://sandbox-quickbooks.api.intuit.com'
        : 'https://quickbooks.api.intuit.com')

      switch (operation) {
        case 'getCustomers':
          return await this.getCustomers(baseURL, config, params)
        case 'createCustomer':
          return await this.createCustomer(baseURL, config, params)
        case 'getInvoices':
          return await this.getInvoices(baseURL, config, params)
        case 'createInvoice':
          return await this.createInvoice(baseURL, config, params)
        case 'getItems':
          return await this.getItems(baseURL, config, params)
        case 'createItem':
          return await this.createItem(baseURL, config, params)
        case 'getPayments':
          return await this.getPayments(baseURL, config, params)
        case 'createPayment':
          return await this.createPayment(baseURL, config, params)
        case 'getReports':
          return await this.getReports(baseURL, config, params)
        case 'getCompanyInfo':
          return await this.getCompanyInfo(baseURL, config)
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

  private async makeRequest(url: string, config: QuickBooksConfig, options: RequestInit = {}): Promise<any> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.accessToken}`,
        ...options.headers
      }
    })

    if (!response.ok) {
      throw new Error(`QuickBooks API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  private async getCustomers(baseURL: string, config: QuickBooksConfig, params: any): Promise<any> {
    const query = params.query || "SELECT * FROM Customer"
    const url = `${baseURL}/v3/company/${config.realmId}/query?query=${encodeURIComponent(query)}`
    return this.makeRequest(url, config)
  }

  private async createCustomer(baseURL: string, config: QuickBooksConfig, params: any): Promise<any> {
    const url = `${baseURL}/v3/company/${config.realmId}/customer`
    return this.makeRequest(url, config, {
      method: 'POST',
      body: JSON.stringify(params.customer)
    })
  }

  private async getInvoices(baseURL: string, config: QuickBooksConfig, params: any): Promise<any> {
    const query = params.query || "SELECT * FROM Invoice"
    const url = `${baseURL}/v3/company/${config.realmId}/query?query=${encodeURIComponent(query)}`
    return this.makeRequest(url, config)
  }

  private async createInvoice(baseURL: string, config: QuickBooksConfig, params: any): Promise<any> {
    const url = `${baseURL}/v3/company/${config.realmId}/invoice`
    return this.makeRequest(url, config, {
      method: 'POST',
      body: JSON.stringify(params.invoice)
    })
  }

  private async getItems(baseURL: string, config: QuickBooksConfig, params: any): Promise<any> {
    const query = params.query || "SELECT * FROM Item"
    const url = `${baseURL}/v3/company/${config.realmId}/query?query=${encodeURIComponent(query)}`
    return this.makeRequest(url, config)
  }

  private async createItem(baseURL: string, config: QuickBooksConfig, params: any): Promise<any> {
    const url = `${baseURL}/v3/company/${config.realmId}/item`
    return this.makeRequest(url, config, {
      method: 'POST',
      body: JSON.stringify(params.item)
    })
  }

  private async getPayments(baseURL: string, config: QuickBooksConfig, params: any): Promise<any> {
    const query = params.query || "SELECT * FROM Payment"
    const url = `${baseURL}/v3/company/${config.realmId}/query?query=${encodeURIComponent(query)}`
    return this.makeRequest(url, config)
  }

  private async createPayment(baseURL: string, config: QuickBooksConfig, params: any): Promise<any> {
    const url = `${baseURL}/v3/company/${config.realmId}/payment`
    return this.makeRequest(url, config, {
      method: 'POST',
      body: JSON.stringify(params.payment)
    })
  }

  private async getReports(baseURL: string, config: QuickBooksConfig, params: any): Promise<any> {
    const { reportType, ...reportParams } = params
    const queryString = new URLSearchParams(reportParams).toString()
    const url = `${baseURL}/v3/company/${config.realmId}/reports/${reportType}?${queryString}`
    return this.makeRequest(url, config)
  }

  private async getCompanyInfo(baseURL: string, config: QuickBooksConfig): Promise<any> {
    const url = `${baseURL}/v3/company/${config.realmId}/companyinfo/${config.realmId}`
    return this.makeRequest(url, config)
  }

  getCapabilities() {
    return {
      supportsBatch: false,
      supportsStreaming: false,
      supportsFiles: false,
      maxConcurrency: 5,
      rateLimits: {
        requestsPerMinute: 500,
        requestsPerSecond: 10
      },
      accounting: {
        supportsCustomers: true,
        supportsInvoices: true,
        supportsPayments: true,
        supportsItems: true,
        supportsReports: true,
        supportsCompanyInfo: true
      }
    }
  }
}