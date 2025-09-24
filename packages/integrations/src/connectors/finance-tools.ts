// Complete finance and accounting integrations
import { BaseConnector } from '../base/connector'
import { IntegrationConfig } from '../types'

// QuickBooks Integration
export class QuickBooksConnector extends BaseConnector {
  constructor() {
    super({
      id: 'quickbooks',
      name: 'QuickBooks',
      description: 'Accounting and financial management software',
      category: 'finance',
      icon: 'https://example.com/quickbooks-icon.png',
      authType: 'oauth2',
      baseUrl: 'https://sandbox-quickbooks.api.intuit.com/v3/company'
    })
  }

  async getCustomers() {
    return this.request('GET', '/customers')
  }

  async createCustomer(data: { Name: string; CompanyName?: string; BillAddr?: any; ShipAddr?: any }) {
    return this.request('POST', '/customers', data)
  }

  async getInvoices() {
    return this.request('GET', '/invoices')
  }

  async createInvoice(data: { CustomerRef: { value: string }; Line: any[] }) {
    return this.request('POST', '/invoices', data)
  }

  async getItems() {
    return this.request('GET', '/items')
  }

  async createItem(data: { Name: string; Type: string; IncomeAccountRef?: { value: string } }) {
    return this.request('POST', '/items', data)
  }

  async getPayments() {
    return this.request('GET', '/payments')
  }

  async createPayment(data: { CustomerRef: { value: string }; TotalAmt: number; Line: any[] }) {
    return this.request('POST', '/payments', data)
  }

  async getExpenses() {
    return this.request('GET', '/purchases')
  }

  async getReports(reportType: string, params: any = {}) {
    return this.request('GET', `/reports/${reportType}`, params)
  }
}

// Xero Integration
export class XeroConnector extends BaseConnector {
  constructor() {
    super({
      id: 'xero',
      name: 'Xero',
      description: 'Cloud-based accounting software',
      category: 'finance',
      icon: 'https://example.com/xero-icon.png',
      authType: 'oauth2',
      baseUrl: 'https://api.xero.com/api.xro/2.0'
    })
  }

  async getContacts() {
    return this.request('GET', '/Contacts')
  }

  async createContact(data: { Name: string; ContactNumber?: string; EmailAddress?: string; Addresses?: any[] }) {
    return this.request('POST', '/Contacts', { Contacts: [data] })
  }

  async getInvoices() {
    return this.request('GET', '/Invoices')
  }

  async createInvoice(data: { Type: string; Contact: { ContactID: string }; LineItems: any[] }) {
    return this.request('POST', '/Invoices', { Invoices: [data] })
  }

  async getItems() {
    return this.request('GET', '/Items')
  }

  async createItem(data: { Code: string; Description?: string; SalesDetails?: any; PurchaseDetails?: any }) {
    return this.request('POST', '/Items', { Items: [data] })
  }

  async getBankTransactions() {
    return this.request('GET', '/BankTransactions')
  }

  async getReports(reportUrl: string) {
    return this.request('GET', `/Reports/${reportUrl}`)
  }

  async getAccounts() {
    return this.request('GET', '/Accounts')
  }
}

// FreshBooks Integration
export class FreshBooksConnector extends BaseConnector {
  constructor() {
    super({
      id: 'freshbooks',
      name: 'FreshBooks',
      description: 'Cloud accounting software for small businesses',
      category: 'finance',
      icon: 'https://example.com/freshbooks-icon.png',
      authType: 'oauth2',
      baseUrl: 'https://api.freshbooks.com/accounting/account'
    })
  }

  async getClients() {
    return this.request('GET', '/users/clients')
  }

  async createClient(data: { fname: string; lname: string; email?: string; organization?: string }) {
    return this.request('POST', '/users/clients', { client: data })
  }

  async getInvoices() {
    return this.request('GET', '/users/invoices')
  }

  async createInvoice(data: { customerid: number; create_date: string; lines: any[] }) {
    return this.request('POST', '/users/invoices', { invoice: data })
  }

  async getExpenses() {
    return this.request('GET', '/users/expenses')
  }

  async createExpense(data: { amount: { amount: string; code: string }; date: string; categoryid?: number }) {
    return this.request('POST', '/users/expenses', { expense: data })
  }

  async getProjects() {
    return this.request('GET', '/users/projects')
  }

