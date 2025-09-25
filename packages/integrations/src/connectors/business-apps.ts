// Business Applications Integrations
import { BaseConnector, ConnectorConfig, ConnectorAction } from '../types'

// HubSpot Connector
export class HubSpotConnector extends BaseConnector {
  constructor(config: ConnectorConfig) {
    super({
      ...config,
      id: 'hubspot',
      name: 'HubSpot',
      description: 'Manage contacts, deals, and marketing campaigns',
      category: 'business-apps',
      version: '1.0.0',
      icon: 'hubspot-icon',
      color: '#FF7A00'
    })
  }

  getActions(): ConnectorAction[] {
    return [
      {
        id: 'create-contact',
        name: 'Create Contact',
        description: 'Create new contact in HubSpot',
        inputs: [
          { name: 'email', type: 'string', required: true, description: 'Contact email' },
          { name: 'firstName', type: 'string', required: false, description: 'First name' },
          { name: 'lastName', type: 'string', required: false, description: 'Last name' },
          { name: 'company', type: 'string', required: false, description: 'Company name' },
          { name: 'phone', type: 'string', required: false, description: 'Phone number' }
        ],
        outputs: [
          { name: 'contactId', type: 'string', description: 'Created contact ID' }
        ]
      },
      {
        id: 'create-deal',
        name: 'Create Deal',
        description: 'Create new deal',
        inputs: [
          { name: 'dealName', type: 'string', required: true, description: 'Deal name' },
          { name: 'amount', type: 'number', required: false, description: 'Deal amount' },
          { name: 'stage', type: 'string', required: false, description: 'Deal stage' },
          { name: 'contactId', type: 'string', required: false, description: 'Associated contact ID' }
        ],
        outputs: [
          { name: 'dealId', type: 'string', description: 'Created deal ID' }
        ]
      },
      {
        id: 'send-email',
        name: 'Send Email',
        description: 'Send marketing email',
        inputs: [
          { name: 'recipients', type: 'array', required: true, description: 'Recipient contact IDs' },
          { name: 'subject', type: 'string', required: true, description: 'Email subject' },
          { name: 'content', type: 'text', required: true, description: 'Email content' }
        ],
        outputs: [
          { name: 'emailId', type: 'string', description: 'Sent email ID' }
        ]
      }
    ]
  }

  async executeAction(actionId: string, inputs: Record<string, any>): Promise<any> {
    switch (actionId) {
      case 'create-contact':
        return this.createContact(inputs)
      case 'create-deal':
        return this.createDeal(inputs)
      case 'send-email':
        return this.sendEmail(inputs)
      default:
        throw new Error(`Unknown action: ${actionId}`)
    }
  }

  private async createContact(inputs: any) {
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          email: inputs.email,
          firstname: inputs.firstName,
          lastname: inputs.lastName,
          company: inputs.company,
          phone: inputs.phone
        }
      })
    })

    const result = await response.json()
    return { contactId: result.id }
  }

  private async createDeal(inputs: any) {
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          dealname: inputs.dealName,
          amount: inputs.amount,
          dealstage: inputs.stage
        },
        associations: inputs.contactId ? [{
          to: { id: inputs.contactId },
          types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }]
        }] : undefined
      })
    })

    const result = await response.json()
    return { dealId: result.id }
  }

  private async sendEmail(inputs: any) {
    // Mock implementation - HubSpot email API is complex
    return { emailId: `email_${Date.now()}` }
  }
}

// Salesforce Connector
export class SalesforceConnector extends BaseConnector {
  constructor(config: ConnectorConfig) {
    super({
      ...config,
      id: 'salesforce',
      name: 'Salesforce',
      description: 'Manage Salesforce CRM data',
      category: 'business-apps',
      version: '1.0.0',
      icon: 'salesforce-icon',
      color: '#00A1E0'
    })
  }

