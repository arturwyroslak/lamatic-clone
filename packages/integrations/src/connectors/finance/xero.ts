import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface XeroConfig extends ConnectionConfig {
  clientId: string
  clientSecret: string
  accessToken: string
  refreshToken: string
  tenantId: string
  baseURL?: string
}

export class XeroConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'xero'
  public readonly name = 'Xero'
  public readonly description = 'Connect to Xero for comprehensive accounting and business management'
  public readonly category = 'finance'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'clientId',
        label: 'Client ID',
        type: 'text' as const,
        required: true,
        description: 'Xero app client ID'
      },
      {
        key: 'clientSecret',
        label: 'Client Secret',
        type: 'password' as const,
        required: true,
        description: 'Xero app client secret'
      },
      {
        key: 'accessToken',
        label: 'Access Token',
        type: 'password' as const,
        required: true,
        description: 'OAuth 2.0 access token'
      },
      {
        key: 'refreshToken',
        label: 'Refresh Token',
        type: 'password' as const,
        required: true,
        description: 'OAuth 2.0 refresh token'
      },
      {
        key: 'tenantId',
        label: 'Tenant ID',
        type: 'text' as const,
        required: true,
        description: 'Xero organisation tenant ID'
      }
    ]
  }

  async validateConnection(config: XeroConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const baseURL = config.baseURL || 'https://api.xero.com/api.xro/2.0'
      
      const response = await fetch(`${baseURL}/Organisation`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${config.accessToken}`,
          'Xero-tenant-id': config.tenantId
        }
      })

      if (!response.ok) {
        throw new Error(`Xero API returned ${response.status}: ${response.statusText}`)
      }

      return { valid: true }
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown connection error'
      }
    }
  }

  async execute(input: any, config: XeroConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation, ...params } = input
      const baseURL = config.baseURL || 'https://api.xero.com/api.xro/2.0'

      switch (operation) {
        case 'getContacts':
          return await this.getContacts(baseURL, config, params)
        case 'createContact':
          return await this.createContact(baseURL, config, params)
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
        case 'getAccounts':
          return await this.getAccounts(baseURL, config, params)
        case 'getReports':
          return await this.getReports(baseURL, config, params)
        case 'getOrganisation':
          return await this.getOrganisation(baseURL, config)
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

  private async makeRequest(url: string, config: XeroConfig, options: RequestInit = {}): Promise<any> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.accessToken}`,
        'Xero-tenant-id': config.tenantId,
        ...options.headers
      }
    })

    if (!response.ok) {
      throw new Error(`Xero API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  private async getContacts(baseURL: string, config: XeroConfig, params: any): Promise<any> {
    let url = `${baseURL}/Contacts`
    if (params.where) {
      url += `?where=${encodeURIComponent(params.where)}`
    }
    return this.makeRequest(url, config)
  }

  private async createContact(baseURL: string, config: XeroConfig, params: any): Promise<any> {
    const url = `${baseURL}/Contacts`
    return this.makeRequest(url, config, {
      method: 'POST',
      body: JSON.stringify({ Contacts: [params.contact] })
    })
  }

  private async getInvoices(baseURL: string, config: XeroConfig, params: any): Promise<any> {
    let url = `${baseURL}/Invoices`
    if (params.where) {
      url += `?where=${encodeURIComponent(params.where)}`
    }
    return this.makeRequest(url, config)
  }

  private async createInvoice(baseURL: string, config: XeroConfig, params: any): Promise<any> {
    const url = `${baseURL}/Invoices`
    return this.makeRequest(url, config, {
      method: 'POST',
      body: JSON.stringify({ Invoices: [params.invoice] })
    })
  }

  private async getItems(baseURL: string, config: XeroConfig, params: any): Promise<any> {
    let url = `${baseURL}/Items`
    if (params.where) {
      url += `?where=${encodeURIComponent(params.where)}`
    }
    return this.makeRequest(url, config)
  }

  private async createItem(baseURL: string, config: XeroConfig, params: any): Promise<any> {
    const url = `${baseURL}/Items`
    return this.makeRequest(url, config, {
      method: 'POST',
      body: JSON.stringify({ Items: [params.item] })
    })
  }

  private async getPayments(baseURL: string, config: XeroConfig, params: any): Promise<any> {
    let url = `${baseURL}/Payments`
    if (params.where) {
      url += `?where=${encodeURIComponent(params.where)}`
    }
    return this.makeRequest(url, config)
  }

  private async createPayment(baseURL: string, config: XeroConfig, params: any): Promise<any> {
    const url = `${baseURL}/Payments`
    return this.makeRequest(url, config, {
      method: 'POST',
      body: JSON.stringify({ Payments: [params.payment] })
    })
  }

  private async getAccounts(baseURL: string, config: XeroConfig, params: any): Promise<any> {
    let url = `${baseURL}/Accounts`
    if (params.where) {
      url += `?where=${encodeURIComponent(params.where)}`
    }
    return this.makeRequest(url, config)
  }

  private async getReports(baseURL: string, config: XeroConfig, params: any): Promise<any> {
    const { reportType, ...reportParams } = params
    const queryString = new URLSearchParams(reportParams).toString()
    const url = `${baseURL}/Reports/${reportType}${queryString ? '?' + queryString : ''}`
    return this.makeRequest(url, config)
  }

  private async getOrganisation(baseURL: string, config: XeroConfig): Promise<any> {
    const url = `${baseURL}/Organisation`
    return this.makeRequest(url, config)
  }

  getCapabilities() {
    return {
      supportsBatch: true,
      supportsStreaming: false,
      supportsFiles: true,
      maxConcurrency: 10,
      rateLimits: {
        requestsPerMinute: 60,
        requestsPerSecond: 5
      },
      accounting: {
        supportsContacts: true,
        supportsInvoices: true,
        supportsPayments: true,
        supportsItems: true,
        supportsAccounts: true,
        supportsReports: true,
        supportsBankTransactions: true,
        supportsOrganisation: true
      }
    }
  }
}