  async getTimeEntries() {
    return this.request('GET', '/users/time_entries')
  }
}

// Wave Accounting Integration
export class WaveConnector extends BaseConnector {
  constructor() {
    super({
      id: 'wave',
      name: 'Wave Accounting',
      description: 'Free accounting software for small businesses',
      category: 'finance',
      icon: 'https://example.com/wave-icon.png',
      authType: 'oauth2',
      baseUrl: 'https://gql.waveapps.com/graphql/public'
    })
  }

  async getBusinesses() {
    const query = `query { businesses { edges { node { id name } } } }`
    return this.graphqlRequest(query)
  }

  async getCustomers(businessId: string) {
    const query = `
      query {
        business(id: "${businessId}") {
          customers {
            edges {
              node { id name email }
            }
          }
        }
      }
    `
    return this.graphqlRequest(query)
  }

  async createCustomer(businessId: string, data: { name: string; email?: string }) {
    const mutation = `
      mutation {
        customerCreate(input: {
          businessId: "${businessId}"
          name: "${data.name}"
          ${data.email ? `email: "${data.email}"` : ''}
        }) {
          customer { id name }
          didSucceed
          inputErrors { field message }
        }
      }
    `
    return this.graphqlRequest(mutation)
  }

  async getInvoices(businessId: string) {
    const query = `
      query {
        business(id: "${businessId}") {
          invoices {
            edges {
              node { id invoiceNumber total { raw } status }
            }
          }
        }
      }
    `
    return this.graphqlRequest(query)
  }

  private async graphqlRequest(query: string) {
    return this.request('POST', '', { query })
  }
}

// Zoho Books Integration
export class ZohoBooksConnector extends BaseConnector {
  constructor() {
    super({
      id: 'zoho-books',
      name: 'Zoho Books',
      description: 'Online accounting software for businesses',
      category: 'finance',
      icon: 'https://example.com/zoho-books-icon.png',
      authType: 'oauth2',
      baseUrl: 'https://books.zoho.com/api/v3'
    })
  }

  async getContacts() {
    return this.request('GET', '/contacts')
  }

  async createContact(data: { contact_name: string; contact_type?: string; customer_sub_type?: string }) {
    return this.request('POST', '/contacts', data)
  }

  async getInvoices() {
    return this.request('GET', '/invoices')
  }

  async createInvoice(data: { customer_id: string; line_items: any[]; date?: string }) {
    return this.request('POST', '/invoices', data)
  }

  async getItems() {
    return this.request('GET', '/items')
  }

  async createItem(data: { name: string; rate?: number; account_id?: string }) {
    return this.request('POST', '/items', data)
  }

  async getExpenses() {
    return this.request('GET', '/expenses')
  }

  async getBankAccounts() {
    return this.request('GET', '/bankaccounts')
  }

  async getChartOfAccounts() {
    return this.request('GET', '/chartofaccounts')
  }
}

// Plaid Integration (Banking/Financial Data)
export class PlaidConnector extends BaseConnector {
  constructor() {
    super({
      id: 'plaid',
      name: 'Plaid',
      description: 'Financial data aggregation and banking API',
      category: 'finance',
      icon: 'https://example.com/plaid-icon.png',
      authType: 'api_key',
      baseUrl: 'https://production.plaid.com'
    })
  }

  async createLinkToken(data: { user: { client_user_id: string }; client_name: string; products: string[] }) {
    return this.request('POST', '/link/token/create', data)
  }

  async exchangePublicToken(publicToken: string) {
    return this.request('POST', '/link/token/exchange', { public_token: publicToken })
  }

  async getAccounts(accessToken: string) {
    return this.request('POST', '/accounts/get', { access_token: accessToken })
  }

  async getTransactions(accessToken: string, startDate: string, endDate: string) {
    return this.request('POST', '/transactions/get', {
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate
    })
  }

  async getBalances(accessToken: string) {
    return this.request('POST', '/accounts/balance/get', { access_token: accessToken })
  }

  async getIdentity(accessToken: string) {
    return this.request('POST', '/identity/get', { access_token: accessToken })
  }

  async getIncome(accessToken: string) {
    return this.request('POST', '/income/get', { access_token: accessToken })
  }
}

