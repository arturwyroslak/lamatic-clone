import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface DocuSignConfig extends ConnectionConfig {
  accessToken: string
  accountId: string
  baseUrl: string
  environment: 'demo' | 'production'
}

export class DocuSignConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'docusign'
  public readonly name = 'DocuSign'
  public readonly description = 'Digital signature platform with envelopes, templates, signing workflows, and document management'
  public readonly category = 'legal'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'accessToken',
        label: 'Access Token',
        type: 'password' as const,
        required: true,
        description: 'DocuSign API access token'
      },
      {
        key: 'accountId',
        label: 'Account ID',
        type: 'text' as const,
        required: true,
        description: 'DocuSign account ID'
      },
      {
        key: 'baseUrl',
        label: 'Base URL',
        type: 'text' as const,
        required: true,
        description: 'DocuSign API base URL (e.g., https://demo.docusign.net/restapi)'
      },
      {
        key: 'environment',
        label: 'Environment',
        type: 'select' as const,
        required: true,
        options: [
          { value: 'demo', label: 'Demo' },
          { value: 'production', label: 'Production' }
        ],
        default: 'demo',
        description: 'DocuSign environment'
      }
    ]
  }

  async validateConnection(config: DocuSignConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch(`${config.baseUrl}/v2.1/accounts/${config.accountId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        return { valid: false, error: 'Invalid DocuSign credentials' }
      }

      return { valid: true }
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown validation error' 
      }
    }
  }

  async execute(input: any, config: DocuSignConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation, ...params } = input
      const baseUrl = `${config.baseUrl}/v2.1/accounts/${config.accountId}`

      const headers = {
        'Authorization': `Bearer ${config.accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }

      let result
      switch (operation) {
        case 'createEnvelope':
          result = await this.createEnvelope(params, headers, baseUrl)
          break
        case 'sendEnvelope':
          result = await this.sendEnvelope(params, headers, baseUrl)
          break
        case 'getEnvelope':
          result = await this.getEnvelope(params, headers, baseUrl)
          break
        case 'listEnvelopes':
          result = await this.listEnvelopes(params, headers, baseUrl)
          break
        case 'getEnvelopeDocuments':
          result = await this.getEnvelopeDocuments(params, headers, baseUrl)
          break
        case 'downloadDocument':
          result = await this.downloadDocument(params, headers, baseUrl)
          break
        case 'createTemplate':
          result = await this.createTemplate(params, headers, baseUrl)
          break
        case 'listTemplates':
          result = await this.listTemplates(params, headers, baseUrl)
          break
        case 'createRecipientView':
          result = await this.createRecipientView(params, headers, baseUrl)
          break
        case 'createSenderView':
          result = await this.createSenderView(params, headers, baseUrl)
          break
        case 'voidEnvelope':
          result = await this.voidEnvelope(params, headers, baseUrl)
          break
        case 'getAuditEvents':
          result = await this.getAuditEvents(params, headers, baseUrl)
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

  private async createEnvelope(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/envelopes`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        emailSubject: params.emailSubject,
        documents: params.documents,
        recipients: params.recipients,
        status: params.status || 'created',
        brandId: params.brandId,
        enforceSignerVisibility: params.enforceSignerVisibility,
        recipientLock: params.recipientLock,
        messageLock: params.messageLock,
        emailBlurb: params.emailBlurb,
        emailSettings: params.emailSettings,
        notification: params.notification,
        customFields: params.customFields
      })
    })
    return await response.json()
  }

  private async sendEnvelope(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/envelopes/${params.envelopeId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        status: 'sent'
      })
    })
    return await response.json()
  }

  private async getEnvelope(params: any, headers: any, baseUrl: string): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params.include) queryParams.append('include', params.include)
    if (params.advanced_update) queryParams.append('advanced_update', params.advanced_update)

    const response = await fetch(`${baseUrl}/envelopes/${params.envelopeId}?${queryParams}`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async listEnvelopes(params: any, headers: any, baseUrl: string): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params.from_date) queryParams.append('from_date', params.from_date)
    if (params.to_date) queryParams.append('to_date', params.to_date)
    if (params.status) queryParams.append('status', params.status)
    if (params.folder_types) queryParams.append('folder_types', params.folder_types)
    if (params.count) queryParams.append('count', params.count.toString())
    if (params.start_position) queryParams.append('start_position', params.start_position.toString())

    const response = await fetch(`${baseUrl}/envelopes?${queryParams}`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async getEnvelopeDocuments(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/envelopes/${params.envelopeId}/documents`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async downloadDocument(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/envelopes/${params.envelopeId}/documents/${params.documentId}`, {
      method: 'GET',
      headers: {
        ...headers,
        'Accept': 'application/pdf'
      }
    })
    return await response.arrayBuffer()
  }

  private async createTemplate(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/templates`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: params.name,
        description: params.description,
        shared: params.shared,
        documents: params.documents,
        recipients: params.recipients,
        customFields: params.customFields,
        notification: params.notification,
        emailSubject: params.emailSubject,
        emailBlurb: params.emailBlurb
      })
    })
    return await response.json()
  }

  private async listTemplates(params: any, headers: any, baseUrl: string): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params.count) queryParams.append('count', params.count.toString())
    if (params.start_position) queryParams.append('start_position', params.start_position.toString())
    if (params.folder_types) queryParams.append('folder_types', params.folder_types)
    if (params.shared_by_me) queryParams.append('shared_by_me', params.shared_by_me.toString())

    const response = await fetch(`${baseUrl}/templates?${queryParams}`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async createRecipientView(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/envelopes/${params.envelopeId}/views/recipient`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        authenticationMethod: params.authenticationMethod || 'none',
        email: params.email,
        userName: params.userName,
        recipientId: params.recipientId,
        returnUrl: params.returnUrl,
        clientUserId: params.clientUserId,
        pingFrequency: params.pingFrequency,
        pingUrl: params.pingUrl
      })
    })
    return await response.json()
  }

  private async createSenderView(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/envelopes/${params.envelopeId}/views/sender`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        returnUrl: params.returnUrl
      })
    })
    return await response.json()
  }

  private async voidEnvelope(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/envelopes/${params.envelopeId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        status: 'voided',
        voidedReason: params.voidedReason
      })
    })
    return await response.json()
  }

  private async getAuditEvents(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/envelopes/${params.envelopeId}/audit_events`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  getCapabilities() {
    return {
      supportsBatch: false,
      supportsStreaming: false,
      supportsFiles: true,
      maxConcurrency: 10,
      rateLimits: {
        requestsPerMinute: 1000,
        requestsPerDay: 100000
      },
      documentFeatures: {
        supportsDigitalSignatures: true,
        supportsTemplates: true,
        supportsMultipleSigners: true,
        supportsAuditTrail: true,
        supportedFormats: ['PDF', 'Word', 'PowerPoint', 'Excel'],
        maxDocumentSize: '25MB',
        maxDocumentsPerEnvelope: 250,
        maxRecipientsPerEnvelope: 250
      }
    }
  }
}