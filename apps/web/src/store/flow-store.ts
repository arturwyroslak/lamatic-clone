import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Node, Edge } from '@xyflow/react'

export interface Workflow {
  id: string
  name: string
  description?: string
  version: string
  status: 'draft' | 'published' | 'archived'
  definition: {
    nodes: Node[]
    edges: Edge[]
    viewport?: { x: number; y: number; zoom: number }
  }
  metadata?: Record<string, any>
  tags: string[]
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}

export interface FlowState {
  // Current workflow
  workflow: Workflow | null
  workflows: Workflow[]
  isLoading: boolean
  error: string | null

  // Flow builder state
  nodes: Node[]
  edges: Edge[]
  selectedNode: Node | null
  viewport: { x: number; y: number; zoom: number }
  isDirty: boolean
  lastSaved?: Date

  // Execution state
  isExecuting: boolean
  executionId: string | null
  executionTrace: any[]
  executionResults: Record<string, any>

  // Actions
  setWorkflow: (workflow: Workflow) => void
  updateWorkflow: (id: string, updates: Partial<Workflow>) => Promise<void>
  createWorkflow: (data: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Workflow>
  deleteWorkflow: (id: string) => Promise<void>
  duplicateWorkflow: (id: string) => Promise<Workflow>
  publishWorkflow: (id: string) => Promise<void>
  
  // Flow builder actions
  setNodes: (nodes: Node[]) => void
  setEdges: (edges: Edge[]) => void
  addNode: (node: Node) => void
  updateNode: (id: string, updates: Partial<Node>) => void
  deleteNode: (id: string) => void
  selectNode: (node: Node | null) => void
  setViewport: (viewport: { x: number; y: number; zoom: number }) => void
  
  // Save and load
  saveWorkflow: () => Promise<void>
  loadWorkflow: (id: string) => Promise<void>
  exportWorkflow: (id: string) => Promise<string>
  importWorkflow: (data: string) => Promise<Workflow>
  
  // Execution actions
  executeWorkflow: (id: string, input?: any) => Promise<void>
  stopExecution: (executionId: string) => Promise<void>
  getExecutionTrace: (executionId: string) => Promise<any[]>
  
  // Utility actions
  resetState: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

const initialState = {
  workflow: null,
  workflows: [],
  isLoading: false,
  error: null,
  nodes: [],
  edges: [],
  selectedNode: null,
  viewport: { x: 0, y: 0, zoom: 1 },
  isDirty: false,
  lastSaved: undefined,
  isExecuting: false,
  executionId: null,
  executionTrace: [],
  executionResults: {},
}

export const useFlowStore = create<FlowState>()()
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setWorkflow: (workflow) => {
          set({ 
            workflow,
            nodes: workflow.definition.nodes || [],
            edges: workflow.definition.edges || [],
            viewport: workflow.definition.viewport || { x: 0, y: 0, zoom: 1 },
            isDirty: false
          })
        },

        updateWorkflow: async (id, updates) => {
          set({ isLoading: true })
          try {
            // API call to update workflow
            const response = await fetch('/api/graphql', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                query: `
                  mutation UpdateWorkflow($id: ID!, $input: UpdateWorkflowInput!) {
                    updateWorkflow(id: $id, input: $input) {
                      id
                      name
                      description
                      version
                      status
                      definition
                      tags
                      updatedAt
                    }
                  }
                `,
                variables: { id, input: updates }
              })
            })
            
            const data = await response.json()
            if (data.errors) throw new Error(data.errors[0].message)
            