// Export all finance connectors
export const financeConnectors: IntegrationConfig[] = [
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Accounting and financial management software',
    category: 'finance',
    icon: 'https://example.com/quickbooks-icon.png',
    connector: QuickBooksConnector,
    actions: [
      {
        id: 'get_customers',
        name: 'Get Customers',
        description: 'Retrieve all customers',
        inputs: [],
        outputs: [{ name: 'customers', type: 'array' }]
      },
      {
        id: 'create_invoice',
        name: 'Create Invoice',
        description: 'Create a new invoice',
        inputs: [
          { name: 'customerId', type: 'string', required: true },
          { name: 'items', type: 'array', required: true }
        ],
        outputs: [{ name: 'invoice', type: 'object' }]
      },
      {
        id: 'get_reports',
        name: 'Get Reports',
        description: 'Generate financial reports',
        inputs: [
          { name: 'reportType', type: 'string', required: true },
          { name: 'params', type: 'object' }
        ],
        outputs: [{ name: 'report', type: 'object' }]
      }
    ]
  },
  {
    id: 'xero',
    name: 'Xero',
    description: 'Cloud-based accounting software',
    category: 'finance',
    icon: 'https://example.com/xero-icon.png',
    connector: XeroConnector,
    actions: [
      {
        id: 'get_contacts',
        name: 'Get Contacts',
        description: 'Retrieve all contacts',
        inputs: [],
        outputs: [{ name: 'contacts', type: 'array' }]
      },
      {
        id: 'create_invoice',
        name: 'Create Invoice',
        description: 'Create a new invoice',
        inputs: [
          { name: 'contactId', type: 'string', required: true },
          { name: 'lineItems', type: 'array', required: true }
        ],
        outputs: [{ name: 'invoice', type: 'object' }]
      }
    ]
  },
  {
    id: 'freshbooks',
    name: 'FreshBooks',
    description: 'Cloud accounting software for small businesses',
    category: 'finance',
    icon: 'https://example.com/freshbooks-icon.png',
    connector: FreshBooksConnector,
    actions: [
      {
        id: 'get_clients',
        name: 'Get Clients',
        description: 'Retrieve all clients',
        inputs: [],
        outputs: [{ name: 'clients', type: 'array' }]
      },
      {
        id: 'create_expense',
        name: 'Create Expense',
        description: 'Create a new expense',
        inputs: [
          { name: 'amount', type: 'number', required: true },
          { name: 'date', type: 'string', required: true },
          { name: 'description', type: 'string' }
        ],
        outputs: [{ name: 'expense', type: 'object' }]
      }
    ]
  },
  {
    id: 'wave',
    name: 'Wave Accounting',
    description: 'Free accounting software for small businesses',
    category: 'finance',
    icon: 'https://example.com/wave-icon.png',
    connector: WaveConnector,
    actions: [
      {
        id: 'get_customers',
        name: 'Get Customers',
        description: 'Retrieve all customers',
        inputs: [{ name: 'businessId', type: 'string', required: true }],
        outputs: [{ name: 'customers', type: 'array' }]
      }
    ]
  },
  {
    id: 'zoho-books',
    name: 'Zoho Books',
    description: 'Online accounting software for businesses',
    category: 'finance',
    icon: 'https://example.com/zoho-books-icon.png',
    connector: ZohoBooksConnector,
    actions: [
      {
        id: 'get_contacts',
        name: 'Get Contacts',
        description: 'Retrieve all contacts',
        inputs: [],
        outputs: [{ name: 'contacts', type: 'array' }]
      }
    ]
  },
  {
    id: 'plaid',
    name: 'Plaid',
    description: 'Financial data aggregation and banking API',
    category: 'finance',
    icon: 'https://example.com/plaid-icon.png',
    connector: PlaidConnector,
    actions: [
      {
        id: 'get_accounts',
        name: 'Get Bank Accounts',
        description: 'Retrieve connected bank accounts',
        inputs: [{ name: 'accessToken', type: 'string', required: true }],
        outputs: [{ name: 'accounts', type: 'array' }]
      },
      {
        id: 'get_transactions',
        name: 'Get Transactions',
        description: 'Retrieve bank transactions',
        inputs: [
          { name: 'accessToken', type: 'string', required: true },
          { name: 'startDate', type: 'string', required: true },
          { name: 'endDate', type: 'string', required: true }
        ],
        outputs: [{ name: 'transactions', type: 'array' }]
      }
    ]
  }
]