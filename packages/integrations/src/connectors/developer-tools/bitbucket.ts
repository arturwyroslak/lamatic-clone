import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface BitbucketConfig extends ConnectionConfig {
  username: string
  appPassword: string
  workspace?: string
}

export class BitbucketConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'bitbucket'
  public readonly name = 'Bitbucket'
  public readonly description = 'Connect to Bitbucket for Git repository management and CI/CD pipelines'
  public readonly category = 'developer-tools'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'username',
        label: 'Username',
        type: 'text' as const,
        required: true,
        description: 'Your Bitbucket username'
      },
      {
        key: 'appPassword',
        label: 'App Password',
        type: 'password' as const,
        required: true,
        description: 'Your Bitbucket app password'
      },
      {
        key: 'workspace',
        label: 'Workspace',
        type: 'text' as const,
        required: false,
        description: 'Default workspace/team name (optional)'
      }
    ]
  }

  private getAuthHeader(config: BitbucketConfig): string {
    return Buffer.from(`${config.username}:${config.appPassword}`).toString('base64')
  }

  async validateConnection(config: BitbucketConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch('https://api.bitbucket.org/2.0/user', {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${this.getAuthHeader(config)}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        return {
          valid: false,
          error: `Bitbucket API error: ${response.status} ${response.statusText}`
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

  async execute(input: any, config: BitbucketConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation, ...params } = input
      const headers = {
        'Authorization': `Basic ${this.getAuthHeader(config)}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }

      switch (operation) {
        case 'getUser': {
          const response = await fetch('https://api.bitbucket.org/2.0/user', {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`Bitbucket API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            user: result
          }
        }

        case 'getWorkspaces': {
          const { pagelen = 50, page = 1 } = params

          const queryParams = new URLSearchParams({
            pagelen: pagelen.toString(),
            page: page.toString()
          })

          const response = await fetch(`https://api.bitbucket.org/2.0/workspaces?${queryParams.toString()}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`Bitbucket API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            workspaces: result.values,
            page: result.page,
            size: result.size,
            next: result.next
          }
        }

        case 'getRepositories': {
          const { workspace = config.workspace, pagelen = 50, page = 1, role, q } = params

          if (!workspace) {
            throw new Error('Workspace is required')
          }

          const queryParams = new URLSearchParams({
            pagelen: pagelen.toString(),
            page: page.toString()
          })

          if (role) queryParams.append('role', role)
          if (q) queryParams.append('q', q)

          const response = await fetch(`https://api.bitbucket.org/2.0/repositories/${workspace}?${queryParams.toString()}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`Bitbucket API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            repositories: result.values,
            page: result.page,
            size: result.size,
            next: result.next
          }
        }

        case 'getRepository': {
          const { workspace = config.workspace, repoSlug } = params

          if (!workspace || !repoSlug) {
            throw new Error('Workspace and repository slug are required')
          }

          const response = await fetch(`https://api.bitbucket.org/2.0/repositories/${workspace}/${repoSlug}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`Bitbucket API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            repository: result
          }
        }

        case 'createRepository': {
          const { 
            workspace = config.workspace, 
            name, 
            description, 
            isPrivate = true, 
            scm = 'git',
            projectKey 
          } = params

          if (!workspace || !name) {
            throw new Error('Workspace and repository name are required')
          }

          const repoData: any = {
            name,
            scm,
            is_private: isPrivate
          }

          if (description) repoData.description = description
          if (projectKey) repoData.project = { key: projectKey }

          const response = await fetch(`https://api.bitbucket.org/2.0/repositories/${workspace}/${name}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(repoData)
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Bitbucket API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            repository: result
          }
        }

        case 'getIssues': {
          const { workspace = config.workspace, repoSlug, pagelen = 50, page = 1, state, priority } = params

          if (!workspace || !repoSlug) {
            throw new Error('Workspace and repository slug are required')
          }

          const queryParams = new URLSearchParams({
            pagelen: pagelen.toString(),
            page: page.toString()
          })

          if (state) queryParams.append('state', state)
          if (priority) queryParams.append('priority', priority)

          const response = await fetch(`https://api.bitbucket.org/2.0/repositories/${workspace}/${repoSlug}/issues?${queryParams.toString()}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`Bitbucket API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            issues: result.values,
            page: result.page,
            size: result.size,
            next: result.next
          }
        }

        case 'createIssue': {
          const { workspace = config.workspace, repoSlug, title, content, priority = 'minor', kind = 'bug' } = params

          if (!workspace || !repoSlug || !title) {
            throw new Error('Workspace, repository slug, and title are required')
          }

          const issueData: any = {
            title,
            priority,
            kind
          }

          if (content) {
            issueData.content = {
              raw: content,
              markup: 'markdown'
            }
          }

          const response = await fetch(`https://api.bitbucket.org/2.0/repositories/${workspace}/${repoSlug}/issues`, {
            method: 'POST',
            headers,
            body: JSON.stringify(issueData)
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Bitbucket API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            issue: result
          }
        }

        case 'getPullRequests': {
          const { workspace = config.workspace, repoSlug, pagelen = 50, page = 1, state = 'OPEN' } = params

          if (!workspace || !repoSlug) {
            throw new Error('Workspace and repository slug are required')
          }

          const queryParams = new URLSearchParams({
            pagelen: pagelen.toString(),
            page: page.toString(),
            state
          })

          const response = await fetch(`https://api.bitbucket.org/2.0/repositories/${workspace}/${repoSlug}/pullrequests?${queryParams.toString()}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`Bitbucket API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            pullRequests: result.values,
            page: result.page,
            size: result.size,
            next: result.next
          }
        }

        case 'createPullRequest': {
          const { 
            workspace = config.workspace, 
            repoSlug, 
            title, 
            description, 
            sourceBranch, 
            destinationBranch = 'main',
            reviewers = []
          } = params

          if (!workspace || !repoSlug || !title || !sourceBranch) {
            throw new Error('Workspace, repository slug, title, and source branch are required')
          }

          const prData: any = {
            title,
            source: {
              branch: {
                name: sourceBranch
              }
            },
            destination: {
              branch: {
                name: destinationBranch
              }
            }
          }

          if (description) prData.description = description
          if (reviewers.length > 0) {
            prData.reviewers = reviewers.map((reviewer: string) => ({ uuid: reviewer }))
          }

          const response = await fetch(`https://api.bitbucket.org/2.0/repositories/${workspace}/${repoSlug}/pullrequests`, {
            method: 'POST',
            headers,
            body: JSON.stringify(prData)
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Bitbucket API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            pullRequest: result
          }
        }

        case 'getPipelines': {
          const { workspace = config.workspace, repoSlug, pagelen = 50, page = 1, target } = params

          if (!workspace || !repoSlug) {
            throw new Error('Workspace and repository slug are required')
          }

          const queryParams = new URLSearchParams({
            pagelen: pagelen.toString(),
            page: page.toString()
          })

          if (target) queryParams.append('target.ref_name', target)

          const response = await fetch(`https://api.bitbucket.org/2.0/repositories/${workspace}/${repoSlug}/pipelines?${queryParams.toString()}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`Bitbucket API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            pipelines: result.values,
            page: result.page,
            size: result.size,
            next: result.next
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
        requestsPerMinute: 1000
      },
      operations: [
        'getUser',
        'getWorkspaces',
        'getRepositories',
        'getRepository',
        'createRepository',
        'getIssues',
        'createIssue',
        'getPullRequests',
        'createPullRequest',
        'getPipelines'
      ]
    }
  }
}