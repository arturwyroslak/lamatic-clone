'use client'

import React, { useCallback, useRef, useState } from 'react'
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { NodePalette } from './node-palette'
import { FlowToolbar } from './flow-toolbar'
import { FlowNode } from './flow-node'
import { PropertyPanel } from './property-panel'
import { useFlowStore } from '@/store/flow-store'
import {
  Bot,
  Database,
  Workflow,
  MessageSquare,
  Image,
  FileText,
  Code,
  Zap,
  Filter,
  GitBranch,
  Settings
} from 'lucide-react'

// Node types based on Lamatic.ai documentation
const nodeTypes = {
  'flow-node': FlowNode,
}

const initialNodes: Node[] = [
  {
    id: 'trigger-1',
    type: 'flow-node',
    position: { x: 100, y: 100 },
    data: {
      type: 'trigger',
      title: 'Slack Message',
      description: 'Triggered when a new message is posted in Slack',
      icon: MessageSquare,
      color: 'bg-green-500',
      config: {
        channel: '#general',
        triggerOn: 'mention'
      }
    },
  },
  {
    id: 'llm-1',
    type: 'flow-node',
    position: { x: 400, y: 100 },
    data: {
      type: 'llm',
      title: 'GPT-4',
      description: 'Generate response using GPT-4',
      icon: Bot,
      color: 'bg-blue-500',
      config: {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 1000
      }
    },
  },
  {
    id: 'action-1',
    type: 'flow-node',
    position: { x: 700, y: 100 },
    data: {
      type: 'action',
      title: 'Send Response',
      description: 'Send response back to Slack',
      icon: MessageSquare,
      color: 'bg-purple-500',
      config: {
        channel: 'same',
        responseType: 'thread'
      }
    },
  },
]

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: 'trigger-1',
    target: 'llm-1',
    type: 'smoothstep',
  },
  {
    id: 'e2-3',
    source: 'llm-1',
    target: 'action-1',
    type: 'smoothstep',
  },
]

interface FlowBuilderProps {
  workflowId?: string
}

export function FlowBuilder({ workflowId }: FlowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [isPropertyPanelOpen, setIsPropertyPanelOpen] = useState(false)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { workflow, updateWorkflow } = useFlowStore()

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds))
    },
    [setEdges]
  )

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
    setIsPropertyPanelOpen(true)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
    setIsPropertyPanelOpen(false)
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
      const type = event.dataTransfer.getData('application/reactflow')
      
      if (typeof type === 'undefined' || !type || !reactFlowBounds) {
        return
      }

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      }

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type: 'flow-node',
        position,
        data: getNodeData(type),
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [setNodes]
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const getNodeData = (type: string) => {
    const nodeConfigs = {
      'slack-trigger': {
        type: 'trigger',
        title: 'Slack Trigger',
        description: 'Triggered by Slack events',
        icon: MessageSquare,
        color: 'bg-green-500',
        config: {}
      },
      'gpt-4': {
        type: 'llm',
        title: 'GPT-4',
        description: 'OpenAI GPT-4 model',
        icon: Bot,
        color: 'bg-blue-500',
        config: {}
      },
      'vector-search': {
        type: 'data',
        title: 'Vector Search',
        description: 'Search in vector database',
        icon: Database,
        color: 'bg-orange-500',
        config: {}
      },
      'image-gen': {
        type: 'llm',
        title: 'Image Generation',
        description: 'Generate images with DALL-E',
        icon: Image,
        color: 'bg-pink-500',
        config: {}
      },
      'text-processor': {
        type: 'processor',
        title: 'Text Processor',
        description: 'Process and transform text',
        icon: FileText,
        color: 'bg-yellow-500',
        config: {}
      },
      'code-executor': {
        type: 'processor',
        title: 'Code Executor',
        description: 'Execute JavaScript code',
        icon: Code,
        color: 'bg-gray-500',
        config: {}
      },
      'webhook': {
        type: 'action',
        title: 'Webhook',
        description: 'Send HTTP webhook',
        icon: Zap,
        color: 'bg-red-500',
        config: {}
      },
      'filter': {
        type: 'processor',
        title: 'Filter',
        description: 'Filter data based on conditions',
        icon: Filter,
        color: 'bg-teal-500',
        config: {}
      },
      'branch': {
        type: 'processor',
        title: 'Branch',
        description: 'Split flow into multiple paths',
        icon: GitBranch,
        color: 'bg-indigo-500',
        config: {}
      }
    }
    
    return nodeConfigs[type as keyof typeof nodeConfigs] || {
      type: 'processor',
      title: 'Unknown Node',
      description: 'Unknown node type',
      icon: Settings,
      color: 'bg-gray-500',
      config: {}
    }
  }

  const saveWorkflow = useCallback(async () => {
    if (!workflowId) return
    
    const workflowData = {
      nodes,
      edges,
      viewport: { x: 0, y: 0, zoom: 1 }
    }
    
    await updateWorkflow(workflowId, {
      definition: workflowData,
      updatedAt: new Date()
    })
  }, [nodes, edges, workflowId, updateWorkflow])

  return (
    <div className="h-full flex">
      {/* Node Palette */}
      <Card className="w-80 flex-shrink-0 border-r">
        <div className="p-4">
          <h3 className="font-semibold mb-4">Flow Components</h3>
          <ScrollArea className="h-[calc(100vh-200px)]">
            <NodePalette />
          </ScrollArea>
        </div>
      </Card>

      {/* Flow Canvas */}
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          className="bg-background"
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          <Controls />
          <MiniMap className="!bg-background !border !border-border" />
          
          {/* Flow Toolbar */}
          <Panel position="top-left">
            <FlowToolbar onSave={saveWorkflow} />
          </Panel>
          
          {/* Workflow Info */}
          <Panel position="top-center">
            <Card className="px-4 py-2">
              <div className="flex items-center gap-2">
                <Workflow className="h-4 w-4" />
                <span className="font-medium">
                  {workflow?.name || 'Untitled Workflow'}
                </span>
                <Separator orientation="vertical" className="h-4" />
                <span className="text-sm text-muted-foreground">
                  {nodes.length} nodes, {edges.length} connections
                </span>
              </div>
            </Card>
          </Panel>
        </ReactFlow>
      </div>

      {/* Property Panel */}
      {isPropertyPanelOpen && selectedNode && (
        <Card className="w-80 flex-shrink-0 border-l">
          <PropertyPanel
            node={selectedNode}
            onNodeUpdate={(updates) => {
              setNodes((nds) =>
                nds.map((node) =>
                  node.id === selectedNode.id
                    ? { ...node, data: { ...node.data, ...updates } }
                    : node
                )
              )
            }}
            onClose={() => setIsPropertyPanelOpen(false)}
          />
        </Card>
      )}
    </div>
  )
}