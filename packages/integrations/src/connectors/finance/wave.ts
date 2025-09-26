import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface WaveConfig extends ConnectionConfig {
  accessToken: string
  businessId: string
}

export class WaveConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'wave'
  public readonly name = 'Wave Accounting'
  public readonly description = 'Free accounting software with invoices, payments, accounting, and financial reports'
  public readonly category = 'finance'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'accessToken',
        label: 'Access Token',
        type: 'password' as const,
        required: true,
        description: 'Wave API access token'
      },
      {
        key: 'businessId',
        label: 'Business ID',
        type: 'text' as const,
        required: true,
        description: 'Wave business ID'
      }
    ]
  }

  async validateConnection(config: WaveConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch('https://gql.waveapps.com/graphql/public', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: `
            query {
              business(id: "${config.businessId}") {
                id
                name
              }
            }
          `
        })
      })

      const data = await response.json()
      if (data.errors || !data.data?.business) {
        return { valid: false, error: 'Invalid Wave credentials or business ID' }
      }

      return { valid: true }
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown validation error' 
      }
    }
  }

  async execute(input: any, config: WaveConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation, ...params } = input
      const headers = {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json'
      }

      let result
      switch (operation) {
        case 'getBusiness':
          result = await this.getBusiness(params, headers, config.businessId)
          break
        case 'getCustomers':
          result = await this.getCustomers(params, headers, config.businessId)
          break
        case 'createCustomer':
          result = await this.createCustomer(params, headers, config.businessId)
          break
        case 'getInvoices':
          result = await this.getInvoices(params, headers, config.businessId)
          break
        case 'createInvoice':
          result = await this.createInvoice(params, headers, config.businessId)
          break
        case 'sendInvoice':
          result = await this.sendInvoice(params, headers)
          break
        case 'getProducts':
          result = await this.getProducts(params, headers, config.businessId)
          break
        case 'createProduct':
          result = await this.createProduct(params, headers, config.businessId)
          break
        case 'getTransactions':
          result = await this.getTransactions(params, headers, config.businessId)
          break
        case 'createTransactionLine':
          result = await this.createTransactionLine(params, headers, config.businessId)
          break
        case 'getAccounts':
          result = await this.getAccounts(params, headers, config.businessId)
          break
        case 'getSalesTaxes':
          result = await this.getSalesTaxes(params, headers, config.businessId)
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

  private async executeGraphQL(query: string, variables: any, headers: any): Promise<any> {
    const response = await fetch('https://gql.waveapps.com/graphql/public', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        variables
      })
    })
    const data = await response.json()
    if (data.errors) {
      throw new Error(data.errors[0].message)
    }
    return data.data
  }

  private async getBusiness(params: any, headers: any, businessId: string): Promise<any> {
    const query = `
      query GetBusiness($businessId: ID!) {
        business(id: $businessId) {
          id
          name
          organizationType
          currency {
            code
            symbol
          }
          timezone
          address {
            addressLine1
            addressLine2
            city
            postalCode
            countryCode
          }
        }
      }
    `
    return await this.executeGraphQL(query, { businessId }, headers)
  }

  private async getCustomers(params: any, headers: any, businessId: string): Promise<any> {
    const query = `
      query GetCustomers($businessId: ID!, $page: Int, $pageSize: Int) {
        business(id: $businessId) {
          customers(page: $page, pageSize: $pageSize) {
            pageInfo {
              currentPage
              totalPages
              totalCount
            }
            edges {
              node {
                id
                name
                firstName
                lastName
                displayId
                email
                mobile
                phone
                fax
                tollFree
                website
                internalNotes
                currency {
                  code
                }
                address {
                  addressLine1
                  addressLine2
                  city
                  postalCode
                  countryCode
                }
              }
            }
          }
        }
      }
    `
    return await this.executeGraphQL(query, { 
      businessId, 
      page: params.page || 1, 
      pageSize: params.pageSize || 20 
    }, headers)
  }

  private async createCustomer(params: any, headers: any, businessId: string): Promise<any> {
    const query = `
      mutation CreateCustomer($input: CustomerCreateInput!) {
        customerCreate(input: $input) {
          customer {
            id
            name
            email
          }
          didSucceed
          inputErrors {
            path
            message
          }
        }
      }
    `
    return await this.executeGraphQL(query, {
      input: {
        businessId,
        name: params.name,
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        mobile: params.mobile,
        phone: params.phone,
        website: params.website,
        internalNotes: params.internalNotes,
        currency: params.currency,
        address: params.address
      }
    }, headers)
  }

  private async getInvoices(params: any, headers: any, businessId: string): Promise<any> {
    const query = `
      query GetInvoices($businessId: ID!, $page: Int, $pageSize: Int) {
        business(id: $businessId) {
          invoices(page: $page, pageSize: $pageSize) {
            pageInfo {
              currentPage
              totalPages
              totalCount
            }
            edges {
              node {
                id
                createdAt
                modifiedAt
                invoiceNumber
                invoiceDate
                dueDate
                customer {
                  id
                  name
                }
                status
                title
                subhead
                invoiceItems {
                  product {
                    id
                    name
                  }
                  description
                  quantity
                  price
                  total
                }
                total
                amountDue
                amountPaid
                taxTotal
                currency {
                  code
                }
              }
            }
          }
        }
      }
    `
    return await this.executeGraphQL(query, { 
      businessId, 
      page: params.page || 1, 
      pageSize: params.pageSize || 20 
    }, headers)
  }

  private async createInvoice(params: any, headers: any, businessId: string): Promise<any> {
    const query = `
      mutation CreateInvoice($input: InvoiceCreateInput!) {
        invoiceCreate(input: $input) {
          invoice {
            id
            invoiceNumber
            status
            total
          }
          didSucceed
          inputErrors {
            path
            message
          }
        }
      }
    `
    return await this.executeGraphQL(query, {
      input: {
        businessId,
        customerId: params.customerId,
        invoiceDate: params.invoiceDate,
        dueDate: params.dueDate,
        invoiceNumber: params.invoiceNumber,
        poNumber: params.poNumber,
        title: params.title,
        subhead: params.subhead,
        footer: params.footer,
        memo: params.memo,
        disableCreditCardPayments: params.disableCreditCardPayments,
        disableBankPayments: params.disableBankPayments,
        itemTitle: params.itemTitle,
        unitTitle: params.unitTitle,
        priceTitle: params.priceTitle,
        amountTitle: params.amountTitle,
        hideName: params.hideName,
        hideDescription: params.hideDescription,
        hideUnit: params.hideUnit,
        hidePrice: params.hidePrice,
        hideAmount: params.hideAmount,
        items: params.items
      }
    }, headers)
  }

  private async sendInvoice(params: any, headers: any): Promise<any> {
    const query = `
      mutation SendInvoice($input: InvoiceSendInput!) {
        invoiceSend(input: $input) {
          didSucceed
          inputErrors {
            path
            message
          }
        }
      }
    `
    return await this.executeGraphQL(query, {
      input: {
        invoiceId: params.invoiceId,
        to: params.to,
        subject: params.subject,
        message: params.message,
        attachPdf: params.attachPdf
      }
    }, headers)
  }

  private async getProducts(params: any, headers: any, businessId: string): Promise<any> {
    const query = `
      query GetProducts($businessId: ID!, $page: Int, $pageSize: Int) {
        business(id: $businessId) {
          products(page: $page, pageSize: $pageSize) {
            pageInfo {
              currentPage
              totalPages
              totalCount
            }
            edges {
              node {
                id
                name
                description
                unitPrice
                defaultSalesTaxes {
                  id
                  name
                  rate
                }
                isArchived
                isSold
                isBought
              }
            }
          }
        }
      }
    `
    return await this.executeGraphQL(query, { 
      businessId, 
      page: params.page || 1, 
      pageSize: params.pageSize || 20 
    }, headers)
  }

  private async createProduct(params: any, headers: any, businessId: string): Promise<any> {
    const query = `
      mutation CreateProduct($input: ProductCreateInput!) {
        productCreate(input: $input) {
          product {
            id
            name
            unitPrice
          }
          didSucceed
          inputErrors {
            path
            message
          }
        }
      }
    `
    return await this.executeGraphQL(query, {
      input: {
        businessId,
        name: params.name,
        description: params.description,
        unitPrice: params.unitPrice,
        isSold: params.isSold,
        isBought: params.isBought,
        incomeAccountId: params.incomeAccountId,
        expenseAccountId: params.expenseAccountId,
        defaultSalesTaxes: params.defaultSalesTaxes
      }
    }, headers)
  }

  private async getTransactions(params: any, headers: any, businessId: string): Promise<any> {
    const query = `
      query GetTransactions($businessId: ID!, $page: Int, $pageSize: Int) {
        business(id: $businessId) {
          moneyTransactionLines(page: $page, pageSize: $pageSize) {
            pageInfo {
              currentPage
              totalPages
              totalCount
            }
            edges {
              node {
                id
                date
                description
                account {
                  id
                  name
                }
                debit
                credit
                balance
                journalLine {
                  id
                  description
                }
              }
            }
          }
        }
      }
    `
    return await this.executeGraphQL(query, { 
      businessId, 
      page: params.page || 1, 
      pageSize: params.pageSize || 20 
    }, headers)
  }

  private async createTransactionLine(params: any, headers: any, businessId: string): Promise<any> {
    const query = `
      mutation CreateMoneyTransactionLine($input: MoneyTransactionLineCreateInput!) {
        moneyTransactionLineCreate(input: $input) {
          moneyTransactionLine {
            id
            date
            description
            debit
            credit
          }
          didSucceed
          inputErrors {
            path
            message
          }
        }
      }
    `
    return await this.executeGraphQL(query, {
      input: {
        businessId,
        date: params.date,
        description: params.description,
        accountId: params.accountId,
        debit: params.debit,
        credit: params.credit,
        notes: params.notes
      }
    }, headers)
  }

  private async getAccounts(params: any, headers: any, businessId: string): Promise<any> {
    const query = `
      query GetAccounts($businessId: ID!) {
        business(id: $businessId) {
          accounts {
            id
            name
            description
            displayId
            type {
              name
              normalBalanceType
            }
            subtype {
              name
              value
            }
            currency {
              code
            }
            isArchived
          }
        }
      }
    `
    return await this.executeGraphQL(query, { businessId }, headers)
  }

  private async getSalesTaxes(params: any, headers: any, businessId: string): Promise<any> {
    const query = `
      query GetSalesTaxes($businessId: ID!) {
        business(id: $businessId) {
          salesTaxes {
            id
            name
            abbreviation
            description
            rate
            isArchived
            isCompound
            isRecoverable
          }
        }
      }
    `
    return await this.executeGraphQL(query, { businessId }, headers)
  }

  getCapabilities() {
    return {
      supportsBatch: false,
      supportsStreaming: false,
      supportsFiles: false,
      maxConcurrency: 5,
      rateLimits: {
        requestsPerMinute: 200,
        requestsPerDay: 10000
      },
      accountingFeatures: {
        supportsInvoicing: true,
        supportsPayments: true,
        supportsExpenseTracking: true,
        supportsReporting: true,
        supportsMultiCurrency: true,
        supportsTaxCalculation: true,
        supportsRecurringInvoices: false,
        maxCustomers: 'unlimited',
        maxInvoicesPerMonth: 'unlimited'
      }
    }
  }
}