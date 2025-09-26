import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface PandaDocConfig extends ConnectionConfig {
  apiKey: string
}

export class PandaDocConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'pandadoc'
  public readonly name = 'PandaDoc'
  public readonly description = 'Document automation with proposals, contracts, e-signatures, and approval workflows'
  public readonly category = 'legal'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password' as const,
        required: true,
        description: 'PandaDoc API key'
      }
    ]
  }

  async validateConnection(config: PandaDocConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch('https://api.pandadoc.com/public/v1/members/current/', {
        method: 'GET',
        headers: {
          'Authorization': `API-Key ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        return { valid: false, error: 'Invalid PandaDoc API key' }
      }

      return { valid: true }
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown validation error' 
      }
    }
  }

  async execute(input: any, config: PandaDocConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation, ...params } = input
      const headers = {
        'Authorization': `API-Key ${config.apiKey}`,
        'Content-Type': 'application/json'
      }

      let result
      switch (operation) {
        case 'listDocuments':
          result = await this.listDocuments(params, headers)
          break
        case 'getDocument':
          result = await this.getDocument(params, headers)
          break
        case 'createDocument':
          result = await this.createDocument(params, headers)
          break
        case 'sendDocument':
          result = await this.sendDocument(params, headers)
          break
        case 'createDocumentFromTemplate':
          result = await this.createDocumentFromTemplate(params, headers)
          break
        case 'downloadDocument':
          result = await this.downloadDocument(params, headers)
          break
        case 'getDocumentDetails':
          result = await this.getDocumentDetails(params, headers)
          break
        case 'listTemplates':
          result = await this.listTemplates(params, headers)
          break
        case 'getTemplate':
          result = await this.getTemplate(params, headers)
          break
        case 'createTemplate':
          result = await this.createTemplate(params, headers)
          break
        case 'listContacts':
          result = await this.listContacts(params, headers)
          break
        case 'createContact':
          result = await this.createContact(params, headers)
          break
        case 'updateContact':
          result = await this.updateContact(params, headers)
          break
        case 'deleteContact':
          result = await this.deleteContact(params, headers)
          break
        case 'createWebhook':
          result = await this.createWebhook(params, headers)
          break
        case 'listWebhooks':
          result = await this.listWebhooks(params, headers)
          break
        case 'deleteWebhook':
          result = await this.deleteWebhook(params, headers)
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

  private async listDocuments(params: any, headers: any): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params.q) queryParams.append('q', params.q)
    if (params.status) queryParams.append('status', params.status)
    if (params.count) queryParams.append('count', params.count.toString())
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.metadata_filters) queryParams.append('metadata_filters', JSON.stringify(params.metadata_filters))
    if (params.folder_uuid) queryParams.append('folder_uuid', params.folder_uuid)
    if (params.form_id) queryParams.append('form_id', params.form_id)
    if (params.deleted) queryParams.append('deleted', params.deleted.toString())
    if (params.created_from) queryParams.append('created_from', params.created_from)
    if (params.created_to) queryParams.append('created_to', params.created_to)
    if (params.modified_from) queryParams.append('modified_from', params.modified_from)
    if (params.modified_to) queryParams.append('modified_to', params.modified_to)
    if (params.status_changed_from) queryParams.append('status_changed_from', params.status_changed_from)
    if (params.status_changed_to) queryParams.append('status_changed_to', params.status_changed_to)
    if (params.order_by) queryParams.append('order_by', params.order_by)

    const response = await fetch(`https://api.pandadoc.com/public/v1/documents?${queryParams}`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async getDocument(params: any, headers: any): Promise<any> {
    const response = await fetch(`https://api.pandadoc.com/public/v1/documents/${params.documentId}`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async createDocument(params: any, headers: any): Promise<any> {
    const response = await fetch('https://api.pandadoc.com/public/v1/documents', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: params.name,
        url: params.url,
        html: params.html,
        recipients: params.recipients,
        fields: params.fields,
        metadata: params.metadata,
        tags: params.tags,
        pricing_tables: params.pricing_tables,
        content_placeholders: params.content_placeholders,
        images: params.images,
        folder_uuid: params.folder_uuid,
        parse_form_fields: params.parse_form_fields
      })
    })
    return await response.json()
  }

  private async sendDocument(params: any, headers: any): Promise<any> {
    const response = await fetch(`https://api.pandadoc.com/public/v1/documents/${params.documentId}/send`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: params.message,
        subject: params.subject,
        silent: params.silent,
        sender: params.sender
      })
    })
    return await response.json()
  }

  private async createDocumentFromTemplate(params: any, headers: any): Promise<any> {
    const response = await fetch('https://api.pandadoc.com/public/v1/documents', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: params.name,
        template_uuid: params.template_uuid,
        folder_uuid: params.folder_uuid,
        recipients: params.recipients,
        tokens: params.tokens,
        fields: params.fields,
        metadata: params.metadata,
        pricing_tables: params.pricing_tables,
        images: params.images,
        tags: params.tags
      })
    })
    return await response.json()
  }

  private async downloadDocument(params: any, headers: any): Promise<any> {
    const response = await fetch(`https://api.pandadoc.com/public/v1/documents/${params.documentId}/download`, {
      method: 'GET',
      headers: {
        ...headers,
        'Accept': 'application/pdf'
      }
    })
    return await response.arrayBuffer()
  }

  private async getDocumentDetails(params: any, headers: any): Promise<any> {
    const response = await fetch(`https://api.pandadoc.com/public/v1/documents/${params.documentId}/details`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async listTemplates(params: any, headers: any): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params.q) queryParams.append('q', params.q)
    if (params.shared) queryParams.append('shared', params.shared.toString())
    if (params.deleted) queryParams.append('deleted', params.deleted.toString())
    if (params.count) queryParams.append('count', params.count.toString())
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.id) queryParams.append('id', params.id)
    if (params.folder_uuid) queryParams.append('folder_uuid', params.folder_uuid)
    if (params.tag) queryParams.append('tag', params.tag)

    const response = await fetch(`https://api.pandadoc.com/public/v1/templates?${queryParams}`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async getTemplate(params: any, headers: any): Promise<any> {
    const response = await fetch(`https://api.pandadoc.com/public/v1/templates/${params.templateId}`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async createTemplate(params: any, headers: any): Promise<any> {
    const response = await fetch('https://api.pandadoc.com/public/v1/templates', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: params.name,
        url: params.url,
        html: params.html,
        shared: params.shared,
        fields: params.fields,
        roles: params.roles,
        tokens: params.tokens,
        images: params.images,
        pricing_tables: params.pricing_tables,
        content_placeholders: params.content_placeholders,
        folder_uuid: params.folder_uuid,
        tags: params.tags
      })
    })
    return await response.json()
  }

  private async listContacts(params: any, headers: any): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params.email) queryParams.append('email', params.email)
    if (params.company) queryParams.append('company', params.company)

    const response = await fetch(`https://api.pandadoc.com/public/v1/contacts?${queryParams}`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async createContact(params: any, headers: any): Promise<any> {
    const response = await fetch('https://api.pandadoc.com/public/v1/contacts', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: params.email,
        first_name: params.first_name,
        last_name: params.last_name,
        company: params.company,
        job_title: params.job_title,
        phone: params.phone,
        state: params.state,
        street_address: params.street_address,
        city: params.city,
        postal_code: params.postal_code,
        country: params.country
      })
    })
    return await response.json()
  }

  private async updateContact(params: any, headers: any): Promise<any> {
    const response = await fetch(`https://api.pandadoc.com/public/v1/contacts/${params.contactId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        email: params.email,
        first_name: params.first_name,
        last_name: params.last_name,
        company: params.company,
        job_title: params.job_title,
        phone: params.phone,
        state: params.state,
        street_address: params.street_address,
        city: params.city,
        postal_code: params.postal_code,
        country: params.country
      })
    })
    return await response.json()
  }

  private async deleteContact(params: any, headers: any): Promise<any> {
    const response = await fetch(`https://api.pandadoc.com/public/v1/contacts/${params.contactId}`, {
      method: 'DELETE',
      headers
    })
    return response.status === 204 ? { success: true } : await response.json()
  }

  private async createWebhook(params: any, headers: any): Promise<any> {
    const response = await fetch('https://api.pandadoc.com/public/v1/webhooks', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        url: params.url,
        event_triggers: params.event_triggers,
        shared_key: params.shared_key
      })
    })
    return await response.json()
  }

  private async listWebhooks(params: any, headers: any): Promise<any> {
    const response = await fetch('https://api.pandadoc.com/public/v1/webhooks', {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async deleteWebhook(params: any, headers: any): Promise<any> {
    const response = await fetch(`https://api.pandadoc.com/public/v1/webhooks/${params.webhookId}`, {
      method: 'DELETE',
      headers
    })
    return response.status === 204 ? { success: true } : await response.json()
  }

  getCapabilities() {
    return {
      supportsBatch: false,
      supportsStreaming: false,
      supportsFiles: true,
      maxConcurrency: 10,
      rateLimits: {
        requestsPerMinute: 300,
        requestsPerDay: 50000
      },
      documentFeatures: {
        supportsTemplates: true,
        supportsESignatures: true,
        supportsApprovals: true,
        supportsVersioning: true,
        supportsCollaboration: true,
        supportsPricingTables: true,
        supportsCustomFields: true,
        supportsWebhooks: true,
        supportedFormats: ['PDF', 'HTML', 'DOCX'],
        maxDocumentSize: '100MB',
        maxTemplates: 'unlimited',
        maxRecipients: 50
      }
    }
  }
}