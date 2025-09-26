import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface ZoomConfig extends ConnectionConfig {
  accountId: string
  clientId: string
  clientSecret: string
  accessToken?: string
  refreshToken?: string
  apiKey?: string
  apiSecret?: string
  authType: 'oauth' | 'jwt'
}

export class ZoomConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'zoom'
  public readonly name = 'Zoom'
  public readonly description = 'Connect to Zoom for video conferencing, meeting management, and webinars'
  public readonly category = 'video-conferencing'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'accountId',
        label: 'Account ID',
        type: 'text' as const,
        required: true,
        description: 'Zoom account ID'
      },
      {
        key: 'clientId',
        label: 'Client ID',
        type: 'text' as const,
        required: true,
        description: 'Zoom app client ID'
      },
      {
        key: 'clientSecret',
        label: 'Client Secret',
        type: 'password' as const,
        required: true,
        description: 'Zoom app client secret'
      },
      {
        key: 'accessToken',
        label: 'Access Token',
        type: 'password' as const,
        required: false,
        description: 'OAuth access token (for OAuth authentication)'
      },
      {
        key: 'refreshToken',
        label: 'Refresh Token',
        type: 'password' as const,
        required: false,
        description: 'OAuth refresh token'
      },
      {
        key: 'authType',
        label: 'Authentication Type',
        type: 'select' as const,
        required: true,
        options: [
          { value: 'oauth', label: 'OAuth 2.0' },
          { value: 'jwt', label: 'JWT (Deprecated)' }
        ],
        default: 'oauth',
        description: 'Zoom authentication method'
      }
    ]
  }

  async validateConnection(config: ZoomConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const accessToken = await this.getAccessToken(config)
      
      const response = await fetch('https://api.zoom.us/v2/users/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Zoom API returned ${response.status}: ${response.statusText}`)
      }

      return { valid: true }
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown connection error'
      }
    }
  }

  async execute(input: any, config: ZoomConfig, context: ExecutionContext): Promise<any> {
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
        case 'getMeetingRegistrants':
          return await this.getMeetingRegistrants(config, params)
        case 'addMeetingRegistrant':
          return await this.addMeetingRegistrant(config, params)
        case 'createWebinar':
          return await this.createWebinar(config, params)
        case 'getWebinar':
          return await this.getWebinar(config, params)
        case 'listWebinars':
          return await this.listWebinars(config, params)
        case 'getUser':
          return await this.getUser(config, params)
        case 'listUsers':
          return await this.listUsers(config, params)
        case 'createUser':
          return await this.createUser(config, params)
        case 'getRecordings':
          return await this.getRecordings(config, params)
        case 'getReports':
          return await this.getReports(config, params)
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

  private async getAccessToken(config: ZoomConfig): Promise<string> {
    if (config.authType === 'oauth' && config.accessToken) {
      return config.accessToken
    }

    // For server-to-server OAuth
    const response = await fetch('https://zoom.us/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'grant_type': 'account_credentials',
        'account_id': config.accountId
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.access_token
  }

  private async makeRequest(url: string, config: ZoomConfig, options: RequestInit = {}): Promise<any> {
    const accessToken = await this.getAccessToken(config)
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    if (!response.ok) {
      throw new Error(`Zoom API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  private async createMeeting(config: ZoomConfig, params: any): Promise<any> {
    const userId = params.userId || 'me'
    const meetingData = {
      topic: params.topic,
      type: params.type || 2, // Scheduled meeting
      start_time: params.startTime,
      duration: params.duration || 60,
      timezone: params.timezone || 'UTC',
      password: params.password,
      agenda: params.agenda,
      settings: {
        host_video: params.hostVideo || false,
        participant_video: params.participantVideo || false,
        join_before_host: params.joinBeforeHost || false,
        mute_upon_entry: params.muteUponEntry || true,
        watermark: params.watermark || false,
        use_pmi: params.usePmi || false,
        auto_recording: params.autoRecording || 'none',
        waiting_room: params.waitingRoom || true
      }
    }

    return this.makeRequest(`https://api.zoom.us/v2/users/${userId}/meetings`, config, {
      method: 'POST',
      body: JSON.stringify(meetingData)
    })
  }

  private async getMeeting(config: ZoomConfig, params: any): Promise<any> {
    return this.makeRequest(`https://api.zoom.us/v2/meetings/${params.meetingId}`, config)
  }

  private async updateMeeting(config: ZoomConfig, params: any): Promise<any> {
    const { meetingId, ...updateData } = params
    return this.makeRequest(`https://api.zoom.us/v2/meetings/${meetingId}`, config, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    })
  }

  private async deleteMeeting(config: ZoomConfig, params: any): Promise<any> {
    return this.makeRequest(`https://api.zoom.us/v2/meetings/${params.meetingId}`, config, {
      method: 'DELETE'
    })
  }

  private async listMeetings(config: ZoomConfig, params: any): Promise<any> {
    const userId = params.userId || 'me'
    const queryParams = new URLSearchParams({
      type: params.type || 'scheduled',
      page_size: params.pageSize?.toString() || '30',
      page_number: params.pageNumber?.toString() || '1'
    })

    return this.makeRequest(`https://api.zoom.us/v2/users/${userId}/meetings?${queryParams}`, config)
  }

  private async getMeetingRegistrants(config: ZoomConfig, params: any): Promise<any> {
    const queryParams = new URLSearchParams({
      occurrence_id: params.occurrenceId || '',
      status: params.status || 'approved',
      page_size: params.pageSize?.toString() || '30',
      page_number: params.pageNumber?.toString() || '1'
    })

    return this.makeRequest(`https://api.zoom.us/v2/meetings/${params.meetingId}/registrants?${queryParams}`, config)
  }

  private async addMeetingRegistrant(config: ZoomConfig, params: any): Promise<any> {
    const { meetingId, ...registrantData } = params
    return this.makeRequest(`https://api.zoom.us/v2/meetings/${meetingId}/registrants`, config, {
      method: 'POST',
      body: JSON.stringify(registrantData)
    })
  }

  private async createWebinar(config: ZoomConfig, params: any): Promise<any> {
    const userId = params.userId || 'me'
    const webinarData = {
      topic: params.topic,
      type: params.type || 5, // Webinar
      start_time: params.startTime,
      duration: params.duration || 60,
      timezone: params.timezone || 'UTC',
      password: params.password,
      agenda: params.agenda,
      settings: {
        host_video: params.hostVideo || false,
        panelists_video: params.panelistsVideo || false,
        practice_session: params.practiceSession || false,
        hd_video: params.hdVideo || false,
        approval_type: params.approvalType || 2,
        registration_type: params.registrationType || 1,
        audio: params.audio || 'both',
        auto_recording: params.autoRecording || 'none'
      }
    }

    return this.makeRequest(`https://api.zoom.us/v2/users/${userId}/webinars`, config, {
      method: 'POST',
      body: JSON.stringify(webinarData)
    })
  }

  private async getWebinar(config: ZoomConfig, params: any): Promise<any> {
    return this.makeRequest(`https://api.zoom.us/v2/webinars/${params.webinarId}`, config)
  }

  private async listWebinars(config: ZoomConfig, params: any): Promise<any> {
    const userId = params.userId || 'me'
    const queryParams = new URLSearchParams({
      page_size: params.pageSize?.toString() || '30',
      page_number: params.pageNumber?.toString() || '1'
    })

    return this.makeRequest(`https://api.zoom.us/v2/users/${userId}/webinars?${queryParams}`, config)
  }

  private async getUser(config: ZoomConfig, params: any): Promise<any> {
    const userId = params.userId || 'me'
    return this.makeRequest(`https://api.zoom.us/v2/users/${userId}`, config)
  }

  private async listUsers(config: ZoomConfig, params: any): Promise<any> {
    const queryParams = new URLSearchParams({
      status: params.status || 'active',
      page_size: params.pageSize?.toString() || '30',
      page_number: params.pageNumber?.toString() || '1',
      role_id: params.roleId || ''
    })

    return this.makeRequest(`https://api.zoom.us/v2/users?${queryParams}`, config)
  }

  private async createUser(config: ZoomConfig, params: any): Promise<any> {
    const userData = {
      action: params.action || 'create',
      user_info: {
        email: params.email,
        type: params.type || 1, // Basic user
        first_name: params.firstName,
        last_name: params.lastName,
        password: params.password
      }
    }

    return this.makeRequest('https://api.zoom.us/v2/users', config, {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  }

  private async getRecordings(config: ZoomConfig, params: any): Promise<any> {
    const userId = params.userId || 'me'
    const queryParams = new URLSearchParams({
      from: params.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      to: params.to || new Date().toISOString().split('T')[0],
      page_size: params.pageSize?.toString() || '30',
      page_number: params.pageNumber?.toString() || '1'
    })

    return this.makeRequest(`https://api.zoom.us/v2/users/${userId}/recordings?${queryParams}`, config)
  }

  private async getReports(config: ZoomConfig, params: any): Promise<any> {
    const { reportType, ...reportParams } = params
    const queryParams = new URLSearchParams(reportParams)

    return this.makeRequest(`https://api.zoom.us/v2/report/${reportType}?${queryParams}`, config)
  }

  getCapabilities() {
    return {
      supportsBatch: false,
      supportsStreaming: false,
      supportsFiles: false,
      maxConcurrency: 10,
      rateLimits: {
        requestsPerSecond: 10,
        requestsPerDay: 10000
      },
      videoConferencing: {
        supportsMeetings: true,
        supportsWebinars: true,
        supportsRecordings: true,
        supportsRegistration: true,
        supportsReports: true,
        maxParticipants: 1000,
        maxDuration: 1440, // 24 hours in minutes
        supportsBreakoutRooms: true,
        supportsWaitingRoom: true
      }
    }
  }
}