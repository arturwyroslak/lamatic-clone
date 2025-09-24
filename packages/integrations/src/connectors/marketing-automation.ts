// Marketing Automation integrations for email marketing, social media, and analytics
import { BaseConnector, ConnectorConfig, ConnectorAction } from '../types'

export class MailchimpConnector extends BaseConnector {
  constructor(config: ConnectorConfig) {
    super(config)
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('https://us1.api.mailchimp.com/3.0/ping', {
        headers: {
          'Authorization': `Bearer ${this.credentials.apiKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        return { success: true, message: 'Mailchimp connection successful' }
      }
      return { success: false, message: 'Invalid Mailchimp API key' }
    } catch (error) {
      return { success: false, message: `Connection failed: ${error.message}` }
    }
  }

  async getLists(): Promise<any[]> {
    const response = await fetch('https://us1.api.mailchimp.com/3.0/lists', {
      headers: {
        'Authorization': `Bearer ${this.credentials.apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    return data.lists || []
  }

  async addSubscriber(listId: string, email: string, firstName?: string, lastName?: string): Promise<any> {
    const response = await fetch(`https://us1.api.mailchimp.com/3.0/lists/${listId}/members`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email_address: email,
        status: 'subscribed',
        merge_fields: {
          FNAME: firstName || '',
          LNAME: lastName || ''
        }
      })
    })
    return response.json()
  }

  async createCampaign(listId: string, subject: string, content: string, fromName: string, fromEmail: string): Promise<any> {
    const response = await fetch('https://us1.api.mailchimp.com/3.0/campaigns', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'regular',
        recipients: { list_id: listId },
        settings: {
          subject_line: subject,
          from_name: fromName,
          reply_to: fromEmail
        }
      })
    })
    
    const campaign = await response.json()
    
    // Set campaign content
    if (campaign.id) {
      await fetch(`https://us1.api.mailchimp.com/3.0/campaigns/${campaign.id}/content`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.credentials.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          html: content
        })
      })
    }
    
    return campaign
  }

  async sendCampaign(campaignId: string): Promise<any> {
    const response = await fetch(`https://us1.api.mailchimp.com/3.0/campaigns/${campaignId}/actions/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    return response.json()
  }
}

export class SendGridConnector extends BaseConnector {
  constructor(config: ConnectorConfig) {
    super(config)
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/user/profile', {
        headers: {
          'Authorization': `Bearer ${this.credentials.apiKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        return { success: true, message: 'SendGrid connection successful' }
      }
      return { success: false, message: 'Invalid SendGrid API key' }
    } catch (error) {
      return { success: false, message: `Connection failed: ${error.message}` }
    }
  }

  async sendEmail(to: string, from: string, subject: string, content: string, isHtml = false): Promise<any> {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: from },
        subject,
        content: [{
          type: isHtml ? 'text/html' : 'text/plain',
          value: content
        }]
      })
    })
    return response.status === 202 ? { success: true } : response.json()
  }

  async createList(name: string): Promise<any> {
    const response = await fetch('https://api.sendgrid.com/v3/marketing/lists', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    })
    return response.json()
  }

  async addContacts(contacts: Array<{ email: string; first_name?: string; last_name?: string }>): Promise<any> {
    const response = await fetch('https://api.sendgrid.com/v3/marketing/contacts', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.credentials.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ contacts })
    })
    return response.json()
  }
}

export class TwitterConnector extends BaseConnector {
  constructor(config: ConnectorConfig) {
    super(config)
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('https://api.twitter.com/2/users/me', {
        headers: {
          'Authorization': `Bearer ${this.credentials.bearerToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        return { success: true, message: 'Twitter connection successful' }
      }
      return { success: false, message: 'Invalid Twitter bearer token' }
    } catch (error) {
      return { success: false, message: `Connection failed: ${error.message}` }
    }
  }

  async postTweet(text: string): Promise<any> {
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.bearerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    })
    return response.json()
  }

  async searchTweets(query: string, maxResults = 10): Promise<any> {
    const params = new URLSearchParams({
      query,
      max_results: maxResults.toString()
    })
    
    const response = await fetch(`https://api.twitter.com/2/tweets/search/recent?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.credentials.bearerToken}`,
        'Content-Type': 'application/json'
      }
    })
    return response.json()
  }

