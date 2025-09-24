import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { Node, Edge, Connection } from '@xyflow/react'

interface FlowState {
  // Flow state
  nodes: Node[]
  edges: Edge[]
  selectedNodes: string[]
  selectedEdges: string[]
  
  // UI state
  isRunning: boolean
  hasUnsavedChanges: boolean
  zoomLevel: number
  showGrid: boolean
  isLocked: boolean
  
  // History
  history: { nodes: Node[]; edges: Edge[] }[]
  historyIndex: number
  canUndo: boolean
  canRedo: boolean
  
  // Actions
  setNodes: (nodes: Node[]) => void
  setEdges: (edges: Edge[]) => void
  addNode: (node: Node) => void
  updateNode: (id: string, data: Partial<Node>) => void
  deleteNode: (id: string) => void
  addEdge: (edge: Edge) => void
  deleteEdge: (id: string) => void
  onConnect: (connection: Connection) => void
  
  // Selection
  selectNode: (id: string) => void
  selectNodes: (ids: string[]) => void
  clearSelection: () => void
  
  // History
  undo: () => void
  redo: () => void
  saveToHistory: () => void
  
  // Flow execution
  runFlow: () => void
  stopFlow: () => void
  
  // UI actions
  setZoom: (zoom: number) => void
  toggleGrid: () => void
  toggleLock: () => void
  markUnsaved: () => void
  markSaved: () => void
}

export const useFlowStore = create<FlowState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      nodes: [],
      edges: [],
      selectedNodes: [],
      selectedEdges: [],
      
      isRunning: false,
      hasUnsavedChanges: false,
      zoomLevel: 100,
      showGrid: true,
      isLocked: false,
      
      history: [],
      historyIndex: -1,
      canUndo: false,
      canRedo: false,
      
      // Node actions
      setNodes: (nodes) => set({ nodes, hasUnsavedChanges: true }),
      
      setEdges: (edges) => set({ edges, hasUnsavedChanges: true }),
      
      addNode: (node) => set((state) => ({
        nodes: [...state.nodes, node],
        hasUnsavedChanges: true
      })),
      
      updateNode: (id, data) => set((state) => ({
        nodes: state.nodes.map(node => 
          node.id === id ? { ...node, ...data } : node
        ),
        hasUnsavedChanges: true
      })),
      
      deleteNode: (id) => set((state) => ({
        nodes: state.nodes.filter(node => node.id !== id),
        edges: state.edges.filter(edge => edge.source !== id && edge.target !== id),
        selectedNodes: state.selectedNodes.filter(nodeId => nodeId !== id),
        hasUnsavedChanges: true
      })),
      
      addEdge: (edge) => set((state) => ({
        edges: [...state.edges, edge],
        hasUnsavedChanges: true
      })),
      
      deleteEdge: (id) => set((state) => ({
        edges: state.edges.filter(edge => edge.id !== id),
        selectedEdges: state.selectedEdges.filter(edgeId => edgeId !== id),
        hasUnsavedChanges: true
      })),
      
      onConnect: (connection) => {
        const edge: Edge = {
          id: `edge-${connection.source}-${connection.target}`,
          source: connection.source!,
          target: connection.target!,
          type: 'smoothstep'
        }
        get().addEdge(edge)
      },
      
      // Selection actions
      selectNode: (id) => set({ selectedNodes: [id] }),
      
      selectNodes: (ids) => set({ selectedNodes: ids }),
      
      clearSelection: () => set({ selectedNodes: [], selectedEdges: [] }),
      
      // History actions
      saveToHistory: () => set((state) => {
        const newHistory = state.history.slice(0, state.historyIndex + 1)
        newHistory.push({ nodes: state.nodes, edges: state.edges })
        
        return {
          history: newHistory,
          historyIndex: newHistory.length - 1,
          canUndo: true,
          canRedo: false
        }
      }),
      
      undo: () => set((state) => {
        if (state.historyIndex > 0) {
          const prevState = state.history[state.historyIndex - 1]
          return {
            nodes: prevState.nodes,
            edges: prevState.edges,
            historyIndex: state.historyIndex - 1,
            canUndo: state.historyIndex - 1 > 0,
            canRedo: true,
            hasUnsavedChanges: true
          }
        }
        return state
      }),
      
      redo: () => set((state) => {
        if (state.historyIndex < state.history.length - 1) {
          const nextState = state.history[state.historyIndex + 1]
          return {
            nodes: nextState.nodes,
            edges: nextState.edges,
            historyIndex: state.historyIndex + 1,
            canUndo: true,
            canRedo: state.historyIndex + 1 < state.history.length - 1,
            hasUnsavedChanges: true
          }
        }
        return state
      }),
      
      // Flow execution
      runFlow: () => set({ isRunning: true }),
      
      stopFlow: () => set({ isRunning: false }),
      
      // UI actions
      setZoom: (zoomLevel) => set({ zoomLevel }),
      
      toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
      
      toggleLock: () => set((state) => ({ isLocked: !state.isLocked })),
      
      markUnsaved: () => set({ hasUnsavedChanges: true }),
      
      markSaved: () => set({ hasUnsavedChanges: false })
    })),
    {
      name: 'flow-store'
    }
  )
)