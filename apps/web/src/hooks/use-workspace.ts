import { useState, useEffect } from 'react'

export interface Workspace {
  id: string
  name: string
  slug: string
  description?: string
  avatar?: string
  plan: 'free' | 'pro' | 'enterprise'
  createdAt: string
  updatedAt: string
  members: WorkspaceMember[]
  settings: WorkspaceSettings
}

export interface WorkspaceMember {
  id: string
  userId: string
  workspaceId: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  permissions: string[]
  user: {
    id: string
    name: string
    email: string
    avatar?: string
  }
}

export interface WorkspaceSettings {
  allowPublicWorkflows: boolean
  requireApprovalForDeployments: boolean
  enableAnalytics: boolean
  retentionDays: number
  integrationSettings: Record<string, any>
}

export function useWorkspace(workspaceId?: string) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [currentMember, setCurrentMember] = useState<WorkspaceMember | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadWorkspaces()
  }, [])

  useEffect(() => {
    if (workspaceId) {
      loadWorkspace(workspaceId)
    } else if (workspaces.length > 0) {
      // Load first workspace by default
      loadWorkspace(workspaces[0].id)
    }
  }, [workspaceId, workspaces])

  const loadWorkspaces = async () => {
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query GetWorkspaces {
              workspaces {
                id
                name
                slug
                description
                avatar
                plan
                createdAt
                updatedAt
                members {
                  id
                  role
                  permissions
                  user {
                    id
                    name
                    email
                    avatar
                  }
                }
              }
            }
          `
        })
      })
      
      const data = await response.json()
      if (data.errors) throw new Error(data.errors[0].message)
      
      setWorkspaces(data.data.workspaces || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workspaces')
    } finally {
      setIsLoading(false)
    }
  }

  const loadWorkspace = async (id: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query GetWorkspace($id: ID!) {
              workspace(id: $id) {
                id
                name
                slug
                description
                avatar
                plan
                createdAt
                updatedAt
                members {
                  id
                  role
                  permissions
                  user {
                    id
                    name
                    email
                    avatar
                  }
                }
              }
            }
          `,
          variables: { id }
        })
      })
      
      const data = await response.json()
      if (data.errors) throw new Error(data.errors[0].message)
      
      const workspaceData = data.data.workspace
      setWorkspace({
        ...workspaceData,
        settings: {
          allowPublicWorkflows: true,
          requireApprovalForDeployments: false,
          enableAnalytics: true,
          retentionDays: 30,
          integrationSettings: {}
        }
      })
      
      // Find current user's membership
      const currentUserId = localStorage.getItem('userId')
      if (currentUserId) {
        const member = workspaceData.members.find((m: WorkspaceMember) => 
          m.user.id === currentUserId
        )
        setCurrentMember(member || null)
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workspace')
    } finally {
      setIsLoading(false)
    }
  }

  const updateWorkspace = async (id: string, updates: Partial<Workspace>) => {
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation UpdateWorkspace($id: ID!, $input: UpdateWorkspaceInput!) {
              updateWorkspace(id: $id, input: $input) {
                id
                name
                slug
                description
                avatar
                updatedAt
              }
            }
          `,
          variables: { id, input: updates }
        })
      })
      
      const data = await response.json()
      if (data.errors) throw new Error(data.errors[0].message)
      
      const updatedWorkspace = data.data.updateWorkspace
      setWorkspace(prev => prev ? { ...prev, ...updatedWorkspace } : null)
      setWorkspaces(prev => prev.map(w => 
        w.id === id ? { ...w, ...updatedWorkspace } : w
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update workspace')
    }
  }

  const switchWorkspace = (id: string) => {
    const targetWorkspace = workspaces.find(w => w.id === id)
    if (targetWorkspace) {
      loadWorkspace(id)
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!currentMember) return false
    
    const rolePermissions = {
      owner: ['*'],
      admin: ['read', 'write', 'deploy', 'manage_members'],
      member: ['read', 'write', 'deploy'],
      viewer: ['read']
    }
    
    const permissions = rolePermissions[currentMember.role] || []
    return permissions.includes('*') || permissions.includes(permission)
  }

  const canManageWorkspace = (): boolean => {
    return hasPermission('*') || currentMember?.role === 'owner' || currentMember?.role === 'admin'
  }

  const canDeploy = (): boolean => {
    return hasPermission('deploy') || hasPermission('*')
  }

  const canWrite = (): boolean => {
    return hasPermission('write') || hasPermission('*')
  }

  return {
    workspace,
    workspaces,
    currentMember,
    isLoading,
    error,
    loadWorkspace,
    updateWorkspace,
    switchWorkspace,
    hasPermission,
    canManageWorkspace,
    canDeploy,
    canWrite
  }
}