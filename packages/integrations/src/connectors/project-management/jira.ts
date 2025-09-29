import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface JiraConfig extends ConnectionConfig {
  baseUrl: string
  email: string
  apiToken: string
}

export class JiraConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'jira'
  public readonly name = 'Jira'
  public readonly description = 'Connect to Atlassian Jira for issue tracking and project management'
  public readonly category = 'project-management'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'baseUrl',
        label: 'Base URL',
        type: 'text' as const,
        required: true,
        description: 'Your Jira instance URL (e.g., https://company.atlassian.net)'
      },
      {
        key: 'email',
        label: 'Email',
        type: 'text' as const,
        required: true,
        description: 'Your Jira account email'
      },
      {
        key: 'apiToken',
        label: 'API Token',
        type: 'password' as const,
        required: true,
        description: 'Your Jira API token'
      }
    ]
  }

  async validateConnection(config: JiraConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64')
      const response = await fetch(`${config.baseUrl}/rest/api/3/myself`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        return {
          valid: false,
          error: `Jira API error: ${response.status} ${response.statusText}`
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

  async execute(input: any, config: JiraConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation, ...params } = input
      const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64')
      const headers = {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }

      switch (operation) {
        case 'getProjects': {
          const { expand, recent, properties } = params
          const queryParams = new URLSearchParams()
          if (expand) queryParams.append('expand', expand)
          if (recent !== undefined) queryParams.append('recent', recent.toString())
          if (properties) queryParams.append('properties', properties)

          const url = `${config.baseUrl}/rest/api/3/project${queryParams.toString() ? '?' + queryParams.toString() : ''}`
          const response = await fetch(url, { method: 'GET', headers })

          if (!response.ok) {
            throw new Error(`Jira API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            projects: result
          }
        }

        case 'searchIssues': {
          const { jql, startAt = 0, maxResults = 50, fields, expand } = params

          if (!jql) {
            throw new Error('JQL query is required')
          }

          const requestBody = {
            jql,
            startAt,
            maxResults,
            fields,
            expand
          }

          const response = await fetch(`${config.baseUrl}/rest/api/3/search`, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody)
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Jira API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            issues: result.issues,
            total: result.total,
            startAt: result.startAt,
            maxResults: result.maxResults
          }
        }

        case 'getIssue': {
          const { issueIdOrKey, fields, expand, properties } = params

          if (!issueIdOrKey) {
            throw new Error('Issue ID or key is required')
          }

          const queryParams = new URLSearchParams()
          if (fields) queryParams.append('fields', fields)
          if (expand) queryParams.append('expand', expand)
          if (properties) queryParams.append('properties', properties)

          const url = `${config.baseUrl}/rest/api/3/issue/${issueIdOrKey}${queryParams.toString() ? '?' + queryParams.toString() : ''}`
          const response = await fetch(url, { method: 'GET', headers })

          if (!response.ok) {
            throw new Error(`Jira API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            issue: result
          }
        }

        case 'createIssue': {
          const { fields } = params

          if (!fields) {
            throw new Error('Issue fields are required')
          }

          const requestBody = { fields }

          const response = await fetch(`${config.baseUrl}/rest/api/3/issue`, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody)
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Jira API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            issue: result
          }
        }

        case 'updateIssue': {
          const { issueIdOrKey, fields, update } = params

          if (!issueIdOrKey) {
            throw new Error('Issue ID or key is required')
          }

          const requestBody: any = {}
          if (fields) requestBody.fields = fields
          if (update) requestBody.update = update

          const response = await fetch(`${config.baseUrl}/rest/api/3/issue/${issueIdOrKey}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(requestBody)
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Jira API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          return {
            success: true,
            message: 'Issue updated successfully'
          }
        }

        case 'addComment': {
          const { issueIdOrKey, body, visibility } = params

          if (!issueIdOrKey || !body) {
            throw new Error('Issue ID/key and comment body are required')
          }

          const requestBody: any = {
            body: {
              type: 'doc',
              version: 1,
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: body
                    }
                  ]
                }
              ]
            }
          }

          if (visibility) requestBody.visibility = visibility

          const response = await fetch(`${config.baseUrl}/rest/api/3/issue/${issueIdOrKey}/comment`, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody)
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Jira API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            comment: result
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
        requestsPerMinute: 300
      },
      operations: [
        'getProjects',
        'searchIssues',
        'getIssue',
        'createIssue',
        'updateIssue',
        'addComment'
      ]
    }
  }
}