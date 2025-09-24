// Developer Tools integrations for code management, CI/CD, and project management
import { BaseConnector, ConnectorConfig, ConnectorAction } from '../types'

export class GitHubConnector extends BaseConnector {
  constructor(config: ConnectorConfig) {
    super(config)
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${this.credentials.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })
      
      if (response.ok) {
        return { success: true, message: 'GitHub connection successful' }
      }
      return { success: false, message: 'Invalid GitHub token' }
    } catch (error) {
      return { success: false, message: `Connection failed: ${error.message}` }
    }
  }

  async getRepositories(): Promise<any[]> {
    const response = await fetch('https://api.github.com/user/repos', {
      headers: {
        'Authorization': `token ${this.credentials.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    return response.json()
  }

  async createIssue(repo: string, title: string, body: string, labels?: string[]): Promise<any> {
    const response = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${this.credentials.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, body, labels })
    })
    return response.json()
  }

  async createPullRequest(repo: string, title: string, head: string, base: string, body?: string): Promise<any> {
    const response = await fetch(`https://api.github.com/repos/${repo}/pulls`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${this.credentials.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, head, base, body })
    })
    return response.json()
  }

  async getCommits(repo: string, branch?: string): Promise<any[]> {
    const url = `https://api.github.com/repos/${repo}/commits${branch ? `?sha=${branch}` : ''}`
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${this.credentials.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    return response.json()
  }
}

export class LinearConnector extends BaseConnector {
  constructor(config: ConnectorConfig) {
    super(config)
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.credentials.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: '{ viewer { id name } }'
        })
      })
      
      if (response.ok) {
        return { success: true, message: 'Linear connection successful' }
      }
      return { success: false, message: 'Invalid Linear API key' }
    } catch (error) {
      return { success: false, message: `Connection failed: ${error.message}` }
    }
  }

  async createIssue(teamId: string, title: string, description?: string, priority?: number): Promise<any> {
    const mutation = `
      mutation CreateIssue($teamId: String!, $title: String!, $description: String, $priority: Int) {
        issueCreate(input: {
          teamId: $teamId
          title: $title
          description: $description
          priority: $priority
        }) {
          issue {
            id
            title
            identifier
            url
          }
        }
      }
    `
    
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: mutation,
        variables: { teamId, title, description, priority }
      })
    })
    
    const data = await response.json()
    return data.data?.issueCreate?.issue
  }

  async getTeams(): Promise<any[]> {
    const query = `
      query GetTeams {
        teams {
          nodes {
            id
            name
            key
          }
        }
      }
    `
    
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    })
    
    const data = await response.json()
    return data.data?.teams?.nodes || []
  }

  async getIssues(teamId?: string): Promise<any[]> {
    const query = `
      query GetIssues($teamId: String) {
        issues(filter: { team: { id: { eq: $teamId } } }) {
          nodes {
            id
            title
            identifier
            state {
              name
            }
            priority
            assignee {
              name
            }
            createdAt
            updatedAt
          }
        }
      }
    `
    
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        variables: { teamId }
      })
    })
    
    const data = await response.json()
    return data.data?.issues?.nodes || []
  }
}

export class JiraConnector extends BaseConnector {
  constructor(config: ConnectorConfig) {
    super(config)
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.config.baseUrl}/rest/api/3/myself`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.credentials.email}:${this.credentials.apiToken}`).toString('base64')}`,
          'Accept': 'application/json'
        }
      })
      
      if (response.ok) {
        return { success: true, message: 'Jira connection successful' }
      }
      return { success: false, message: 'Invalid Jira credentials' }
    } catch (error) {
      return { success: false, message: `Connection failed: ${error.message}` }
    }
  }

  async createIssue(projectKey: string, summary: string, description?: string, issueType = 'Task'): Promise<any> {
    const response = await fetch(`${this.config.baseUrl}/rest/api/3/issue`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${this.credentials.email}:${this.credentials.apiToken}`).toString('base64')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          project: { key: projectKey },
          summary,
          description: description ? {
            type: 'doc',
            version: 1,
            content: [{
              type: 'paragraph',
              content: [{ type: 'text', text: description }]
            }]
          } : undefined,
          issuetype: { name: issueType }
        }
      })
    })
    return response.json()
  }

  async getProjects(): Promise<any[]> {
    const response = await fetch(`${this.config.baseUrl}/rest/api/3/project`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${this.credentials.email}:${this.credentials.apiToken}`).toString('base64')}`,
        'Accept': 'application/json'
      }
    })
    return response.json()
  }

  async searchIssues(jql: string): Promise<any> {
    const response = await fetch(`${this.config.baseUrl}/rest/api/3/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${this.credentials.email}:${this.credentials.apiToken}`).toString('base64')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ jql })
    })
    return response.json()
  }
}