  async getUserTweets(userId: string, maxResults = 10): Promise<any> {
    const params = new URLSearchParams({
      max_results: maxResults.toString()
    })
    
    const response = await fetch(`https://api.twitter.com/2/users/${userId}/tweets?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.credentials.bearerToken}`,
        'Content-Type': 'application/json'
      }
    })
    return response.json()
  }
}

export class FacebookConnector extends BaseConnector {
  constructor(config: ConnectorConfig) {
    super(config)
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`https://graph.facebook.com/me?access_token=${this.credentials.accessToken}`)
      
      if (response.ok) {
        return { success: true, message: 'Facebook connection successful' }
      }
      return { success: false, message: 'Invalid Facebook access token' }
    } catch (error) {
      return { success: false, message: `Connection failed: ${error.message}` }
    }
  }

  async postToPage(pageId: string, message: string): Promise<any> {
    const response = await fetch(`https://graph.facebook.com/${pageId}/feed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        access_token: this.credentials.pageAccessToken
      })
    })
    return response.json()
  }

  async getPages(): Promise<any[]> {
    const response = await fetch(`https://graph.facebook.com/me/accounts?access_token=${this.credentials.accessToken}`)
    const data = await response.json()
    return data.data || []
  }

  async getPageInsights(pageId: string, metrics: string[] = ['page_impressions', 'page_engaged_users']): Promise<any> {
    const metricsParam = metrics.join(',')
    const response = await fetch(`https://graph.facebook.com/${pageId}/insights?metric=${metricsParam}&access_token=${this.credentials.pageAccessToken}`)
    return response.json()
  }
}

export class LinkedInConnector extends BaseConnector {
  constructor(config: ConnectorConfig) {
    super(config)
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('https://api.linkedin.com/v2/people/~', {
        headers: {
          'Authorization': `Bearer ${this.credentials.accessToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        return { success: true, message: 'LinkedIn connection successful' }
      }
      return { success: false, message: 'Invalid LinkedIn access token' }
    } catch (error) {
      return { success: false, message: `Connection failed: ${error.message}` }
    }
  }

  async postUpdate(text: string): Promise<any> {
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify({
        author: `urn:li:person:${this.credentials.personId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      })
    })
    return response.json()
  }

