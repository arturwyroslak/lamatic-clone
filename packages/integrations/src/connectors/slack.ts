import { ConnectorInstance, IntegrationConfig } from '../types'

export class SlackConnector {
  private config: IntegrationConfig
  private credentials: Record<string, any>

  constructor(config: IntegrationConfig, credentials: Record<string, any>) {
    this.config = config
    this.credentials = credentials
  }

  async test(): Promise<{ success: boolean; message?: string; details?: any }> {
    try {
      // Test Slack connection
      const response = await fetch('https://slack.com/api/auth.test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.credentials.token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (data.ok) {
        return {
          success: true,
          message: 'Successfully connected to Slack',
          details: {
            team: data.team,
            user: data.user,
            bot_id: data.bot_id
          }
        }
      } else {
        return {
          success: false,
          message: `Slack API error: ${data.error}`,
          details: data
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error
      }
    }
  }

  async sendMessage(params: {
    channel: string
    text: string
    thread_ts?: string
    blocks?: any[]
    attachments?: any[]
  }): Promise<any> {
    try {
      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.credentials.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      })

      const data = await response.json()
      
      if (!data.ok) {
        throw new Error(`Slack API error: ${data.error}`)
      }

      return data
    } catch (error) {
      throw new Error(`Failed to send Slack message: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getChannels(): Promise<any[]> {
    try {
      const response = await fetch('https://slack.com/api/conversations.list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.credentials.token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (!data.ok) {
        throw new Error(`Slack API error: ${data.error}`)
      }

      return data.channels || []
    } catch (error) {
      throw new Error(`Failed to get Slack channels: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getUsers(): Promise<any[]> {
    try {
      const response = await fetch('https://slack.com/api/users.list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.credentials.token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (!data.ok) {
        throw new Error(`Slack API error: ${data.error}`)
      }

      return data.members || []
    } catch (error) {
      throw new Error(`Failed to get Slack users: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async uploadFile(params: {
    channels: string
    file: Buffer | string
    filename: string
    title?: string
    initial_comment?: string
  }): Promise<any> {
    try {
      const formData = new FormData()
      formData.append('channels', params.channels)
      formData.append('filename', params.filename)
      
      if (params.title) formData.append('title', params.title)
      if (params.initial_comment) formData.append('initial_comment', params.initial_comment)
      
      if (typeof params.file === 'string') {
        formData.append('content', params.file)
      } else {
        formData.append('file', new Blob([params.file]), params.filename)
      }

      const response = await fetch('https://slack.com/api/files.upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.credentials.token}`
        },
        body: formData
      })

      const data = await response.json()
      
      if (!data.ok) {
        throw new Error(`Slack API error: ${data.error}`)
      }

      return data
    } catch (error) {
      throw new Error(`Failed to upload file to Slack: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async createChannel(params: {
    name: string
    is_private?: boolean
  }): Promise<any> {
    try {
      const response = await fetch('https://slack.com/api/conversations.create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.credentials.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      })

      const data = await response.json()
      
      if (!data.ok) {
        throw new Error(`Slack API error: ${data.error}`)
      }

      return data.channel
    } catch (error) {
      throw new Error(`Failed to create Slack channel: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async inviteToChannel(params: {
    channel: string
    users: string
  }): Promise<any> {
    try {
      const response = await fetch('https://slack.com/api/conversations.invite', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.credentials.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      })

      const data = await response.json()
      
      if (!data.ok) {
        throw new Error(`Slack API error: ${data.error}`)
      }

      return data
    } catch (error) {
      throw new Error(`Failed to invite users to Slack channel: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getMessageHistory(params: {
    channel: string
    latest?: string
    oldest?: string
    limit?: number
  }): Promise<any[]> {
    try {
      const queryParams = new URLSearchParams({
        channel: params.channel,
        limit: (params.limit || 100).toString()
      })
      
      if (params.latest) queryParams.append('latest', params.latest)
      if (params.oldest) queryParams.append('oldest', params.oldest)

      const response = await fetch(`https://slack.com/api/conversations.history?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.credentials.token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (!data.ok) {
        throw new Error(`Slack API error: ${data.error}`)
      }

      return data.messages || []
    } catch (error) {
      throw new Error(`Failed to get Slack message history: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async executeAction(action: string, params: Record<string, any>): Promise<any> {
    switch (action) {
      case 'sendMessage':
        return await this.sendMessage(params)
      case 'getChannels':
        return await this.getChannels()
      case 'getUsers':
        return await this.getUsers()
      case 'uploadFile':
        return await this.uploadFile(params)
      case 'createChannel':
        return await this.createChannel(params)
      case 'inviteToChannel':
        return await this.inviteToChannel(params)
      case 'getMessageHistory':
        return await this.getMessageHistory(params)
      default:
        throw new Error(`Unknown action: ${action}`)
    }
  }

  getAvailableActions(): string[] {
    return [
      'sendMessage',
      'getChannels',
      'getUsers',
      'uploadFile',
      'createChannel',
      'inviteToChannel',
      'getMessageHistory'
    ]
  }
}

// Slack integration configuration
export const slackIntegration: IntegrationConfig = {
  id: 'slack',
  name: 'Slack',
  description: 'Send messages and interact with Slack workspaces',
  category: 'communication',
  version: '1.0.0',
  icon: 'MessageSquare',
  color: '#4A154B',
  authType: 'oauth',
  website: 'https://slack.com',
  documentation: 'https://api.slack.com',
  setupInstructions: [
    'Create a new Slack app at https://api.slack.com/apps',
    'Add required OAuth scopes: chat:write, channels:read, users:read',
    'Install the app to your workspace',
    'Copy the Bot User OAuth Token'
  ],
  configSchema: {
    type: 'object',
    properties: {
      token: {
        type: 'string',
        title: 'Bot User OAuth Token',
        description: 'Your Slack bot token (starts with xoxb-)',
        required: true,
        sensitive: true
      },
      defaultChannel: {
        type: 'string',
        title: 'Default Channel',
        description: 'Default channel for messages (optional)'
      }
    }
  },
  actions: [
    {
      id: 'sendMessage',
      name: 'Send Message',
      description: 'Send a message to a Slack channel',
      inputSchema: {
        type: 'object',
        properties: {
          channel: { type: 'string', title: 'Channel', required: true },
          text: { type: 'string', title: 'Message Text', required: true },
          thread_ts: { type: 'string', title: 'Thread Timestamp (optional)' }
        }
      }
    },
    {
      id: 'getChannels',
      name: 'Get Channels',
      description: 'Retrieve list of channels',
      inputSchema: { type: 'object', properties: {} }
    },
    {
      id: 'uploadFile',
      name: 'Upload File',
      description: 'Upload a file to Slack',
      inputSchema: {
        type: 'object',
        properties: {
          channels: { type: 'string', title: 'Channel', required: true },
          filename: { type: 'string', title: 'Filename', required: true },
          file: { type: 'string', title: 'File Content', required: true }
        }
      }
    }
  ],
  triggers: [
    {
      id: 'message',
      name: 'New Message',
      description: 'Triggered when a new message is posted',
      outputSchema: {
        type: 'object',
        properties: {
          channel: { type: 'string' },
          user: { type: 'string' },
          text: { type: 'string' },
          timestamp: { type: 'string' }
        }
      }
    }
  ]
}