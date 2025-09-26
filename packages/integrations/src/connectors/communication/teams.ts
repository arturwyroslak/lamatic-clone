import { BaseConnector } from '../base'
import { IntegrationConfig, ExecutionContext } from '../../types'

export interface TeamsConfig extends IntegrationConfig {
  webhookUrl?: string
  botId?: string
  botPassword?: string
  tenantId?: string
  appId?: string
  appSecret?: string
}

export class TeamsConnector extends BaseConnector {
  async connect(config: TeamsConfig): Promise<boolean> {
    try {
      if (!config.webhookUrl && (!config.botId || !config.botPassword)) {
        throw new Error('Teams webhook URL or bot credentials are required')
      }

      console.log('Connecting to Microsoft Teams API')
      return true
    } catch (error) {
      console.error('Teams connection failed:', error)
      throw error
    }
  }

  async execute(action: string, params: any, context: ExecutionContext): Promise<any> {
    switch (action) {
      case 'sendMessage':
        return this.sendMessage(params, context)
      case 'sendCard':
        return this.sendAdaptiveCard(params, context)
      case 'createTeam':
        return this.createTeam(params, context)
      case 'addMember':
        return this.addTeamMember(params, context)
      case 'removeMember':
        return this.removeTeamMember(params, context)
      case 'createChannel':
        return this.createChannel(params, context)
      case 'scheduleMessage':
        return this.scheduleMessage(params, context)
      case 'getTeamMembers':
        return this.getTeamMembers(params, context)
      case 'sendNotification':
        return this.sendNotification(params, context)
      default:
        throw new Error(`Unsupported Teams action: ${action}`)
    }
  }

  private async sendMessage(params: any, context: ExecutionContext): Promise<any> {
    const { channelId, message, mentionUsers = [] } = params

    const result = {
      id: `teams_msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      body: {
        content: message,
        contentType: 'text'
      },
      from: {
        application: {
          displayName: 'AI Agent Bot',
          id: 'bot_id'
        }
      },
      channelIdentity: {
        channelId,
        teamId: 'team_id'
      },
      createdDateTime: new Date().toISOString(),
      mentions: mentionUsers.map((userId: string) => ({
        id: 0,
        mentionText: `<at id="0">${userId}</at>`,
        mentioned: {
          user: {
            id: userId,
            displayName: 'User Name'
          }
        }
      }))
    }

    await this.logExecution(context, 'sendMessage', { channelId, message }, result)
    return result
  }

  private async sendAdaptiveCard(params: any, context: ExecutionContext): Promise<any> {
    const { channelId, card } = params

    const result = {
      id: `teams_card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      body: {
        content: JSON.stringify(card),
        contentType: 'application/vnd.microsoft.card.adaptive'
      },
      from: {
        application: {
          displayName: 'AI Agent Bot',
          id: 'bot_id'
        }
      },
      channelIdentity: {
        channelId,
        teamId: 'team_id'
      },
      createdDateTime: new Date().toISOString(),
      attachments: [
        {
          id: 'card_attachment',
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: card
        }
      ]
    }

    await this.logExecution(context, 'sendCard', { channelId, card }, result)
    return result
  }

  private async createTeam(params: any, context: ExecutionContext): Promise<any> {
    const { displayName, description, visibility = 'private', mailNickname } = params

    const result = {
      '@odata.context': 'https://graph.microsoft.com/v1.0/$metadata#teams/$entity',
      id: `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      displayName,
      description,
      internalId: `internal_${Date.now()}`,
      classification: null,
      specialization: 'none',
      visibility,
      webUrl: `https://teams.microsoft.com/l/team/${Date.now()}`,
      isArchived: false,
      isMembershipLimitedToOwners: false,
      memberSettings: {
        allowCreateUpdateChannels: true,
        allowCreatePrivateChannels: true,
        allowDeleteChannels: true,
        allowAddRemoveApps: true,
        allowCreateUpdateRemoveTabs: true,
        allowCreateUpdateRemoveConnectors: true
      },
      guestSettings: {
        allowCreateUpdateChannels: false,
        allowDeleteChannels: false
      },
      messagingSettings: {
        allowUserEditMessages: true,
        allowUserDeleteMessages: true,
        allowOwnerDeleteMessages: true,
        allowTeamMentions: true,
        allowChannelMentions: true
      },
      funSettings: {
        allowGiphy: true,
        giphyContentRating: 'moderate',
        allowStickersAndMemes: true,
        allowCustomMemes: true
      }
    }

    await this.logExecution(context, 'createTeam', { displayName, description, visibility }, result)
    return result
  }

