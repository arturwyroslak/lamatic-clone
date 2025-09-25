import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface SlackConfig extends ConnectionConfig {
  botToken: string
  signingSecret?: string
  defaultChannel?: string
}

export class SlackConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'slack'
  public readonly name = 'Slack'
  public readonly description = 'Connect to Slack for team communication and workflow automation'
  public readonly category = 'communication'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'botToken',
        label: 'Bot Token',
        type: 'password' as const,
        required: true,
        description: 'Slack Bot User OAuth Token (starts with xoxb-)'
      },
      {
        key: 'signingSecret',
        label: 'Signing Secret',
        type: 'password' as const,
        required: false,
        description: 'Slack app signing secret for webhook verification'
      },
      {
        key: 'defaultChannel',
        label: 'Default Channel',
        type: 'text' as const,
        required: false,
        description: 'Default channel ID or name for messages'
      }
    ]
  }

  async validateConnection(config: SlackConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch('https://slack.com/api/auth.test', {
        headers: {
          'Authorization': `Bearer ${config.botToken}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      if (!result.ok) {
        return { valid: false, error: `Slack API Error: ${result.error}` }
      }

      return { valid: true }
    } catch (error) {
      return { valid: false, error: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` }
    }
  }

  async execute(input: any, config: SlackConfig, context: ExecutionContext): Promise<any> {
    const { operation, channel, text, user, blocks, attachments } = input
    
    try {
      let result
      const targetChannel = channel || config.defaultChannel
      
      switch (operation) {
        case 'send_message':
          // Send message to channel
          const messagePayload = {
            channel: targetChannel,
            text: text,
            ...(blocks && { blocks }),
            ...(attachments && { attachments })
          }
          
          const messageResponse = await fetch('https://slack.com/api/chat.postMessage', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${config.botToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(messagePayload)
          })
          
          result = await messageResponse.json()
          break
          
        case 'get_channels':
          // List channels
          const channelsResponse = await fetch('https://slack.com/api/conversations.list', {
            headers: {
              'Authorization': `Bearer ${config.botToken}`,
              'Content-Type': 'application/json'
            }
          })
          
          result = await channelsResponse.json()
          break
          
        case 'get_users':
          // List users
          const usersResponse = await fetch('https://slack.com/api/users.list', {
            headers: {
              'Authorization': `Bearer ${config.botToken}`,
              'Content-Type': 'application/json'
            }
          })
          
          result = await usersResponse.json()
          break
          
        case 'upload_file':
          // Upload file
          const filePayload = {
            channels: targetChannel,
            title: input.title,
            filename: input.filename,
            filetype: input.filetype,
            content: input.content
          }
          
          const fileResponse = await fetch('https://slack.com/api/files.upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${config.botToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(filePayload)
          })
          
          result = await fileResponse.json()
          break
          
        case 'create_channel':
          // Create channel
          const createChannelPayload = {
            name: input.name,
            is_private: input.isPrivate || false
          }
          
          const createResponse = await fetch('https://slack.com/api/conversations.create', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${config.botToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(createChannelPayload)
          })
          
          result = await createResponse.json()
          break
          
        default:
          throw new Error(`Unsupported operation: ${operation}`)
      }
      
      if (!result.ok) {
        throw new Error(`Slack API Error: ${result.error}`)
      }
      
      return {
        success: true,
        data: result,
        operation: operation,
        channel: targetChannel,
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

  getCapabilities() {
    return {
      supportsBatch: false,
      supportsStreaming: false,
      supportsFiles: true,
      maxConcurrency: 10,
      rateLimits: {
        requestsPerMinute: 50,
        messagesPerMinute: 20
      },
      messageFeatures: {
        supportsRichText: true,
        supportsBlocks: true,
        supportsAttachments: true,
        supportsThreads: true,
        maxMessageLength: 40000
      }
    }
  }
}