export class GitLabConnector extends BaseConnector {
  constructor(config: ConnectorConfig) {
    super(config)
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.config.baseUrl || 'https://gitlab.com'}/api/v4/user`, {
        headers: {
          'Authorization': `Bearer ${this.credentials.token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        return { success: true, message: 'GitLab connection successful' }
      }
      return { success: false, message: 'Invalid GitLab token' }
    } catch (error) {
      return { success: false, message: `Connection failed: ${error.message}` }
    }
  }

  async getProjects(): Promise<any[]> {
    const response = await fetch(`${this.config.baseUrl || 'https://gitlab.com'}/api/v4/projects?membership=true`, {
      headers: {
        'Authorization': `Bearer ${this.credentials.token}`,
        'Content-Type': 'application/json'
      }
    })
    return response.json()
  }

  async createIssue(projectId: string, title: string, description?: string, labels?: string[]): Promise<any> {
    const response = await fetch(`${this.config.baseUrl || 'https://gitlab.com'}/api/v4/projects/${projectId}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        description,
        labels: labels?.join(',')
      })
    })
    return response.json()
  }

  async createMergeRequest(projectId: string, sourceBranch: string, targetBranch: string, title: string, description?: string): Promise<any> {
    const response = await fetch(`${this.config.baseUrl || 'https://gitlab.com'}/api/v4/projects/${projectId}/merge_requests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source_branch: sourceBranch,
        target_branch: targetBranch,
        title,
        description
      })
    })
    return response.json()
  }
}

// Export connector configurations
export const DEVELOPER_TOOLS_INTEGRATIONS = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Git repository hosting and collaboration platform',
    category: 'Developer Tools',
    type: 'github',
    icon: 'github',
    color: '#24292e',
    authType: 'api_key',
    credentials: {
      token: { type: 'password', label: 'Personal Access Token', required: true }
    },
    actions: [
      { id: 'get_repositories', name: 'Get Repositories', description: 'List user repositories' },
      { id: 'create_issue', name: 'Create Issue', description: 'Create a new issue' },
      { id: 'create_pull_request', name: 'Create Pull Request', description: 'Create a new pull request' },
      { id: 'get_commits', name: 'Get Commits', description: 'Get repository commits' }
    ]
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Modern issue tracking and project management',
    category: 'Developer Tools',
    type: 'linear',
    icon: 'linear',
    color: '#5e6ad2',
    authType: 'api_key',
    credentials: {
      apiKey: { type: 'password', label: 'API Key', required: true }
    },
    actions: [
      { id: 'get_teams', name: 'Get Teams', description: 'List all teams' },
      { id: 'create_issue', name: 'Create Issue', description: 'Create a new issue' },
      { id: 'get_issues', name: 'Get Issues', description: 'List issues' }
    ]
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Issue and project tracking for software teams',
    category: 'Developer Tools',
    type: 'jira',
    icon: 'jira',
    color: '#0052cc',
    authType: 'basic',
    config: {
      baseUrl: { type: 'text', label: 'Jira Base URL', required: true, placeholder: 'https://yourcompany.atlassian.net' }
    },
    credentials: {
      email: { type: 'email', label: 'Email', required: true },
      apiToken: { type: 'password', label: 'API Token', required: true }
    },
    actions: [
      { id: 'get_projects', name: 'Get Projects', description: 'List all projects' },
      { id: 'create_issue', name: 'Create Issue', description: 'Create a new issue' },
      { id: 'search_issues', name: 'Search Issues', description: 'Search issues with JQL' }
    ]
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    description: 'Complete DevOps platform',
    category: 'Developer Tools',
    type: 'gitlab',
    icon: 'gitlab',
    color: '#fc6d26',
    authType: 'api_key',
    config: {
      baseUrl: { type: 'text', label: 'GitLab Base URL', required: false, placeholder: 'https://gitlab.com' }
    },
    credentials: {
      token: { type: 'password', label: 'Personal Access Token', required: true }
    },
    actions: [
      { id: 'get_projects', name: 'Get Projects', description: 'List user projects' },
      { id: 'create_issue', name: 'Create Issue', description: 'Create a new issue' },
      { id: 'create_merge_request', name: 'Create Merge Request', description: 'Create a new merge request' }
    ]
  }
]