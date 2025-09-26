import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface GitHubConfig extends ConnectionConfig {
  accessToken: string
  apiUrl?: string
}

export class GitHubConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'github'
  public readonly name = 'GitHub'
  public readonly description = 'Connect to GitHub for repository management, issues, PRs, and workflow automation'
  public readonly category = 'developer-tools'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'accessToken',
        label: 'Personal Access Token',
        type: 'password' as const,
        required: true,
        description: 'Your GitHub Personal Access Token with appropriate scopes'
      },
      {
        key: 'apiUrl',
        label: 'API URL',
        type: 'text' as const,
        required: false,
        default: 'https://api.github.com',
        description: 'GitHub API URL (use for GitHub Enterprise)'
      }
    ]
  }

  async validateConnection(config: GitHubConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch(`${config.apiUrl || 'https://api.github.com'}/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Lamatic-AI-Agent'
        }
      })

      if (!response.ok) {
        return {
          valid: false,
          error: `GitHub API error: ${response.status} ${response.statusText}`
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

  async execute(input: any, config: GitHubConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation, owner, repo, ...params } = input
      const baseUrl = config.apiUrl || 'https://api.github.com'
      const headers = {
        'Authorization': `Bearer ${config.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Lamatic-AI-Agent',
        'Content-Type': 'application/json'
      }

      switch (operation) {
        case 'getUser': {
          const { username } = params
          const url = username ? `${baseUrl}/users/${username}` : `${baseUrl}/user`
          
          const response = await fetch(url, { method: 'GET', headers })

          if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            user: result
          }
        }

        case 'createIssue': {
          if (!owner || !repo) {
            throw new Error('Owner and repo are required')
          }

          const { title, body, labels, assignees, milestone } = params

          if (!title) {
            throw new Error('Issue title is required')
          }

          const response = await fetch(`${baseUrl}/repos/${owner}/${repo}/issues`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              title,
              body,
              labels,
              assignees,
              milestone
            })
          })

          if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            issue: result
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
      maxConcurrency: 10,
      rateLimits: {
        requestsPerMinute: 5000,
        requestsPerHour: 5000
      },
      operations: [
        'getUser',
        'createIssue'
      ]
    }
  }
}