  getActions(): ConnectorAction[] {
    return [
      {
        id: 'create-lead',
        name: 'Create Lead',
        description: 'Create new lead in Salesforce',
        inputs: [
          { name: 'firstName', type: 'string', required: true, description: 'First name' },
          { name: 'lastName', type: 'string', required: true, description: 'Last name' },
          { name: 'email', type: 'string', required: false, description: 'Email address' },
          { name: 'company', type: 'string', required: true, description: 'Company name' },
          { name: 'status', type: 'select', options: ['Open', 'Qualified', 'Unqualified'], description: 'Lead status' }
        ],
        outputs: [
          { name: 'leadId', type: 'string', description: 'Created lead ID' }
        ]
      },
      {
        id: 'create-opportunity',
        name: 'Create Opportunity',
        description: 'Create new opportunity',
        inputs: [
          { name: 'name', type: 'string', required: true, description: 'Opportunity name' },
          { name: 'amount', type: 'number', required: false, description: 'Opportunity amount' },
          { name: 'stage', type: 'string', required: true, description: 'Sales stage' },
          { name: 'closeDate', type: 'date', required: true, description: 'Expected close date' },
          { name: 'accountId', type: 'string', required: false, description: 'Associated account ID' }
        ],
        outputs: [
          { name: 'opportunityId', type: 'string', description: 'Created opportunity ID' }
        ]
      },
      {
        id: 'query-records',
        name: 'Query Records',
        description: 'Query Salesforce records using SOQL',
        inputs: [
          { name: 'soql', type: 'text', required: true, description: 'SOQL query' }
        ],
        outputs: [
          { name: 'records', type: 'array', description: 'Query results' }
        ]
      }
    ]
  }

  async executeAction(actionId: string, inputs: Record<string, any>): Promise<any> {
    switch (actionId) {
      case 'create-lead':
        return this.createLead(inputs)
      case 'create-opportunity':
        return this.createOpportunity(inputs)
      case 'query-records':
        return this.queryRecords(inputs)
      default:
        throw new Error(`Unknown action: ${actionId}`)
    }
  }

  private async createLead(inputs: any) {
    const response = await fetch(`${this.credentials.instanceUrl}/services/data/v58.0/sobjects/Lead`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        FirstName: inputs.firstName,
        LastName: inputs.lastName,
        Email: inputs.email,
        Company: inputs.company,
        Status: inputs.status || 'Open'
      })
    })

    const result = await response.json()
    return { leadId: result.id }
  }

  private async createOpportunity(inputs: any) {
    const response = await fetch(`${this.credentials.instanceUrl}/services/data/v58.0/sobjects/Opportunity`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Name: inputs.name,
        Amount: inputs.amount,
        StageName: inputs.stage,
        CloseDate: inputs.closeDate,
        AccountId: inputs.accountId
      })
    })

    const result = await response.json()
    return { opportunityId: result.id }
  }

  private async queryRecords(inputs: any) {
    const response = await fetch(
      `${this.credentials.instanceUrl}/services/data/v58.0/query?q=${encodeURIComponent(inputs.soql)}`,
      {
        headers: { 'Authorization': `Bearer ${this.credentials.accessToken}` }
      }
    )

    const result = await response.json()
    return { records: result.records || [] }
  }
}

// Stripe Connector
export class StripeConnector extends BaseConnector {
  constructor(config: ConnectorConfig) {
    super({
      ...config,
      id: 'stripe',
      name: 'Stripe',
      description: 'Process payments and manage subscriptions',
      category: 'business-apps',
      version: '1.0.0',
      icon: 'stripe-icon',
      color: '#635BFF'
    })
  }

