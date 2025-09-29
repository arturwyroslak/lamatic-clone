import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface LinkedInConfig extends ConnectionConfig {
  clientId: string
  clientSecret: string
  accessToken: string
  refreshToken?: string
  organizationId?: string
}

export class LinkedInConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'linkedin'
  public readonly name = 'LinkedIn'
  public readonly description = 'Connect to LinkedIn for professional networking, content sharing, and business management'
  public readonly category = 'social-media'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'clientId',
        label: 'Client ID',
        type: 'text' as const,
        required: true,
        description: 'LinkedIn app client ID'
      },
      {
        key: 'clientSecret',
        label: 'Client Secret',
        type: 'password' as const,
        required: true,
        description: 'LinkedIn app client secret'
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
        key: 'organizationId',
        label: 'Organization ID',
        type: 'text' as const,
        required: false,
        description: 'LinkedIn organization ID for company pages'
      }
    ]
  }

  async validateConnection(config: LinkedInConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch('https://api.linkedin.com/v2/me', {
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      })

      if (!response.ok) {
        throw new Error(`LinkedIn API returned ${response.status}: ${response.statusText}`)
      }

      return { valid: true }
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown connection error'
      }
    }
  }

  async execute(input: any, config: LinkedInConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation, ...params } = input

      switch (operation) {
        case 'createPost':
          return await this.createPost(config, params)
        case 'getProfile':
          return await this.getProfile(config, params)
        case 'getCompanyInfo':
          return await this.getCompanyInfo(config, params)
        case 'shareContent':
          return await this.shareContent(config, params)
        case 'getConnections':
          return await this.getConnections(config, params)
        case 'sendMessage':
          return await this.sendMessage(config, params)
        case 'getCompanyUpdates':
          return await this.getCompanyUpdates(config, params)
        case 'getCompanyFollowers':
          return await this.getCompanyFollowers(config, params)
        case 'uploadMedia':
          return await this.uploadMedia(config, params)
        case 'getAnalytics':
          return await this.getAnalytics(config, params)
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

  private async makeRequest(url: string, config: LinkedInConfig, options: RequestInit = {}): Promise<any> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  private async createPost(config: LinkedInConfig, params: any): Promise<any> {
    const postData: any = {
      author: `urn:li:person:${params.authorId || 'me'}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: params.text
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    }

    if (params.media && params.media.length > 0) {
      postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'IMAGE'
      postData.specificContent['com.linkedin.ugc.ShareContent'].media = params.media.map((mediaItem: any) => ({
        status: 'READY',
        description: {
          text: mediaItem.description || ''
        },
        media: mediaItem.mediaUrn,
        title: {
          text: mediaItem.title || ''
        }
      }))
    }

    return this.makeRequest('https://api.linkedin.com/v2/ugcPosts', config, {
      method: 'POST',
      body: JSON.stringify(postData)
    })
  }

  private async getProfile(config: LinkedInConfig, params: any): Promise<any> {
    const fields = params.fields || ['id', 'firstName', 'lastName', 'headline', 'publicProfileUrl']
    const fieldsQuery = fields.join(',')
    
    return this.makeRequest(`https://api.linkedin.com/v2/people/(id:${params.personId || 'me'})?projection=(${fieldsQuery})`, config)
  }

  private async getCompanyInfo(config: LinkedInConfig, params: any): Promise<any> {
    const organizationId = params.organizationId || config.organizationId
    if (!organizationId) {
      throw new Error('Organization ID is required')
    }

    const fields = params.fields || ['id', 'name', 'description', 'website', 'industry']
    const fieldsQuery = fields.join(',')
    
    return this.makeRequest(`https://api.linkedin.com/v2/organizations/${organizationId}?projection=(${fieldsQuery})`, config)
  }

  private async shareContent(config: LinkedInConfig, params: any): Promise<any> {
    const shareData = {
      author: config.organizationId ? `urn:li:organization:${config.organizationId}` : 'urn:li:person:me',
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: params.commentary
          },
          shareMediaCategory: 'ARTICLE',
          media: [{
            status: 'READY',
            description: {
              text: params.description
            },
            originalUrl: params.url,
            title: {
              text: params.title
            }
          }]
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    }

    return this.makeRequest('https://api.linkedin.com/v2/ugcPosts', config, {
      method: 'POST',
      body: JSON.stringify(shareData)
    })
  }

  private async getConnections(config: LinkedInConfig, params: any): Promise<any> {
    const count = params.count || 50
    const start = params.start || 0
    
    return this.makeRequest(`https://api.linkedin.com/v2/connections?q=viewer&start=${start}&count=${count}`, config)
  }

  private async sendMessage(config: LinkedInConfig, params: any): Promise<any> {
    const messageData = {
      recipients: params.recipients.map((id: string) => `urn:li:person:${id}`),
      subject: params.subject,
      body: params.body
    }

    return this.makeRequest('https://api.linkedin.com/v2/messaging/conversations', config, {
      method: 'POST',
      body: JSON.stringify(messageData)
    })
  }

  private async getCompanyUpdates(config: LinkedInConfig, params: any): Promise<any> {
    const organizationId = params.organizationId || config.organizationId
    if (!organizationId) {
      throw new Error('Organization ID is required')
    }

    const count = params.count || 20
    const start = params.start || 0
    
    return this.makeRequest(`https://api.linkedin.com/v2/shares?q=owners&owners=urn:li:organization:${organizationId}&start=${start}&count=${count}`, config)
  }

  private async getCompanyFollowers(config: LinkedInConfig, params: any): Promise<any> {
    const organizationId = params.organizationId || config.organizationId
    if (!organizationId) {
      throw new Error('Organization ID is required')
    }

    return this.makeRequest(`https://api.linkedin.com/v2/networkSizes/urn:li:organization:${organizationId}?edgeType=CompanyFollowedByMember`, config)
  }

  private async uploadMedia(config: LinkedInConfig, params: any): Promise<any> {
    // First, register the upload
    const registerData = {
      registerUploadRequest: {
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
        owner: config.organizationId ? `urn:li:organization:${config.organizationId}` : 'urn:li:person:me',
        serviceRelationships: [{
          relationshipType: 'OWNER',
          identifier: 'urn:li:userGeneratedContent'
        }]
      }
    }

    const registerResponse = await this.makeRequest('https://api.linkedin.com/v2/assets?action=registerUpload', config, {
      method: 'POST',
      body: JSON.stringify(registerData)
    })

    // Upload the actual media file would require additional implementation
    // This is a simplified version that returns the upload instructions
    return {
      uploadUrl: registerResponse.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl,
      asset: registerResponse.value.asset,
      instructions: 'Use the uploadUrl to upload your media file via PUT request'
    }
  }

  private async getAnalytics(config: LinkedInConfig, params: any): Promise<any> {
    const organizationId = params.organizationId || config.organizationId
    if (!organizationId) {
      throw new Error('Organization ID is required for analytics')
    }

    const metrics = params.metrics || ['impressionCount', 'clickCount', 'likeCount', 'shareCount']
    const dateRange = params.dateRange || {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    }

    const queryParams = new URLSearchParams({
      q: 'analytics',
      pivot: 'COMPANY',
      timeGranularity: params.timeGranularity || 'DAY',
      dateRange: `${dateRange.start},${dateRange.end}`,
      metrics: metrics.join(',')
    })

    return this.makeRequest(`https://api.linkedin.com/v2/organizationalEntityShareStatistics?${queryParams}`, config)
  }

  getCapabilities() {
    return {
      supportsBatch: false,
      supportsStreaming: false,
      supportsFiles: true,
      maxConcurrency: 10,
      rateLimits: {
        requestsPerSecond: 2,
        requestsPerHour: 1000
      },
      socialMedia: {
        supportsPosting: true,
        supportsScheduling: false,
        supportsAnalytics: true,
        supportsMessaging: true,
        maxTextLength: 3000,
        supportsImages: true,
        supportsVideos: true,
        supportsCompanyPages: true
      }
    }
  }
}