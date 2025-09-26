import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface WhatsAppConfig extends ConnectionConfig {
  accessToken: string
  phoneNumberId: string
  businessAccountId?: string
}

export class WhatsAppConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'whatsapp'
  public readonly name = 'WhatsApp Business'
  public readonly description = 'Connect to WhatsApp Business API for messaging and customer engagement'
  public readonly category = 'communication'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'accessToken',
        label: 'Access Token',
        type: 'password' as const,
        required: true,
        description: 'Your WhatsApp Business API access token'
      },
      {
        key: 'phoneNumberId',
        label: 'Phone Number ID',
        type: 'text' as const,
        required: true,
        description: 'Your WhatsApp Business phone number ID'
      },
      {
        key: 'businessAccountId',
        label: 'Business Account ID',
        type: 'text' as const,
        required: false,
        description: 'Your WhatsApp Business account ID (optional)'
      }
    ]
  }

  async validateConnection(config: WhatsAppConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/${config.phoneNumberId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        return {
          valid: false,
          error: `WhatsApp API error: ${response.status} ${response.statusText}`
        }
      }

      return { valid: true }
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown connection error'
      }
    }
  }

  async execute(input: any, config: WhatsAppConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation, ...params } = input
      const headers = {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json'
      }

      switch (operation) {
        case 'sendMessage': {
          const { to, type = 'text', text, template, media, location, contacts } = params

          if (!to) {
            throw new Error('Recipient phone number is required')
          }

          let messageBody: any = {
            messaging_product: 'whatsapp',
            to,
            type
          }

          switch (type) {
            case 'text':
              if (!text) {
                throw new Error('Text message content is required')
              }
              messageBody.text = { body: text }
              break

            case 'template':
              if (!template) {
                throw new Error('Template data is required')
              }
              messageBody.template = template
              break

            case 'image':
            case 'document':
            case 'audio':
            case 'video':
              if (!media) {
                throw new Error(`${type} media data is required`)
              }
              messageBody[type] = media
              break

            case 'location':
              if (!location) {
                throw new Error('Location data is required')
              }
              messageBody.location = location
              break

            case 'contacts':
              if (!contacts) {
                throw new Error('Contacts data is required')
              }
              messageBody.contacts = contacts
              break

            default:
              throw new Error(`Unsupported message type: ${type}`)
          }

          const response = await fetch(`https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`, {
            method: 'POST',
            headers,
            body: JSON.stringify(messageBody)
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`WhatsApp API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            messageId: result.messages?.[0]?.id,
            status: result.messages?.[0]?.message_status
          }
        }

        case 'markAsRead': {
          const { messageId } = params

          if (!messageId) {
            throw new Error('Message ID is required')
          }

          const response = await fetch(`https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              status: 'read',
              message_id: messageId
            })
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`WhatsApp API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result
          }
        }

        case 'getProfile': {
          const { phone } = params

          if (!phone) {
            throw new Error('Phone number is required')
          }

          const response = await fetch(`https://graph.facebook.com/v18.0/${phone}/whatsapp_business_profile`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`WhatsApp API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            profile: result.data?.[0]
          }
        }

        case 'uploadMedia': {
          const { file, type } = params

          if (!file || !type) {
            throw new Error('File and type are required')
          }

          const formData = new FormData()
          formData.append('file', file)
          formData.append('type', type)
          formData.append('messaging_product', 'whatsapp')

          const response = await fetch(`https://graph.facebook.com/v18.0/${config.phoneNumberId}/media`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${config.accessToken}`
            },
            body: formData
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`WhatsApp API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            mediaId: result.id
          }
        }

        case 'getMedia': {
          const { mediaId } = params

          if (!mediaId) {
            throw new Error('Media ID is required')
          }

          const response = await fetch(`https://graph.facebook.com/v18.0/${mediaId}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`WhatsApp API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            mediaUrl: result.url,
            mimeType: result.mime_type,
            sha256: result.sha256,
            fileSize: result.file_size
          }
        }

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

  getCapabilities() {
    return {
      supportsBatch: false,
      supportsStreaming: false,
      supportsFiles: true,
      maxConcurrency: 5,
      rateLimits: {
        requestsPerMinute: 60,
        messagesPerSecond: 20
      },
      operations: [
        'sendMessage',
        'markAsRead',
        'getProfile',
        'uploadMedia',
        'getMedia'
      ],
      messageTypes: [
        'text',
        'template',
        'image',
        'document',
        'audio',
        'video',
        'location',
        'contacts'
      ]
    }
  }
}