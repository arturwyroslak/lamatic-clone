// E-commerce platform integrations for online retail automation
import { BaseConnector, ConnectorConfig, ConnectorAction } from '../types'

export class ShopifyConnector extends BaseConnector {
  constructor(config: ConnectorConfig) {
    super(config)
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`https://${this.config.shopName}.myshopify.com/admin/api/2023-10/shop.json`, {
        headers: {
          'X-Shopify-Access-Token': this.credentials.accessToken,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        return { success: true, message: 'Shopify connection successful' }
      }
      return { success: false, message: 'Invalid Shopify credentials' }
    } catch (error) {
      return { success: false, message: `Connection failed: ${error.message}` }
    }
  }

  async getProducts(limit = 50): Promise<any[]> {
    const response = await fetch(`https://${this.config.shopName}.myshopify.com/admin/api/2023-10/products.json?limit=${limit}`, {
      headers: {
        'X-Shopify-Access-Token': this.credentials.accessToken,
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    return data.products || []
  }

  async createProduct(productData: any): Promise<any> {
    const response = await fetch(`https://${this.config.shopName}.myshopify.com/admin/api/2023-10/products.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': this.credentials.accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ product: productData })
    })
    const data = await response.json()
    return data.product
  }

  async updateProduct(productId: string, updates: any): Promise<any> {
    const response = await fetch(`https://${this.config.shopName}.myshopify.com/admin/api/2023-10/products/${productId}.json`, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': this.credentials.accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ product: updates })
    })
    const data = await response.json()
    return data.product
  }

  async getOrders(status = 'any', limit = 50): Promise<any[]> {
    const response = await fetch(`https://${this.config.shopName}.myshopify.com/admin/api/2023-10/orders.json?status=${status}&limit=${limit}`, {
      headers: {
        'X-Shopify-Access-Token': this.credentials.accessToken,
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    return data.orders || []
  }

  async updateOrderFulfillment(orderId: string, fulfillmentData: any): Promise<any> {
    const response = await fetch(`https://${this.config.shopName}.myshopify.com/admin/api/2023-10/orders/${orderId}/fulfillments.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': this.credentials.accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fulfillment: fulfillmentData })
    })
    const data = await response.json()
    return data.fulfillment
  }

  async getCustomers(limit = 50): Promise<any[]> {
    const response = await fetch(`https://${this.config.shopName}.myshopify.com/admin/api/2023-10/customers.json?limit=${limit}`, {
      headers: {
        'X-Shopify-Access-Token': this.credentials.accessToken,
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    return data.customers || []
  }

  async createCustomer(customerData: any): Promise<any> {
    const response = await fetch(`https://${this.config.shopName}.myshopify.com/admin/api/2023-10/customers.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': this.credentials.accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ customer: customerData })
    })
    const data = await response.json()
    return data.customer
  }

  async getInventoryLevels(): Promise<any[]> {
    const response = await fetch(`https://${this.config.shopName}.myshopify.com/admin/api/2023-10/inventory_levels.json`, {
      headers: {
        'X-Shopify-Access-Token': this.credentials.accessToken,
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    return data.inventory_levels || []
  }
}

export class WooCommerceConnector extends BaseConnector {
  constructor(config: ConnectorConfig) {
    super(config)
  }

  private getAuthHeader(): string {
    return 'Basic ' + Buffer.from(`${this.credentials.consumerKey}:${this.credentials.consumerSecret}`).toString('base64')
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.config.siteUrl}/wp-json/wc/v3/system_status`, {
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        return { success: true, message: 'WooCommerce connection successful' }
      }
      return { success: false, message: 'Invalid WooCommerce credentials' }
    } catch (error) {
      return { success: false, message: `Connection failed: ${error.message}` }
    }
  }

  async getProducts(perPage = 100): Promise<any[]> {
    const response = await fetch(`${this.config.siteUrl}/wp-json/wc/v3/products?per_page=${perPage}`, {
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json'
      }
    })
    return response.json()
  }

  async createProduct(productData: any): Promise<any> {
    const response = await fetch(`${this.config.siteUrl}/wp-json/wc/v3/products`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    })
    return response.json()
  }

  async updateProduct(productId: string, updates: any): Promise<any> {
    const response = await fetch(`${this.config.siteUrl}/wp-json/wc/v3/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    })
    return response.json()
  }

  async getOrders(status = 'any', perPage = 100): Promise<any[]> {
    const response = await fetch(`${this.config.siteUrl}/wp-json/wc/v3/orders?status=${status}&per_page=${perPage}`, {
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json'
      }
    })
    return response.json()
  }

  async updateOrderStatus(orderId: string, status: string): Promise<any> {
    const response = await fetch(`${this.config.siteUrl}/wp-json/wc/v3/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    })
    return response.json()
  }

  async getCustomers(perPage = 100): Promise<any[]> {
    const response = await fetch(`${this.config.siteUrl}/wp-json/wc/v3/customers?per_page=${perPage}`, {
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json'
      }
    })
    return response.json()
  }

  async createCustomer(customerData: any): Promise<any> {
    const response = await fetch(`${this.config.siteUrl}/wp-json/wc/v3/customers`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(customerData)
    })
    return response.json()
  }
}

export class StripeConnector extends BaseConnector {
  constructor(config: ConnectorConfig) {
    super(config)
  }

  private getAuthHeader(): string {
    return `Bearer ${this.credentials.secretKey}`
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('https://api.stripe.com/v1/account', {
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      
      if (response.ok) {
        return { success: true, message: 'Stripe connection successful' }
      }
      return { success: false, message: 'Invalid Stripe API key' }
    } catch (error) {
      return { success: false, message: `Connection failed: ${error.message}` }
    }
  }

  async createCustomer(customerData: { email: string; name?: string; description?: string }): Promise<any> {
    const params = new URLSearchParams()
    params.append('email', customerData.email)
    if (customerData.name) params.append('name', customerData.name)
    if (customerData.description) params.append('description', customerData.description)

    const response = await fetch('https://api.stripe.com/v1/customers', {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    })
    return response.json()
  }

  async createPaymentIntent(amount: number, currency = 'usd', customerId?: string): Promise<any> {
    const params = new URLSearchParams()
    params.append('amount', amount.toString())
    params.append('currency', currency)
    if (customerId) params.append('customer', customerId)

    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    })
    return response.json()
  }

  async createSubscription(customerId: string, priceId: string): Promise<any> {
    const params = new URLSearchParams()
    params.append('customer', customerId)
    params.append('items[0][price]', priceId)

    const response = await fetch('https://api.stripe.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    })
    return response.json()
  }

  async getPayments(limit = 100): Promise<any[]> {
    const response = await fetch(`https://api.stripe.com/v1/charges?limit=${limit}`, {
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    const data = await response.json()
    return data.data || []
  }

  async getSubscriptions(customerId?: string, limit = 100): Promise<any[]> {
    let url = `https://api.stripe.com/v1/subscriptions?limit=${limit}`
    if (customerId) url += `&customer=${customerId}`

    const response = await fetch(url, {
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    const data = await response.json()
    return data.data || []
  }

  async cancelSubscription(subscriptionId: string): Promise<any> {
    const response = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return response.json()
  }

  async createInvoice(customerId: string, items: Array<{ price: string; quantity?: number }>): Promise<any> {
    // First create invoice items
    for (const item of items) {
      const params = new URLSearchParams()
      params.append('customer', customerId)
      params.append('price', item.price)
      if (item.quantity) params.append('quantity', item.quantity.toString())

      await fetch('https://api.stripe.com/v1/invoiceitems', {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      })
    }

    // Then create the invoice
    const invoiceParams = new URLSearchParams()
    invoiceParams.append('customer', customerId)

    const response = await fetch('https://api.stripe.com/v1/invoices', {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: invoiceParams
    })
    return response.json()
  }
}

export class SquareConnector extends BaseConnector {
  constructor(config: ConnectorConfig) {
    super(config)
  }

  private getAuthHeader(): string {
    return `Bearer ${this.credentials.accessToken}`
  }

  private getBaseUrl(): string {
    return this.config.environment === 'production' 
      ? 'https://connect.squareup.com'
      : 'https://connect.squareupsandbox.com'
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.getBaseUrl()}/v2/locations`, {
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        return { success: true, message: 'Square connection successful' }
      }
      return { success: false, message: 'Invalid Square access token' }
    } catch (error) {
      return { success: false, message: `Connection failed: ${error.message}` }
    }
  }

  async getLocations(): Promise<any[]> {
    const response = await fetch(`${this.getBaseUrl()}/v2/locations`, {
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    return data.locations || []
  }

  async createPayment(paymentData: any): Promise<any> {
    const response = await fetch(`${this.getBaseUrl()}/v2/payments`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    })
    return response.json()
  }

  async getPayments(locationId?: string, beginTime?: string, endTime?: string): Promise<any[]> {
    let url = `${this.getBaseUrl()}/v2/payments`
    const params = new URLSearchParams()
    
    if (locationId) params.append('location_id', locationId)
    if (beginTime) params.append('begin_time', beginTime)
    if (endTime) params.append('end_time', endTime)
    
    if (params.toString()) url += `?${params.toString()}`

    const response = await fetch(url, {
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    return data.payments || []
  }

  async createCustomer(customerData: any): Promise<any> {
    const response = await fetch(`${this.getBaseUrl()}/v2/customers`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(customerData)
    })
    const data = await response.json()
    return data.customer
  }

  async getInventory(locationId?: string): Promise<any[]> {
    let url = `${this.getBaseUrl()}/v2/inventory/counts/batch-retrieve`
    
    const requestBody: any = {}
    if (locationId) {
      requestBody.location_ids = [locationId]
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
    const data = await response.json()
    return data.counts || []
  }
}

export class PayPalConnector extends BaseConnector {
  constructor(config: ConnectorConfig) {
    super(config)
  }

  private getBaseUrl(): string {
    return this.config.environment === 'production'
      ? 'https://api.paypal.com'
      : 'https://api.sandbox.paypal.com'
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.credentials.clientId}:${this.credentials.clientSecret}`).toString('base64')
    
    const response = await fetch(`${this.getBaseUrl()}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    })
    
    const data = await response.json()
    return data.access_token
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const accessToken = await this.getAccessToken()
      
      if (accessToken) {
        return { success: true, message: 'PayPal connection successful' }
      }
      return { success: false, message: 'Invalid PayPal credentials' }
    } catch (error) {
      return { success: false, message: `Connection failed: ${error.message}` }
    }
  }

  async createOrder(orderData: any): Promise<any> {
    const accessToken = await this.getAccessToken()
    
    const response = await fetch(`${this.getBaseUrl()}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    })
    return response.json()
  }

  async captureOrder(orderId: string): Promise<any> {
    const accessToken = await this.getAccessToken()
    
    const response = await fetch(`${this.getBaseUrl()}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    return response.json()
  }

  async createSubscription(subscriptionData: any): Promise<any> {
    const accessToken = await this.getAccessToken()
    
    const response = await fetch(`${this.getBaseUrl()}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscriptionData)
    })
    return response.json()
  }

  async getSubscription(subscriptionId: string): Promise<any> {
    const accessToken = await this.getAccessToken()
    
    const response = await fetch(`${this.getBaseUrl()}/v1/billing/subscriptions/${subscriptionId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    return response.json()
  }

  async cancelSubscription(subscriptionId: string, reason: string): Promise<any> {
    const accessToken = await this.getAccessToken()
    
    const response = await fetch(`${this.getBaseUrl()}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reason })
    })
    return response.status === 204 ? { success: true } : response.json()
  }
}