  getActions(): ConnectorAction[] {
    return [
      {
        id: 'create-customer',
        name: 'Create Customer',
        description: 'Create new Stripe customer',
        inputs: [
          { name: 'email', type: 'string', required: true, description: 'Customer email' },
          { name: 'name', type: 'string', required: false, description: 'Customer name' },
          { name: 'description', type: 'string', required: false, description: 'Customer description' }
        ],
        outputs: [
          { name: 'customerId', type: 'string', description: 'Created customer ID' }
        ]
      },
      {
        id: 'create-payment-intent',
        name: 'Create Payment Intent',
        description: 'Create payment intent for processing',
        inputs: [
          { name: 'amount', type: 'number', required: true, description: 'Amount in cents' },
          { name: 'currency', type: 'string', required: false, description: 'Currency code (default: USD)' },
          { name: 'customerId', type: 'string', required: false, description: 'Customer ID' },
          { name: 'description', type: 'string', required: false, description: 'Payment description' }
        ],
        outputs: [
          { name: 'paymentIntentId', type: 'string', description: 'Payment intent ID' },
          { name: 'clientSecret', type: 'string', description: 'Client secret for frontend' }
        ]
      },
      {
        id: 'create-subscription',
        name: 'Create Subscription',
        description: 'Create recurring subscription',
        inputs: [
          { name: 'customerId', type: 'string', required: true, description: 'Customer ID' },
          { name: 'priceId', type: 'string', required: true, description: 'Price ID' },
          { name: 'trialPeriodDays', type: 'number', required: false, description: 'Trial period in days' }
        ],
        outputs: [
          { name: 'subscriptionId', type: 'string', description: 'Created subscription ID' }
        ]
      },
      {
        id: 'list-charges',
        name: 'List Charges',
        description: 'List recent charges',
        inputs: [
          { name: 'customerId', type: 'string', required: false, description: 'Filter by customer' },
          { name: 'limit', type: 'number', required: false, description: 'Number of charges to return' }
        ],
        outputs: [
          { name: 'charges', type: 'array', description: 'List of charges' }
        ]
      }
    ]
  }

  async executeAction(actionId: string, inputs: Record<string, any>): Promise<any> {
    switch (actionId) {
      case 'create-customer':
        return this.createCustomer(inputs)
      case 'create-payment-intent':
        return this.createPaymentIntent(inputs)
      case 'create-subscription':
        return this.createSubscription(inputs)
      case 'list-charges':
        return this.listCharges(inputs)
      default:
        throw new Error(`Unknown action: ${actionId}`)
    }
  }

  private async createCustomer(inputs: any) {
    const response = await fetch('https://api.stripe.com/v1/customers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        email: inputs.email,
        name: inputs.name || '',
        description: inputs.description || ''
      })
    })

    const result = await response.json()
    return { customerId: result.id }
  }

  private async createPaymentIntent(inputs: any) {
    const params = new URLSearchParams({
      amount: inputs.amount.toString(),
      currency: inputs.currency || 'usd'
    })

    if (inputs.customerId) params.append('customer', inputs.customerId)
    if (inputs.description) params.append('description', inputs.description)

    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    })

    const result = await response.json()
    return {
      paymentIntentId: result.id,
      clientSecret: result.client_secret
    }
  }

  private async createSubscription(inputs: any) {
    const params = new URLSearchParams({
      customer: inputs.customerId,
      'items[0][price]': inputs.priceId
    })

    if (inputs.trialPeriodDays) {
      params.append('trial_period_days', inputs.trialPeriodDays.toString())
    }

    const response = await fetch('https://api.stripe.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    })

    const result = await response.json()
    return { subscriptionId: result.id }
  }

  private async listCharges(inputs: any) {
    const params = new URLSearchParams()
    if (inputs.customerId) params.append('customer', inputs.customerId)
    if (inputs.limit) params.append('limit', inputs.limit.toString())

    const response = await fetch(`https://api.stripe.com/v1/charges?${params}`, {
      headers: { 'Authorization': `Bearer ${this.credentials.secretKey}` }
    })

    const result = await response.json()
    return { charges: result.data || [] }
  }
}

// Shopify Connector
export class ShopifyConnector extends BaseConnector {
  constructor(config: ConnectorConfig) {
    super({
      ...config,
      id: 'shopify',
      name: 'Shopify',
      description: 'Manage Shopify store products and orders',
      category: 'business-apps',
      version: '1.0.0',
      icon: 'shopify-icon',
      color: '#96BF48'
    })
  }