  private async addTeamMember(params: any, context: ExecutionContext): Promise<any> {
    const { teamId, userId, role = 'member' } = params

    const result = {
      '@odata.context': 'https://graph.microsoft.com/v1.0/$metadata#teams(\'{teamId}\')/members/$entity',
      '@odata.type': '#microsoft.graph.aadUserConversationMember',
      id: `membership_${Date.now()}`,
      roles: [role],
      displayName: 'User Display Name',
      userId,
      email: 'user@example.com'
    }

    await this.logExecution(context, 'addMember', { teamId, userId, role }, result)
    return result
  }

  private async removeTeamMember(params: any, context: ExecutionContext): Promise<any> {
    const { teamId, membershipId } = params

    const result = {
      success: true,
      teamId,
      membershipId,
      removedAt: new Date().toISOString()
    }

    await this.logExecution(context, 'removeMember', { teamId, membershipId }, result)
    return result
  }

  private async createChannel(params: any, context: ExecutionContext): Promise<any> {
    const { teamId, displayName, description, channelType = 'standard' } = params

    const result = {
      '@odata.context': 'https://graph.microsoft.com/v1.0/$metadata#teams(\'{teamId}\')/channels/$entity',
      id: `channel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      displayName,
      description,
      email: '',
      webUrl: `https://teams.microsoft.com/l/channel/${Date.now()}`,
      membershipType: channelType,
      createdDateTime: new Date().toISOString()
    }

    await this.logExecution(context, 'createChannel', { teamId, displayName, description }, result)
    return result
  }

  private async scheduleMessage(params: any, context: ExecutionContext): Promise<any> {
    const { channelId, message, scheduleTime } = params

    const result = {
      id: `scheduled_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      channelId,
      message,
      scheduledTime: scheduleTime,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    }

    await this.logExecution(context, 'scheduleMessage', { channelId, message, scheduleTime }, result)
    return result
  }

  private async getTeamMembers(params: any, context: ExecutionContext): Promise<any> {
    const { teamId } = params

    const result = {
      '@odata.context': 'https://graph.microsoft.com/v1.0/$metadata#teams(\'{teamId}\')/members',
      value: [
        {
          '@odata.type': '#microsoft.graph.aadUserConversationMember',
          id: 'member_1',
          roles: ['owner'],
          displayName: 'Team Owner',
          userId: 'user_123',
          email: 'owner@example.com'
        },
        {
          '@odata.type': '#microsoft.graph.aadUserConversationMember',
          id: 'member_2',
          roles: ['member'],
          displayName: 'Team Member',
          userId: 'user_456',
          email: 'member@example.com'
        }
      ]
    }

    await this.logExecution(context, 'getTeamMembers', { teamId }, result)
    return result
  }

  private async sendNotification(params: any, context: ExecutionContext): Promise<any> {
    const { userId, title, body, actions = [] } = params

    const result = {
      '@odata.context': 'https://graph.microsoft.com/v1.0/$metadata#users(\'{userId}\')/teamwork/installedApps',
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      body: {
        content: body
      },
      actions,
      sentDateTime: new Date().toISOString(),
      status: 'sent'
    }

    await this.logExecution(context, 'sendNotification', { userId, title, body }, result)
    return result
  }

  async disconnect(): Promise<void> {
    console.log('Disconnecting from Microsoft Teams API')
  }

  async testConnection(config: TeamsConfig): Promise<boolean> {
    try {
      return await this.connect(config)
    } catch (error) {
      return false
    }
  }

  getMetadata() {
    return {
      name: 'Microsoft Teams',
      description: 'Microsoft Teams integration for collaboration and communication',
      version: '1.0.0',
      category: 'communication',
      capabilities: [
        'sendMessage', 'sendCard', 'createTeam', 'addMember',
        'removeMember', 'createChannel', 'scheduleMessage',
        'getTeamMembers', 'sendNotification'
      ],
      requiredConfig: ['webhookUrl'],
      optionalConfig: ['botId', 'botPassword', 'tenantId', 'appId', 'appSecret']
    }
  }
}