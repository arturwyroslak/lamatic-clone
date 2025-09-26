import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface MicrosoftTeamsConfig extends ConnectionConfig {
  tenantId: string
  clientId: string
  clientSecret: string
  accessToken: string
  refreshToken?: string
  scope?: string
}

export class MicrosoftTeamsConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'microsoft-teams'
  public readonly name = 'Microsoft Teams'
  public readonly description = 'Connect to Microsoft Teams for collaboration, meetings, and communication'
  public readonly category = 'video-conferencing'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'tenantId',
        label: 'Tenant ID',
        type: 'text' as const,
        required: true,
        description: 'Microsoft Azure tenant ID'
      },
      {
        key: 'clientId',
        label: 'Client ID',
        type: 'text' as const,
        required: true,
        description: 'Azure app client ID'
      },
      {
        key: 'clientSecret',
        label: 'Client Secret',
        type: 'password' as const,
        required: true,
        description: 'Azure app client secret'
      },
      {
        key: 'accessToken',
        label: 'Access Token',
        type: 'password' as const,
        required: true,
        description: 'OAuth 2.0 access token'
      },
      {
        key: 'refreshToken',
        label: 'Refresh Token',
        type: 'password' as const,
        required: false,
        description: 'OAuth 2.0 refresh token'
      },
      {
        key: 'scope',
        label: 'Scope',
        type: 'text' as const,
        required: false,
        description: 'OAuth scope (default: https://graph.microsoft.com/.default)',
        defaultValue: 'https://graph.microsoft.com/.default'
      }
    ]
  }

  async validateConnection(config: MicrosoftTeamsConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Microsoft Graph API returned ${response.status}: ${response.statusText}`)
      }

      return { valid: true }
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown connection error'
      }
    }
  }

  async execute(input: any, config: MicrosoftTeamsConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation, ...params } = input

      switch (operation) {
        case 'createMeeting':
          return await this.createMeeting(config, params)
        case 'getMeeting':
          return await this.getMeeting(config, params)
        case 'updateMeeting':
          return await this.updateMeeting(config, params)
        case 'deleteMeeting':
          return await this.deleteMeeting(config, params)
        case 'listMeetings':
          return await this.listMeetings(config, params)
        case 'sendMessage':
          return await this.sendMessage(config, params)
        case 'getMessages':
          return await this.getMessages(config, params)
        case 'createTeam':
          return await this.createTeam(config, params)
        case 'getTeam':
          return await this.getTeam(config, params)
        case 'listTeams':
          return await this.listTeams(config, params)
        case 'addTeamMember':
          return await this.addTeamMember(config, params)
        case 'getTeamMembers':
          return await this.getTeamMembers(config, params)
        case 'createChannel':
          return await this.createChannel(config, params)
        case 'getChannels':
          return await this.getChannels(config, params)
        case 'uploadFile':
          return await this.uploadFile(config, params)
        case 'getFiles':
          return await this.getFiles(config, params)
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

  private async makeRequest(url: string, config: MicrosoftTeamsConfig, options: RequestInit = {}): Promise<any> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    if (!response.ok) {
      throw new Error(`Microsoft Graph API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  private async createMeeting(config: MicrosoftTeamsConfig, params: any): Promise<any> {
    const meetingData = {
      subject: params.subject,
      body: {
        contentType: 'HTML',
        content: params.content || ''
      },
      start: {
        dateTime: params.startTime,
        timeZone: params.timeZone || 'UTC'
      },
      end: {
        dateTime: params.endTime,
        timeZone: params.timeZone || 'UTC'
      },
      location: {
        displayName: params.location || 'Microsoft Teams Meeting'
      },
      attendees: params.attendees?.map((email: string) => ({
        emailAddress: {
          address: email,
          name: email
        },
        type: 'required'
      })) || [],
      isOnlineMeeting: true,
      onlineMeetingProvider: 'teamsForBusiness'
    }

    return this.makeRequest('https://graph.microsoft.com/v1.0/me/events', config, {
      method: 'POST',
      body: JSON.stringify(meetingData)
    })
  }

  private async getMeeting(config: MicrosoftTeamsConfig, params: any): Promise<any> {
    return this.makeRequest(`https://graph.microsoft.com/v1.0/me/events/${params.eventId}`, config)
  }

  private async updateMeeting(config: MicrosoftTeamsConfig, params: any): Promise<any> {
    const { eventId, ...updateData } = params
    return this.makeRequest(`https://graph.microsoft.com/v1.0/me/events/${eventId}`, config, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    })
  }

  private async deleteMeeting(config: MicrosoftTeamsConfig, params: any): Promise<any> {
    return this.makeRequest(`https://graph.microsoft.com/v1.0/me/events/${params.eventId}`, config, {
      method: 'DELETE'
    })
  }

  private async listMeetings(config: MicrosoftTeamsConfig, params: any): Promise<any> {
    const queryParams = new URLSearchParams({
      '$top': params.top?.toString() || '50',
      '$skip': params.skip?.toString() || '0',
      '$filter': params.filter || `start/dateTime ge '${new Date().toISOString()}'`,
      '$orderby': params.orderBy || 'start/dateTime'
    })

    return this.makeRequest(`https://graph.microsoft.com/v1.0/me/events?${queryParams}`, config)
  }

  private async sendMessage(config: MicrosoftTeamsConfig, params: any): Promise<any> {
    const { teamId, channelId, ...messageData } = params
    
    const message = {
      body: {
        contentType: params.contentType || 'text',
        content: params.content
      },
      importance: params.importance || 'normal',
      attachments: params.attachments || []
    }

    return this.makeRequest(`https://graph.microsoft.com/v1.0/teams/${teamId}/channels/${channelId}/messages`, config, {
      method: 'POST',
      body: JSON.stringify(message)
    })
  }

  private async getMessages(config: MicrosoftTeamsConfig, params: any): Promise<any> {
    const { teamId, channelId } = params
    const queryParams = new URLSearchParams({
      '$top': params.top?.toString() || '50',
      '$skip': params.skip?.toString() || '0'
    })

    return this.makeRequest(`https://graph.microsoft.com/v1.0/teams/${teamId}/channels/${channelId}/messages?${queryParams}`, config)
  }

  private async createTeam(config: MicrosoftTeamsConfig, params: any): Promise<any> {
    const teamData = {
      'template@odata.bind': "https://graph.microsoft.com/v1.0/teamsTemplates('standard')",
      displayName: params.displayName,
      description: params.description,
      visibility: params.visibility || 'private',
      members: params.members?.map((member: any) => ({
        '@odata.type': '#microsoft.graph.aadUserConversationMember',
        'user@odata.bind': `https://graph.microsoft.com/v1.0/users('${member.userId}')`,
        roles: member.roles || ['member']
      })) || []
    }

    return this.makeRequest('https://graph.microsoft.com/v1.0/teams', config, {
      method: 'POST',
      body: JSON.stringify(teamData)
    })
  }

  private async getTeam(config: MicrosoftTeamsConfig, params: any): Promise<any> {
    return this.makeRequest(`https://graph.microsoft.com/v1.0/teams/${params.teamId}`, config)
  }

  private async listTeams(config: MicrosoftTeamsConfig, params: any): Promise<any> {
    const queryParams = new URLSearchParams({
      '$top': params.top?.toString() || '50',
      '$skip': params.skip?.toString() || '0'
    })

    return this.makeRequest(`https://graph.microsoft.com/v1.0/me/joinedTeams?${queryParams}`, config)
  }

  private async addTeamMember(config: MicrosoftTeamsConfig, params: any): Promise<any> {
    const { teamId, ...memberData } = params
    
    const member = {
      '@odata.type': '#microsoft.graph.aadUserConversationMember',
      'user@odata.bind': `https://graph.microsoft.com/v1.0/users('${memberData.userId}')`,
      roles: memberData.roles || ['member']
    }

    return this.makeRequest(`https://graph.microsoft.com/v1.0/teams/${teamId}/members`, config, {
      method: 'POST',
      body: JSON.stringify(member)
    })
  }

  private async getTeamMembers(config: MicrosoftTeamsConfig, params: any): Promise<any> {
    const queryParams = new URLSearchParams({
      '$top': params.top?.toString() || '50',
      '$skip': params.skip?.toString() || '0'
    })

    return this.makeRequest(`https://graph.microsoft.com/v1.0/teams/${params.teamId}/members?${queryParams}`, config)
  }

  private async createChannel(config: MicrosoftTeamsConfig, params: any): Promise<any> {
    const { teamId, ...channelData } = params
    
    const channel = {
      displayName: channelData.displayName,
      description: channelData.description,
      membershipType: channelData.membershipType || 'standard'
    }

    return this.makeRequest(`https://graph.microsoft.com/v1.0/teams/${teamId}/channels`, config, {
      method: 'POST',
      body: JSON.stringify(channel)
    })
  }

  private async getChannels(config: MicrosoftTeamsConfig, params: any): Promise<any> {
    return this.makeRequest(`https://graph.microsoft.com/v1.0/teams/${params.teamId}/channels`, config)
  }

  private async uploadFile(config: MicrosoftTeamsConfig, params: any): Promise<any> {
    const { teamId, channelId, fileName, fileContent } = params
    
    // This is a simplified version - actual file upload requires more complex handling
    return this.makeRequest(`https://graph.microsoft.com/v1.0/teams/${teamId}/channels/${channelId}/filesFolder/children/${fileName}/content`, config, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream'
      },
      body: fileContent
    })
  }

  private async getFiles(config: MicrosoftTeamsConfig, params: any): Promise<any> {
    const { teamId, channelId } = params
    const queryParams = new URLSearchParams({
      '$top': params.top?.toString() || '50',
      '$skip': params.skip?.toString() || '0'
    })

    return this.makeRequest(`https://graph.microsoft.com/v1.0/teams/${teamId}/channels/${channelId}/filesFolder/children?${queryParams}`, config)
  }

  getCapabilities() {
    return {
      supportsBatch: true,
      supportsStreaming: false,
      supportsFiles: true,
      maxConcurrency: 15,
      rateLimits: {
        requestsPerSecond: 10,
        requestsPerMinute: 600,
        requestsPerHour: 12000
      },
      videoConferencing: {
        supportsMeetings: true,
        supportsWebinars: false,
        supportsRecordings: true,
        supportsRegistration: false,
        supportsReports: false,
        maxParticipants: 1000,
        maxDuration: 1440, // 24 hours in minutes
        supportsBreakoutRooms: true,
        supportsWaitingRoom: true
      },
      collaboration: {
        supportsTeams: true,
        supportsChannels: true,
        supportsChat: true,
        supportsFileSharing: true,
        supportsScreenSharing: true
      }
    }
  }
}