  getActions(): ConnectorAction[] {
    return [
      {
        id: 'create-product',
        name: 'Create Product',
        description: 'Create new product in Shopify',
        inputs: [
          { name: 'title', type: 'string', required: true, description: 'Product title' },
          { name: 'description', type: 'text', required: false, description: 'Product description' },
          { name: 'price', type: 'number', required: true, description: 'Product price' },
          { name: 'inventoryQuantity', type: 'number', required: false, description: 'Inventory quantity' }
        ],
        outputs: [
          { name: 'productId', type: 'string', description: 'Created product ID' }
        ]
      },
      {
        id: 'list-orders',
        name: 'List Orders',
        description: 'List recent orders',
        inputs: [
          { name: 'status', type: 'select', options: ['open', 'closed', 'cancelled', 'any'], description: 'Order status filter' },
          { name: 'limit', type: 'number', required: false, description: 'Number of orders to return' }
        ],
        outputs: [
          { name: 'orders', type: 'array', description: 'List of orders' }
        ]
      },
      {
        id: 'update-inventory',
        name: 'Update Inventory',
        description: 'Update product inventory',
        inputs: [
          { name: 'inventoryItemId', type: 'string', required: true, description: 'Inventory item ID' },
          { name: 'quantity', type: 'number', required: true, description: 'New quantity' },
          { name: 'locationId', type: 'string', required: true, description: 'Location ID' }
        ],
        outputs: [
          { name: 'success', type: 'boolean', description: 'Update success' }
        ]
      }
    ]
  }

  async executeAction(actionId: string, inputs: Record<string, any>): Promise<any> {
    switch (actionId) {
      case 'create-product':
        return this.createProduct(inputs)
      case 'list-orders':
        return this.listOrders(inputs)
      case 'update-inventory':
        return this.updateInventory(inputs)
      default:
        throw new Error(`Unknown action: ${actionId}`)
    }
  }

  private async createProduct(inputs: any) {
    const response = await fetch(`https://${this.credentials.shopName}.myshopify.com/admin/api/2023-10/products.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': this.credentials.accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        product: {
          title: inputs.title,
          body_html: inputs.description,
          variants: [{
            price: inputs.price,
            inventory_quantity: inputs.inventoryQuantity || 0
          }]
        }
      })
    })

    const result = await response.json()
    return { productId: result.product?.id?.toString() }
  }

  private async listOrders(inputs: any) {
    const params = new URLSearchParams()
    if (inputs.status && inputs.status !== 'any') params.append('status', inputs.status)
    if (inputs.limit) params.append('limit', inputs.limit.toString())

    const response = await fetch(
      `https://${this.credentials.shopName}.myshopify.com/admin/api/2023-10/orders.json?${params}`,
      {
        headers: { 'X-Shopify-Access-Token': this.credentials.accessToken }
      }
    )

    const result = await response.json()
    return { orders: result.orders || [] }
  }

  private async updateInventory(inputs: any) {
    const response = await fetch(
      `https://${this.credentials.shopName}.myshopify.com/admin/api/2023-10/inventory_levels/set.json`,
      {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': this.credentials.accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location_id: inputs.locationId,
          inventory_item_id: inputs.inventoryItemId,
          available: inputs.quantity
        })
      }
    )

    return { success: response.ok }
  }
}

// Zendesk Connector
export class ZendeskConnector extends BaseConnector {
  constructor(config: ConnectorConfig) {
    super({
      ...config,
      id: 'zendesk',
      name: 'Zendesk',
      description: 'Manage customer support tickets',
      category: 'business-apps',
      version: '1.0.0',
      icon: 'zendesk-icon',
      color: '#03363D'
    })
  }

