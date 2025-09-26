import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface TwitterConfig extends ConnectionConfig {
  apiKey: string
  apiSecret: string
  accessToken: string
  accessTokenSecret: string
  bearerToken?: string
  version: 'v1.1' | 'v2'
}

export class TwitterConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'twitter'
  public readonly name = 'Twitter/X'
  public readonly description = 'Connect to Twitter/X for social media management, posting, and analytics'
  public readonly category = 'social-media'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'text' as const,
        required: true,
        description: 'Twitter API key (Consumer Key)'
      },
      {
        key: 'apiSecret',
        label: 'API Secret',
        type: 'password' as const,
        required: true,
        description: 'Twitter API secret (Consumer Secret)'
      },
      {
        key: 'accessToken',
        label: 'Access Token',
        type: 'password' as const,
        required: true,
        description: 'Twitter access token'
      },
      {
        key: 'accessTokenSecret',
        label: 'Access Token Secret',
        type: 'password' as const,
        required: true,
        description: 'Twitter access token secret'
      },
      {
        key: 'bearerToken',
        label: 'Bearer Token',
        type: 'password' as const,
        required: false,
        description: 'Twitter bearer token (for v2 API)'
      },
      {
        key: 'version',
        label: 'API Version',
        type: 'select' as const,
        required: true,
        options: [
          { value: 'v2', label: 'v2 (Recommended)' },
          { value: 'v1.1', label: 'v1.1 (Legacy)' }
        ],
        default: 'v2',
        description: 'Twitter API version to use'
      }
    ]
  }

  async validateConnection(config: TwitterConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      if (config.version === 'v2' && config.bearerToken) {
        const response = await fetch('https://api.twitter.com/2/users/me', {
          headers: {
            'Authorization': `Bearer ${config.bearerToken}`
          }
        })
        
        if (!response.ok) {
          throw new Error(`Twitter API v2 returned ${response.status}: ${response.statusText}`)
        }
      } else {
        // For v1.1 or OAuth 1.0a authentication
        const response = await fetch('https://api.twitter.com/1.1/account/verify_credentials.json', {
          headers: {
            'Authorization': this.generateOAuthHeader(config, 'GET', 'https://api.twitter.com/1.1/account/verify_credentials.json')
          }
        })
        
        if (!response.ok) {
          throw new Error(`Twitter API v1.1 returned ${response.status}: ${response.statusText}`)
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

  async execute(input: any, config: TwitterConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation, ...params } = input

      switch (operation) {
        case 'postTweet':
          return await this.postTweet(config, params)
        case 'deleteTweet':
          return await this.deleteTweet(config, params)
        case 'getTweet':
          return await this.getTweet(config, params)
        case 'getUserTweets':
          return await this.getUserTweets(config, params)
        case 'searchTweets':
          return await this.searchTweets(config, params)
        case 'getUser':
          return await this.getUser(config, params)
        case 'followUser':
          return await this.followUser(config, params)
        case 'unfollowUser':
          return await this.unfollowUser(config, params)
        case 'likeTweet':
          return await this.likeTweet(config, params)
        case 'unlikeTweet':
          return await this.unlikeTweet(config, params)
        case 'retweetTweet':
          return await this.retweetTweet(config, params)
        case 'getTimeline':
          return await this.getTimeline(config, params)
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

  private async makeV2Request(url: string, config: TwitterConfig, options: RequestInit = {}): Promise<any> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.bearerToken}`,
        ...options.headers
      }
    })

    if (!response.ok) {
      throw new Error(`Twitter API v2 error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  private async makeV1Request(url: string, config: TwitterConfig, method: string = 'GET', body?: any): Promise<any> {
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': this.generateOAuthHeader(config, method, url, body),
        'Content-Type': 'application/json'
      }
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(url, options)

    if (!response.ok) {
      throw new Error(`Twitter API v1.1 error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  private generateOAuthHeader(config: TwitterConfig, method: string, url: string, body?: any): string {
    // Simplified OAuth 1.0a header generation
    // In a real implementation, you would use a proper OAuth library
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const nonce = Math.random().toString(36).substring(2, 15)
    
    return `OAuth oauth_consumer_key="${config.apiKey}", oauth_token="${config.accessToken}", oauth_signature_method="HMAC-SHA1", oauth_timestamp="${timestamp}", oauth_nonce="${nonce}", oauth_version="1.0"`
  }

  private async postTweet(config: TwitterConfig, params: any): Promise<any> {
    if (config.version === 'v2') {
      return this.makeV2Request('https://api.twitter.com/2/tweets', config, {
        method: 'POST',
        body: JSON.stringify({ text: params.text })
      })
    } else {
      return this.makeV1Request('https://api.twitter.com/1.1/statuses/update.json', config, 'POST', {
        status: params.text
      })
    }
  }

  private async deleteTweet(config: TwitterConfig, params: any): Promise<any> {
    if (config.version === 'v2') {
      return this.makeV2Request(`https://api.twitter.com/2/tweets/${params.id}`, config, {
        method: 'DELETE'
      })
    } else {
      return this.makeV1Request(`https://api.twitter.com/1.1/statuses/destroy/${params.id}.json`, config, 'POST')
    }
  }

  private async getTweet(config: TwitterConfig, params: any): Promise<any> {
    if (config.version === 'v2') {
      const queryParams = new URLSearchParams({
        'tweet.fields': 'author_id,created_at,public_metrics,text'
      })
      return this.makeV2Request(`https://api.twitter.com/2/tweets/${params.id}?${queryParams}`, config)
    } else {
      return this.makeV1Request(`https://api.twitter.com/1.1/statuses/show.json?id=${params.id}`, config)
    }
  }

  private async getUserTweets(config: TwitterConfig, params: any): Promise<any> {
    if (config.version === 'v2') {
      const queryParams = new URLSearchParams({
        'tweet.fields': 'author_id,created_at,public_metrics,text',
        'max_results': params.maxResults?.toString() || '10'
      })
      return this.makeV2Request(`https://api.twitter.com/2/users/${params.userId}/tweets?${queryParams}`, config)
    } else {
      return this.makeV1Request(`https://api.twitter.com/1.1/statuses/user_timeline.json?user_id=${params.userId}&count=${params.count || 10}`, config)
    }
  }

  private async searchTweets(config: TwitterConfig, params: any): Promise<any> {
    if (config.version === 'v2') {
      const queryParams = new URLSearchParams({
        'query': params.query,
        'tweet.fields': 'author_id,created_at,public_metrics,text',
        'max_results': params.maxResults?.toString() || '10'
      })
      return this.makeV2Request(`https://api.twitter.com/2/tweets/search/recent?${queryParams}`, config)
    } else {
      return this.makeV1Request(`https://api.twitter.com/1.1/search/tweets.json?q=${encodeURIComponent(params.query)}&count=${params.count || 10}`, config)
    }
  }

  private async getUser(config: TwitterConfig, params: any): Promise<any> {
    if (config.version === 'v2') {
      const queryParams = new URLSearchParams({
        'user.fields': 'created_at,description,public_metrics,verified'
      })
      const identifier = params.username ? `by/username/${params.username}` : params.userId
      return this.makeV2Request(`https://api.twitter.com/2/users/${identifier}?${queryParams}`, config)
    } else {
      const param = params.username ? `screen_name=${params.username}` : `user_id=${params.userId}`
      return this.makeV1Request(`https://api.twitter.com/1.1/users/show.json?${param}`, config)
    }
  }

  private async followUser(config: TwitterConfig, params: any): Promise<any> {
    if (config.version === 'v2') {
      return this.makeV2Request('https://api.twitter.com/2/users/me/following', config, {
        method: 'POST',
        body: JSON.stringify({ target_user_id: params.userId })
      })
    } else {
      return this.makeV1Request('https://api.twitter.com/1.1/friendships/create.json', config, 'POST', {
        user_id: params.userId
      })
    }
  }

  private async unfollowUser(config: TwitterConfig, params: any): Promise<any> {
    if (config.version === 'v2') {
      return this.makeV2Request(`https://api.twitter.com/2/users/me/following/${params.userId}`, config, {
        method: 'DELETE'
      })
    } else {
      return this.makeV1Request('https://api.twitter.com/1.1/friendships/destroy.json', config, 'POST', {
        user_id: params.userId
      })
    }
  }

  private async likeTweet(config: TwitterConfig, params: any): Promise<any> {
    if (config.version === 'v2') {
      return this.makeV2Request('https://api.twitter.com/2/users/me/likes', config, {
        method: 'POST',
        body: JSON.stringify({ tweet_id: params.tweetId })
      })
    } else {
      return this.makeV1Request('https://api.twitter.com/1.1/favorites/create.json', config, 'POST', {
        id: params.tweetId
      })
    }
  }

  private async unlikeTweet(config: TwitterConfig, params: any): Promise<any> {
    if (config.version === 'v2') {
      return this.makeV2Request(`https://api.twitter.com/2/users/me/likes/${params.tweetId}`, config, {
        method: 'DELETE'
      })
    } else {
      return this.makeV1Request('https://api.twitter.com/1.1/favorites/destroy.json', config, 'POST', {
        id: params.tweetId
      })
    }
  }

  private async retweetTweet(config: TwitterConfig, params: any): Promise<any> {
    if (config.version === 'v2') {
      return this.makeV2Request('https://api.twitter.com/2/users/me/retweets', config, {
        method: 'POST',
        body: JSON.stringify({ tweet_id: params.tweetId })
      })
    } else {
      return this.makeV1Request(`https://api.twitter.com/1.1/statuses/retweet/${params.tweetId}.json`, config, 'POST')
    }
  }

  private async getTimeline(config: TwitterConfig, params: any): Promise<any> {
    if (config.version === 'v2') {
      const queryParams = new URLSearchParams({
        'tweet.fields': 'author_id,created_at,public_metrics,text',
        'max_results': params.maxResults?.toString() || '10'
      })
      return this.makeV2Request(`https://api.twitter.com/2/users/me/timelines/reverse_chronological?${queryParams}`, config)
    } else {
      return this.makeV1Request(`https://api.twitter.com/1.1/statuses/home_timeline.json?count=${params.count || 10}`, config)
    }
  }

  getCapabilities() {
    return {
      supportsBatch: false,
      supportsStreaming: true,
      supportsFiles: true,
      maxConcurrency: 5,
      rateLimits: {
        requestsPerMinute: 300,
        tweetsPerDay: 2400
      },
      socialMedia: {
        supportsPosting: true,
        supportsScheduling: false,
        supportsAnalytics: true,
        supportsMessaging: false,
        maxTextLength: 280,
        supportsImages: true,
        supportsVideos: true
      }
    }
  }
}