import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface AsanaConfig extends ConnectionConfig {
  accessToken: string
}

export class AsanaConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'asana'
  public readonly name = 'Asana'
  public readonly description = 'Connect to Asana for team project management and task tracking'
  public readonly category = 'project-management'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'accessToken',
        label: 'Access Token',
        type: 'password' as const,
        required: true,
        description: 'Your Asana personal access token'
      }
    ]
  }

  async validateConnection(config: AsanaConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch('https://app.asana.com/api/1.0/users/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        return {
          valid: false,
          error: `Asana API error: ${response.status} ${response.statusText}`
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

  async execute(input: any, config: AsanaConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation, ...params } = input
      const headers = {
        'Authorization': `Bearer ${config.accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }

      switch (operation) {
        case 'getUser': {
          const response = await fetch('https://app.asana.com/api/1.0/users/me', {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`Asana API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            user: result.data
          }
        }

        case 'getWorkspaces': {
          const { limit, offset } = params
          const queryParams = new URLSearchParams()
          if (limit) queryParams.append('limit', limit.toString())
          if (offset) queryParams.append('offset', offset.toString())

          const url = `https://app.asana.com/api/1.0/workspaces${queryParams.toString() ? '?' + queryParams.toString() : ''}`
          const response = await fetch(url, { method: 'GET', headers })

          if (!response.ok) {
            throw new Error(`Asana API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            workspaces: result.data
          }
        }

        case 'getProjects': {
          const { workspace, team, limit, offset } = params
          const queryParams = new URLSearchParams()
          if (workspace) queryParams.append('workspace', workspace)
          if (team) queryParams.append('team', team)
          if (limit) queryParams.append('limit', limit.toString())
          if (offset) queryParams.append('offset', offset.toString())

          const url = `https://app.asana.com/api/1.0/projects${queryParams.toString() ? '?' + queryParams.toString() : ''}`
          const response = await fetch(url, { method: 'GET', headers })

          if (!response.ok) {
            throw new Error(`Asana API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            projects: result.data
          }
        }

        case 'getTasks': {
          const { project, section, assignee, workspace, completed_since, modified_since, limit, offset } = params
          const queryParams = new URLSearchParams()
          
          if (project) queryParams.append('project', project)
          if (section) queryParams.append('section', section)
          if (assignee) queryParams.append('assignee', assignee)
          if (workspace) queryParams.append('workspace', workspace)
          if (completed_since) queryParams.append('completed_since', completed_since)
          if (modified_since) queryParams.append('modified_since', modified_since)
          if (limit) queryParams.append('limit', limit.toString())
          if (offset) queryParams.append('offset', offset.toString())

          const url = `https://app.asana.com/api/1.0/tasks${queryParams.toString() ? '?' + queryParams.toString() : ''}`
          const response = await fetch(url, { method: 'GET', headers })

          if (!response.ok) {
            throw new Error(`Asana API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            tasks: result.data
          }
        }

        case 'getTask': {
          const { taskId } = params

          if (!taskId) {
            throw new Error('Task ID is required')
          }

          const response = await fetch(`https://app.asana.com/api/1.0/tasks/${taskId}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`Asana API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            task: result.data
          }
        }

        case 'createTask': {
          const { data } = params

          if (!data) {
            throw new Error('Task data is required')
          }

          const response = await fetch('https://app.asana.com/api/1.0/tasks', {
            method: 'POST',
            headers,
            body: JSON.stringify({ data })
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Asana API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            task: result.data
          }
        }

        case 'updateTask': {
          const { taskId, data } = params

          if (!taskId || !data) {
            throw new Error('Task ID and data are required')
          }

          const response = await fetch(`https://app.asana.com/api/1.0/tasks/${taskId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ data })
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Asana API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            task: result.data
          }
        }

        case 'deleteTask': {
          const { taskId } = params

          if (!taskId) {
            throw new Error('Task ID is required')
          }

          const response = await fetch(`https://app.asana.com/api/1.0/tasks/${taskId}`, {
            method: 'DELETE',
            headers
          })

          if (!response.ok) {
            throw new Error(`Asana API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result
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
        requestsPerMinute: 1500
      },
      operations: [
        'getUser',
        'getWorkspaces',
        'getProjects',
        'getTasks',
        'getTask',
        'createTask',
        'updateTask',
        'deleteTask'
      ]
    }
  }
}