// Export connector configurations
export const ECOMMERCE_INTEGRATIONS = [
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Complete e-commerce platform for online stores',
    category: 'E-commerce',
    type: 'shopify',
    icon: 'shopify',
    color: '#96bf48',
    authType: 'api_key',
    config: {
      shopName: { type: 'text', label: 'Shop Name', required: true, placeholder: 'your-shop-name' }
    },
    credentials: {
      accessToken: { type: 'password', label: 'Private App Access Token', required: true }
    },
    actions: [
      { id: 'get_products', name: 'Get Products', description: 'List all products' },
      { id: 'create_product', name: 'Create Product', description: 'Create a new product' },
      { id: 'update_product', name: 'Update Product', description: 'Update existing product' },
      { id: 'get_orders', name: 'Get Orders', description: 'List orders' },
      { id: 'update_order_fulfillment', name: 'Update Order Fulfillment', description: 'Update order fulfillment' },
      { id: 'get_customers', name: 'Get Customers', description: 'List customers' },
      { id: 'create_customer', name: 'Create Customer', description: 'Create new customer' },
      { id: 'get_inventory_levels', name: 'Get Inventory Levels', description: 'Get inventory levels' }
    ]
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    description: 'WordPress e-commerce plugin',
    category: 'E-commerce',
    type: 'woocommerce',
    icon: 'woocommerce',
    color: '#96588a',
    authType: 'basic',
    config: {
      siteUrl: { type: 'url', label: 'Site URL', required: true, placeholder: 'https://yourstore.com' }
    },
    credentials: {
      consumerKey: { type: 'text', label: 'Consumer Key', required: true },
      consumerSecret: { type: 'password', label: 'Consumer Secret', required: true }
    },
    actions: [
      { id: 'get_products', name: 'Get Products', description: 'List all products' },
      { id: 'create_product', name: 'Create Product', description: 'Create a new product' },
      { id: 'update_product', name: 'Update Product', description: 'Update existing product' },
      { id: 'get_orders', name: 'Get Orders', description: 'List orders' },
      { id: 'update_order_status', name: 'Update Order Status', description: 'Update order status' },
      { id: 'get_customers', name: 'Get Customers', description: 'List customers' },
      { id: 'create_customer', name: 'Create Customer', description: 'Create new customer' }
    ]
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Online payment processing platform',
    category: 'Payment',
    type: 'stripe',
    icon: 'stripe',
    color: '#635bff',
    authType: 'api_key',
    credentials: {
      secretKey: { type: 'password', label: 'Secret Key', required: true }
    },
    actions: [
      { id: 'create_customer', name: 'Create Customer', description: 'Create a new customer' },
      { id: 'create_payment_intent', name: 'Create Payment Intent', description: 'Create payment intent' },
      { id: 'create_subscription', name: 'Create Subscription', description: 'Create subscription' },
      { id: 'get_payments', name: 'Get Payments', description: 'List payments' },
      { id: 'get_subscriptions', name: 'Get Subscriptions', description: 'List subscriptions' },
      { id: 'cancel_subscription', name: 'Cancel Subscription', description: 'Cancel subscription' },
      { id: 'create_invoice', name: 'Create Invoice', description: 'Create invoice' }
    ]
  },
  {
    id: 'square',
    name: 'Square',
    description: 'Point of sale and payment processing',
    category: 'Payment',
    type: 'square',
    icon: 'square',
    color: '#000000',
    authType: 'oauth',
    config: {
      environment: { type: 'select', label: 'Environment', required: true, options: ['sandbox', 'production'] }
    },
    credentials: {
      accessToken: { type: 'password', label: 'Access Token', required: true }
    },
    actions: [
      { id: 'get_locations', name: 'Get Locations', description: 'List business locations' },
      { id: 'create_payment', name: 'Create Payment', description: 'Process payment' },
      { id: 'get_payments', name: 'Get Payments', description: 'List payments' },
      { id: 'create_customer', name: 'Create Customer', description: 'Create customer' },
      { id: 'get_inventory', name: 'Get Inventory', description: 'Get inventory counts' }
    ]
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Digital payment platform',
    category: 'Payment',
    type: 'paypal',
    icon: 'paypal',
    color: '#003087',
    authType: 'oauth',
    config: {
      environment: { type: 'select', label: 'Environment', required: true, options: ['sandbox', 'production'] }
    },
    credentials: {
      clientId: { type: 'text', label: 'Client ID', required: true },
      clientSecret: { type: 'password', label: 'Client Secret', required: true }
    },
    actions: [
      { id: 'create_order', name: 'Create Order', description: 'Create payment order' },
      { id: 'capture_order', name: 'Capture Order', description: 'Capture payment order' },
      { id: 'create_subscription', name: 'Create Subscription', description: 'Create subscription' },
      { id: 'get_subscription', name: 'Get Subscription', description: 'Get subscription details' },
      { id: 'cancel_subscription', name: 'Cancel Subscription', description: 'Cancel subscription' }
    ]
  }
]