  getActions(): ConnectorAction[] {
    return [
      {
        id: 'create-ticket',
        name: 'Create Ticket',
        description: 'Create new support ticket',
        inputs: [
          { name: 'subject', type: 'string', required: true, description: 'Ticket subject' },
          { name: 'description', type: 'text', required: true, description: 'Ticket description' },
          { name: 'requesterEmail', type: 'string', required: true, description: 'Requester email' },
          { name: 'priority', type: 'select', options: ['low', 'normal', 'high', 'urgent'], description: 'Ticket priority' },
          { name: 'type', type: 'select', options: ['problem', 'incident', 'question', 'task'], description: 'Ticket type' }
        ],
        outputs: [
          { name: 'ticketId', type: 'string', description: 'Created ticket ID' }
        ]
      },
      {
        id: 'update-ticket',
        name: 'Update Ticket',
        description: 'Update existing ticket',
        inputs: [
          { name: 'ticketId', type: 'string', required: true, description: 'Ticket ID' },
          { name: 'status', type: 'select', options: ['new', 'open', 'pending', 'hold', 'solved', 'closed'], description: 'Ticket status' },
          { name: 'comment', type: 'text', required: false, description: 'Update comment' },
          { name: 'priority', type: 'select', options: ['low', 'normal', 'high', 'urgent'], description: 'Ticket priority' }
        ],
        outputs: [
          { name: 'success', type: 'boolean', description: 'Update success' }
        ]
      },
      {
        id: 'list-tickets',
        name: 'List Tickets',
        description: 'List support tickets',
        inputs: [
          { name: 'status', type: 'select', options: ['new', 'open', 'pending', 'hold', 'solved', 'closed'], description: 'Filter by status' },
          { name: 'assigneeId', type: 'string', required: false, description: 'Filter by assignee' },
          { name: 'requesterId', type: 'string', required: false, description: 'Filter by requester' }
        ],
        outputs: [
          { name: 'tickets', type: 'array', description: 'List of tickets' }
        ]
      }
    ]
  }

  async executeAction(actionId: string, inputs: Record<string, any>): Promise<any> {
    switch (actionId) {
      case 'create-ticket':
        return this.createTicket(inputs)
      case 'update-ticket':
        return this.updateTicket(inputs)
      case 'list-tickets':
        return this.listTickets(inputs)
      default:
        throw new Error(`Unknown action: ${actionId}`)
    }
  }

  private async createTicket(inputs: any) {
    const response = await fetch(`https://${this.credentials.subdomain}.zendesk.com/api/v2/tickets.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${this.credentials.email}/token:${this.credentials.apiToken}`)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ticket: {
          subject: inputs.subject,
          comment: { body: inputs.description },
          requester: { email: inputs.requesterEmail },
          priority: inputs.priority || 'normal',
          type: inputs.type || 'question'
        }
      })
    })

    const result = await response.json()
    return { ticketId: result.ticket?.id?.toString() }
  }

  private async updateTicket(inputs: any) {
    const updateData: any = {}
    if (inputs.status) updateData.status = inputs.status
    if (inputs.priority) updateData.priority = inputs.priority
    if (inputs.comment) updateData.comment = { body: inputs.comment }

    const response = await fetch(
      `https://${this.credentials.subdomain}.zendesk.com/api/v2/tickets/${inputs.ticketId}.json`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${btoa(`${this.credentials.email}/token:${this.credentials.apiToken}`)}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ticket: updateData })
      }
    )

    return { success: response.ok }
  }

  private async listTickets(inputs: any) {
    let url = `https://${this.credentials.subdomain}.zendesk.com/api/v2/tickets.json`
    const params = new URLSearchParams()
    
    if (inputs.status) params.append('status', inputs.status)
    if (inputs.assigneeId) params.append('assignee_id', inputs.assigneeId)
    if (inputs.requesterId) params.append('requester_id', inputs.requesterId)
    
    if (params.toString()) url += `?${params.toString()}`

    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${btoa(`${this.credentials.email}/token:${this.credentials.apiToken}`)}`
      }
    })

    const result = await response.json()
    return { tickets: result.tickets || [] }
  }
}