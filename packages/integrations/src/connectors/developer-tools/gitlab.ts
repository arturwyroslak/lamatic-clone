import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface GitLabConfig extends ConnectionConfig {
  accessToken: string
  baseUrl?: string
}

export class GitLabConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'gitlab'
  public readonly name = 'GitLab'
  public readonly description = 'Connect to GitLab for repository management, CI/CD, and DevOps workflows'
  public readonly category = 'developer-tools'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'accessToken',
        label: 'Access Token',
        type: 'password' as const,
        required: true,
        description: 'Your GitLab personal access token'
      },
      {
        key: 'baseUrl',
        label: 'Base URL',
        type: 'text' as const,
        required: false,
        default: 'https://gitlab.com',
        description: 'GitLab instance URL (for self-hosted GitLab)'
      }
    ]
  }

  async validateConnection(config: GitLabConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const baseUrl = config.baseUrl || 'https://gitlab.com'
      const response = await fetch(`${baseUrl}/api/v4/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        return {
          valid: false,
          error: `GitLab API error: ${response.status} ${response.statusText}`
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

  async execute(input: any, config: GitLabConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation, ...params } = input
      const baseUrl = config.baseUrl || 'https://gitlab.com'
      const headers = {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json'
      }

      switch (operation) {
        case 'getUser': {
          const response = await fetch(`${baseUrl}/api/v4/user`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`GitLab API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            user: result
          }
        }

        case 'getProjects': {
          const { 
            owned = false, 
            membership = false, 
            starred = false, 
            simple = false,
            per_page = 20,
            page = 1,
            order_by = 'created_at',
            sort = 'desc'
          } = params

          const queryParams = new URLSearchParams({
            per_page: per_page.toString(),
            page: page.toString(),
            order_by,
            sort
          })

          if (owned) queryParams.append('owned', 'true')
          if (membership) queryParams.append('membership', 'true')
          if (starred) queryParams.append('starred', 'true')
          if (simple) queryParams.append('simple', 'true')

          const response = await fetch(`${baseUrl}/api/v4/projects?${queryParams.toString()}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`GitLab API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            projects: result
          }
        }

        case 'getProject': {
          const { projectId } = params

          if (!projectId) {
            throw new Error('Project ID is required')
          }

          const response = await fetch(`${baseUrl}/api/v4/projects/${encodeURIComponent(projectId)}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`GitLab API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            project: result
          }
        }

        case 'getIssues': {
          const { 
            projectId,
            state = 'opened',
            labels,
            milestone,
            assignee_id,
            author_id,
            per_page = 20,
            page = 1
          } = params

          const queryParams = new URLSearchParams({
            state,
            per_page: per_page.toString(),
            page: page.toString()
          })

          if (labels) queryParams.append('labels', labels)
          if (milestone) queryParams.append('milestone', milestone)
          if (assignee_id) queryParams.append('assignee_id', assignee_id.toString())
          if (author_id) queryParams.append('author_id', author_id.toString())

          const endpoint = projectId 
            ? `${baseUrl}/api/v4/projects/${encodeURIComponent(projectId)}/issues`
            : `${baseUrl}/api/v4/issues`

          const response = await fetch(`${endpoint}?${queryParams.toString()}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`GitLab API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            issues: result
          }
        }

        case 'createIssue': {
          const { projectId, title, description, labels, milestone_id, assignee_ids } = params

          if (!projectId || !title) {
            throw new Error('Project ID and title are required')
          }

          const requestBody = {
            title,
            description,
            labels,
            milestone_id,
            assignee_ids
          }

          const response = await fetch(`${baseUrl}/api/v4/projects/${encodeURIComponent(projectId)}/issues`, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody)
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`GitLab API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            issue: result
          }
        }

        case 'getMergeRequests': {
          const { 
            projectId,
            state = 'opened',
            target_branch,
            source_branch,
            author_id,
            assignee_id,
            per_page = 20,
            page = 1
          } = params

          const queryParams = new URLSearchParams({
            state,
            per_page: per_page.toString(),
            page: page.toString()
          })

          if (target_branch) queryParams.append('target_branch', target_branch)
          if (source_branch) queryParams.append('source_branch', source_branch)
          if (author_id) queryParams.append('author_id', author_id.toString())
          if (assignee_id) queryParams.append('assignee_id', assignee_id.toString())

          const endpoint = projectId 
            ? `${baseUrl}/api/v4/projects/${encodeURIComponent(projectId)}/merge_requests`
            : `${baseUrl}/api/v4/merge_requests`

          const response = await fetch(`${endpoint}?${queryParams.toString()}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`GitLab API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            mergeRequests: result
          }
        }

        case 'createMergeRequest': {
          const { 
            projectId, 
            title, 
            description, 
            source_branch, 
            target_branch = 'main',
            assignee_id,
            milestone_id,
            labels,
            remove_source_branch = false
          } = params

          if (!projectId || !title || !source_branch) {
            throw new Error('Project ID, title, and source branch are required')
          }

          const requestBody = {
            title,
            description,
            source_branch,
            target_branch,
            assignee_id,
            milestone_id,
            labels,
            remove_source_branch
          }

          const response = await fetch(`${baseUrl}/api/v4/projects/${encodeURIComponent(projectId)}/merge_requests`, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody)
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`GitLab API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            mergeRequest: result
          }
        }

        case 'getPipelines': {
          const { projectId, status, ref, per_page = 20, page = 1 } = params

          if (!projectId) {
            throw new Error('Project ID is required')
          }

          const queryParams = new URLSearchParams({
            per_page: per_page.toString(),
            page: page.toString()
          })

          if (status) queryParams.append('status', status)
          if (ref) queryParams.append('ref', ref)

          const response = await fetch(`${baseUrl}/api/v4/projects/${encodeURIComponent(projectId)}/pipelines?${queryParams.toString()}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`GitLab API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            pipelines: result
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
        requestsPerMinute: 2000
      },
      operations: [
        'getUser',
        'getProjects',
        'getProject',
        'getIssues',
        'createIssue',
        'getMergeRequests',
        'createMergeRequest',
        'getPipelines'
      ]
    }
  }
}