            const updatedWorkflow = data.data.updateWorkflow
            set(state => ({
              workflow: state.workflow?.id === id ? updatedWorkflow : state.workflow,
              workflows: state.workflows.map(w => w.id === id ? updatedWorkflow : w),
              isDirty: false,
              lastSaved: new Date()
            }))
          } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Update failed' })
          } finally {
            set({ isLoading: false })
          }
        },

        createWorkflow: async (data) => {
          set({ isLoading: true })
          try {
            const response = await fetch('/api/graphql', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                query: `
                  mutation CreateWorkflow($input: CreateWorkflowInput!) {
                    createWorkflow(input: $input) {
                      id
                      name
                      description
                      version
                      status
                      definition
                      tags
                      createdAt
                      updatedAt
                    }
                  }
                `,
                variables: { input: data }
              })
            })
            
            const result = await response.json()
            if (result.errors) throw new Error(result.errors[0].message)
            
            const newWorkflow = result.data.createWorkflow
            set(state => ({
              workflows: [...state.workflows, newWorkflow],
              workflow: newWorkflow
            }))
            
            return newWorkflow
          } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Creation failed' })
            throw error
          } finally {
            set({ isLoading: false })
          }
        },

        deleteWorkflow: async (id) => {
          set({ isLoading: true })
          try {
            const response = await fetch('/api/graphql', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                query: `
                  mutation DeleteWorkflow($id: ID!) {
                    deleteWorkflow(id: $id)
                  }
                `,
                variables: { id }
              })
            })
            
            const data = await response.json()
            if (data.errors) throw new Error(data.errors[0].message)
            
            set(state => ({
              workflows: state.workflows.filter(w => w.id !== id),
              workflow: state.workflow?.id === id ? null : state.workflow
            }))
          } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Deletion failed' })
          } finally {
            set({ isLoading: false })
          }
        },

        duplicateWorkflow: async (id) => {
          const original = get().workflows.find(w => w.id === id)
          if (!original) throw new Error('Workflow not found')
          
          return get().createWorkflow({
            ...original,
            name: `${original.name} (Copy)`,
            status: 'draft',
            publishedAt: undefined
          })
        },

        publishWorkflow: async (id) => {
          await get().updateWorkflow(id, { status: 'published', publishedAt: new Date() })
        },

        setNodes: (nodes) => {
          set({ nodes, isDirty: true })
        },

        setEdges: (edges) => {
          set({ edges, isDirty: true })
        },

        addNode: (node) => {
          set(state => ({ 
            nodes: [...state.nodes, node], 
            isDirty: true 
          }))
        },

        updateNode: (id, updates) => {
          set(state => ({
            nodes: state.nodes.map(node => 
              node.id === id ? { ...node, ...updates } : node
            ),
            isDirty: true
          }))
        },

        deleteNode: (id) => {
          set(state => ({
            nodes: state.nodes.filter(node => node.id !== id),
            edges: state.edges.filter(edge => 
              edge.source !== id && edge.target !== id
            ),
            selectedNode: state.selectedNode?.id === id ? null : state.selectedNode,
            isDirty: true
          }))
        },

        selectNode: (node) => {
          set({ selectedNode: node })
        },

        setViewport: (viewport) => {
          set({ viewport, isDirty: true })
        },

        saveWorkflow: async () => {
          const state = get()
          if (!state.workflow || !state.isDirty) return
          
          await state.updateWorkflow(state.workflow.id, {
            definition: {
              nodes: state.nodes,
              edges: state.edges,
              viewport: state.viewport
            }
          })
        },

        loadWorkflow: async (id) => {
          set({ isLoading: true })
          try {
            const response = await fetch('/api/graphql', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                query: `
                  query GetWorkflow($id: ID!) {
                    workflow(id: $id) {
                      id
                      name
                      description
                      version
                      status
                      definition
                      metadata
                      tags
                      createdAt
                      updatedAt
                      publishedAt
                    }
                  }
                `,
                variables: { id }
              })
            })
            
            const data = await response.json()
            if (data.errors) throw new Error(data.errors[0].message)
            
            const workflow = data.data.workflow
            get().setWorkflow(workflow)
          } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Load failed' })
          } finally {
            set({ isLoading: false })
          }
        },

        exportWorkflow: async (id) => {
          const workflow = get().workflows.find(w => w.id === id)
          if (!workflow) throw new Error('Workflow not found')
          
          return JSON.stringify({
            ...workflow,
            exportedAt: new Date().toISOString(),
            version: '1.0.0'
          }, null, 2)
        },

        importWorkflow: async (data) => {
          try {
            const workflowData = JSON.parse(data)
            const { id, createdAt, updatedAt, ...importData } = workflowData
            
            return get().createWorkflow({
              ...importData,
              name: `${importData.name} (Imported)`,
              status: 'draft'
            })
          } catch (error) {
            throw new Error('Invalid workflow data')
          }
        },

        executeWorkflow: async (id, input = {}) => {
          set({ isExecuting: true, executionTrace: [], executionResults: {} })
          try {
            const response = await fetch('/api/graphql', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                query: `
                  mutation ExecuteWorkflow($workflowId: ID!, $input: JSON!) {
                    executeWorkflow(workflowId: $workflowId, input: $input) {
                      id
                      status
                      output
                      metadata
                    }
                  }
                `,
                variables: { workflowId: id, input }
              })
            })
            
            const data = await response.json()
            if (data.errors) throw new Error(data.errors[0].message)
            
            const execution = data.data.executeWorkflow
            set({ 
              executionId: execution.id,
              executionResults: execution.output || {},
            })
            
            // Start polling for traces
            get().pollExecutionTrace(execution.id)
          } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Execution failed' })
          }
        },

        stopExecution: async (executionId) => {
          try {
            await fetch('/api/graphql', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                query: `
                  mutation CancelExecution($id: ID!) {
                    cancelExecution(id: $id) {
                      id
                      status
                    }
                  }
                `,
                variables: { id: executionId }
              })
            })
            
            set({ isExecuting: false, executionId: null })
          } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Stop failed' })
          }
        },

        getExecutionTrace: async (executionId) => {
          try {
            const response = await fetch('/api/graphql', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                query: `
                  query GetExecution($id: ID!) {
                    execution(id: $id) {
                      id
                      status
                      steps {
                        id
                        stepId
                        name
                        status
                        input
                        output
                        error
                        duration
                        startedAt
                        completedAt
                      }
                    }
                  }
                `,
                variables: { id: executionId }
              })
            })
            
            const data = await response.json()
            if (data.errors) throw new Error(data.errors[0].message)
            
            const trace = data.data.execution?.steps || []
            set({ executionTrace: trace })
            return trace
          } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Trace fetch failed' })
            return []
          }
        },

        pollExecutionTrace: async (executionId: string) => {
          const poll = async () => {
            const state = get()
            if (!state.isExecuting || state.executionId !== executionId) return
            
            const trace = await state.getExecutionTrace(executionId)
            const isComplete = trace.some(step => 
              step.status === 'success' || step.status === 'failed'
            )
            
            if (isComplete) {
              set({ isExecuting: false })
            } else {
              setTimeout(poll, 1000) // Poll every second
            }
          }
          
          poll()
        },

        resetState: () => {
          set(initialState)
        },

        setLoading: (loading) => {
          set({ isLoading: loading })
        },

        setError: (error) => {
          set({ error })
        },
      }),
      {
        name: 'flow-store',
        partialize: (state) => ({
          workflows: state.workflows,
          viewport: state.viewport,
        })
      }
    ),
    { name: 'FlowStore' }
  )