  async getProfile(): Promise<any> {
    const response = await fetch('https://api.linkedin.com/v2/people/~:(id,firstName,lastName,profilePicture(displayImage~:playableStreams))', {
      headers: {
        'Authorization': `Bearer ${this.credentials.accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    return response.json()
  }
}

export class GoogleAnalyticsConnector extends BaseConnector {
  constructor(config: ConnectorConfig) {
    super(config)
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('https://analyticsreporting.googleapis.com/v4/reports:batchGet', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.credentials.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reportRequests: [{
            viewId: this.config.viewId,
            dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
            metrics: [{ expression: 'ga:sessions' }]
          }]
        })
      })
      
      if (response.ok) {
        return { success: true, message: 'Google Analytics connection successful' }
      }
      return { success: false, message: 'Invalid Google Analytics credentials' }
    } catch (error) {
      return { success: false, message: `Connection failed: ${error.message}` }
    }
  }

  async getReport(startDate: string, endDate: string, metrics: string[], dimensions?: string[]): Promise<any> {
    const reportRequest = {
      viewId: this.config.viewId,
      dateRanges: [{ startDate, endDate }],
      metrics: metrics.map(m => ({ expression: m })),
      dimensions: dimensions?.map(d => ({ name: d }))
    }

    const response = await fetch('https://analyticsreporting.googleapis.com/v4/reports:batchGet', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reportRequests: [reportRequest] })
    })
    return response.json()
  }

  async getRealTimeData(): Promise<any> {
    const response = await fetch(`https://www.googleapis.com/analytics/v3/data/realtime?ids=ga:${this.config.viewId}&metrics=rt:activeUsers`, {
      headers: {
        'Authorization': `Bearer ${this.credentials.accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    return response.json()
  }
}

// Export connector configurations
export const MARKETING_AUTOMATION_INTEGRATIONS = [
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Email marketing and automation platform',
    category: 'Marketing',
    type: 'mailchimp',
    icon: 'mailchimp',
    color: '#ffe01b',
    authType: 'api_key',
    credentials: {
      apiKey: { type: 'password', label: 'API Key', required: true }
    },
    actions: [
      { id: 'get_lists', name: 'Get Lists', description: 'Get all mailing lists' },
      { id: 'add_subscriber', name: 'Add Subscriber', description: 'Add subscriber to list' },
      { id: 'create_campaign', name: 'Create Campaign', description: 'Create email campaign' },
      { id: 'send_campaign', name: 'Send Campaign', description: 'Send email campaign' }
    ]
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Email delivery and marketing platform',
    category: 'Marketing',
    type: 'sendgrid',
    icon: 'sendgrid',
    color: '#1a82e2',
    authType: 'api_key',
    credentials: {
      apiKey: { type: 'password', label: 'API Key', required: true }
    },
    actions: [
      { id: 'send_email', name: 'Send Email', description: 'Send transactional email' },
      { id: 'create_list', name: 'Create List', description: 'Create contact list' },
      { id: 'add_contacts', name: 'Add Contacts', description: 'Add contacts to list' }
    ]
  },
  {
    id: 'twitter',
    name: 'Twitter',
    description: 'Social media platform for real-time communication',
    category: 'Social Media',
    type: 'twitter',
    icon: 'twitter',
    color: '#1da1f2',
    authType: 'bearer_token',
    credentials: {
      bearerToken: { type: 'password', label: 'Bearer Token', required: true }
    },
    actions: [
      { id: 'post_tweet', name: 'Post Tweet', description: 'Post a new tweet' },
      { id: 'search_tweets', name: 'Search Tweets', description: 'Search for tweets' },
      { id: 'get_user_tweets', name: 'Get User Tweets', description: 'Get tweets from user' }
    ]
  },
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Social media platform for connecting people',
    category: 'Social Media',
    type: 'facebook',
    icon: 'facebook',
    color: '#1877f2',
    authType: 'oauth',
    credentials: {
      accessToken: { type: 'password', label: 'Access Token', required: true },
      pageAccessToken: { type: 'password', label: 'Page Access Token', required: false }
    },
    actions: [
      { id: 'get_pages', name: 'Get Pages', description: 'Get user pages' },
      { id: 'post_to_page', name: 'Post to Page', description: 'Post to Facebook page' },
      { id: 'get_page_insights', name: 'Get Page Insights', description: 'Get page analytics' }
    ]
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Professional networking platform',
    category: 'Social Media',
    type: 'linkedin',
    icon: 'linkedin',
    color: '#0077b5',
    authType: 'oauth',
    credentials: {
      accessToken: { type: 'password', label: 'Access Token', required: true },
      personId: { type: 'text', label: 'Person ID', required: true }
    },
    actions: [
      { id: 'get_profile', name: 'Get Profile', description: 'Get user profile' },
      { id: 'post_update', name: 'Post Update', description: 'Post status update' }
    ]
  },
  {
    id: 'google_analytics',
    name: 'Google Analytics',
    description: 'Web analytics and reporting platform',
    category: 'Analytics',
    type: 'google_analytics',
    icon: 'google-analytics',
    color: '#ff6d00',
    authType: 'oauth',
    config: {
      viewId: { type: 'text', label: 'View ID', required: true }
    },
    credentials: {
      accessToken: { type: 'password', label: 'Access Token', required: true }
    },
    actions: [
      { id: 'get_report', name: 'Get Report', description: 'Get analytics report' },
      { id: 'get_realtime_data', name: 'Get Real-time Data', description: 'Get real-time analytics' }
    ]
  }
]