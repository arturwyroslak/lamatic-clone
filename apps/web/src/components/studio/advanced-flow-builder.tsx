'use client'

import React, { useCallback, useState, useRef, useEffect } from 'react'
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
  NodeTypes,
  EdgeTypes,
  MarkerType,
  useReactFlow
} from '@xyflow/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Play, 
  Pause, 
  Save, 
  Download, 
  Upload, 
  Zap, 
  Database, 
  MessageSquare, 
  Settings,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Workflow
} from 'lucide-react'
import { FlowNode } from './flow-node'
import { CustomEdge } from './custom-edge'

// Enhanced node types with full Lamatic.ai functionality
const nodeTypes: NodeTypes = {
  'ai-model': FlowNode,
  'data-source': FlowNode,
  'processor': FlowNode,
  'condition': FlowNode,
  'webhook': FlowNode,
  'api-call': FlowNode,
  'transformer': FlowNode,
  'output': FlowNode
}

const edgeTypes: EdgeTypes = {
  'custom': CustomEdge
}

// Predefined node templates matching Lamatic.ai's components
const nodeTemplates = [
  {
    type: 'ai-model',
    category: 'AI Models',
    items: [
      {
        id: 'openai-gpt4',
        label: 'OpenAI GPT-4',
        description: 'Advanced language model for text generation',
        icon: '🧠',
        color: '#10B981',
        defaultConfig: {
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 1000
        }
      },
      {
        id: 'anthropic-claude',
        label: 'Anthropic Claude',
        description: 'AI assistant for complex reasoning tasks',
        icon: '🤖',
        color: '#F59E0B',
        defaultConfig: {
          model: 'claude-3-sonnet',
          temperature: 0.7,
          maxTokens: 1000
        }
      }
    ]
  },
  {
    type: 'data-source',
    category: 'Data Sources',
    items: [
      {
        id: 'database-query',
        label: 'Database Query',
        description: 'Query data from PostgreSQL, MongoDB, etc.',
        icon: '🗄️',
        color: '#3B82F6',
        defaultConfig: {
          connectionString: '',
          query: 'SELECT * FROM table'
        }
      },
      {
        id: 'api-fetch',
        label: 'API Fetch',
        description: 'Fetch data from REST APIs',
        icon: '🌐',
        color: '#8B5CF6',
        defaultConfig: {
          url: '',
          method: 'GET',
          headers: {}
        }
      },
      {
        id: 'file-upload',
        label: 'File Upload',
        description: 'Process uploaded files (PDF, CSV, etc.)',
        icon: '📄',
        color: '#06B6D4',
        defaultConfig: {
          supportedTypes: ['pdf', 'csv', 'txt'],
          maxSize: '10MB'
        }
      }
    ]
  },
  {
    type: 'processor',
    category: 'Processors',
    items: [
      {
        id: 'text-processor',
        label: 'Text Processor',
        description: 'Process and transform text data',
        icon: '📝',
        color: '#EF4444',
        defaultConfig: {
          operations: ['clean', 'tokenize', 'extract']
        }
      },
      {
        id: 'vector-search',
        label: 'Vector Search',
        description: 'Semantic search using Weaviate',
        icon: '🔍',
        color: '#F97316',
        defaultConfig: {
          index: '',
          similarityThreshold: 0.8,
          maxResults: 10
        }
      }
    ]
  },
  {
    type: 'condition',
    category: 'Logic',
    items: [
      {
        id: 'if-condition',
        label: 'If Condition',
        description: 'Conditional branching based on criteria',
        icon: '🔀',
        color: '#84CC16',
        defaultConfig: {
          condition: '',
          operator: 'equals'
        }
      },
      {
        id: 'loop',
        label: 'Loop',
        description: 'Iterate over data collections',
        icon: '🔄',
        color: '#06B6D4',
        defaultConfig: {
          iterateOver: '',
          maxIterations: 100
        }
      }
    ]
  },
  {
    type: 'output',
    category: 'Outputs',
    items: [
      {
        id: 'webhook-response',
        label: 'Webhook Response',
        description: 'Send response back to webhook caller',
        icon: '📤',
        color: '#DC2626',
        defaultConfig: {
          statusCode: 200,
          contentType: 'application/json'
        }
      },
      {
        id: 'email-notification',
        label: 'Email Notification',
        description: 'Send email notifications',
        icon: '📧',
        color: '#7C3AED',
        defaultConfig: {
          to: '',
          subject: '',
          template: ''
        }
      }
    ]
  }
]

interface AdvancedFlowBuilderProps {
  workflowId?: string
  initialNodes?: Node[]
  initialEdges?: Edge[]
  onSave?: (nodes: Node[], edges: Edge[]) => void
  onExecute?: (workflowData: any) => void
}

export function AdvancedFlowBuilder({
  workflowId,
  initialNodes = [],
  initialEdges = [],
  onSave,
  onExecute
}: AdvancedFlowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResults, setExecutionResults] = useState<Map<string, any>>(new Map())
  const [workflowName, setWorkflowName] = useState('Untitled Workflow')
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const { screenToFlowPosition } = useReactFlow()

  const onConnect = useCallback(
    (params: Connection) => {
      const edge = {
        ...params,
        type: 'custom',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#64748B'
        },
        style: {
          strokeWidth: 2,
          stroke: '#64748B'
        }
      }
      setEdges((eds) => addEdge(edge, eds))
    },
    [setEdges]
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData('application/reactflow')
      const nodeData = JSON.parse(event.dataTransfer.getData('application/nodedata'))

      if (typeof type === 'undefined' || !type) {
        return
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      })

      const newNode: Node = {
        id: `${type}_${Date.now()}`,
        type: type,
        position,
        data: {
          ...nodeData,
          config: nodeData.defaultConfig || {},
          status: 'idle',
          title: nodeData.label,
          description: nodeData.description
        }
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [screenToFlowPosition, setNodes]
  )

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId))
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId))
  }, [setNodes, setEdges])

  const duplicateNode = useCallback((node: Node) => {
    const newNode: Node = {
      ...node,
      id: `${node.type}_${Date.now()}`,
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50
      }
    }
    setNodes((nds) => nds.concat(newNode))
  }, [setNodes])

  const executeWorkflow = useCallback(async () => {
    if (nodes.length === 0) return

    setIsExecuting(true)
    setExecutionResults(new Map())

    try {
      // Simulate workflow execution
      for (const node of nodes) {
        // Update node status to running
        setNodes((nds) => 
          nds.map((n) => 
            n.id === node.id 
              ? { ...n, data: { ...n.data, status: 'running' } }
              : n
          )
        )

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Simulate execution result
        const result = {
          success: Math.random() > 0.1, // 90% success rate
          output: `Result from ${node.data.title}`,
          executionTime: Math.floor(Math.random() * 1000) + 100,
          timestamp: new Date().toISOString()
        }

        setExecutionResults(prev => new Map(prev).set(node.id, result))

        // Update node status
        setNodes((nds) => 
          nds.map((n) => 
            n.id === node.id 
              ? { 
                  ...n, 
                  data: { 
                    ...n.data, 
                    status: result.success ? 'success' : 'error',
                    lastRun: new Date(),
                    executionTime: result.executionTime,
                    ...(result.success ? {} : { error: 'Execution failed' })
                  } 
                }
              : n
          )
        )
      }

      // Call onExecute callback
      if (onExecute) {
        onExecute({
          workflowId,
          nodes,
          edges,
          results: Array.from(executionResults.entries())
        })
      }
    } catch (error) {
      console.error('Workflow execution error:', error)
    } finally {
      setIsExecuting(false)
    }
  }, [nodes, edges, executionResults, onExecute, workflowId, setNodes])

  const saveWorkflow = useCallback(() => {
    const workflowData = {
      id: workflowId || `workflow_${Date.now()}`,
      name: workflowName,
      nodes,
      edges,
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    if (onSave) {
      onSave(nodes, edges)
    }

    // Simulate saving to backend
    console.log('Saving workflow:', workflowData)
  }, [nodes, edges, workflowName, workflowId, onSave])

  const exportWorkflow = useCallback(() => {
    const workflowData = {
      name: workflowName,
      nodes,
      edges,
      exportedAt: new Date().toISOString()
    }

    const dataStr = JSON.stringify(workflowData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

    const exportFileDefaultName = `${workflowName.replace(/\s+/g, '_')}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }, [nodes, edges, workflowName])

  return (
    <div className="h-screen flex">
      {/* Node Palette */}
      <div className="w-80 border-r bg-gray-50 dark:bg-gray-900 overflow-auto">
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-4">Component Library</h3>
          
          <Tabs defaultValue="ai-model" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ai-model">AI</TabsTrigger>
              <TabsTrigger value="data-source">Data</TabsTrigger>
              <TabsTrigger value="processor">Logic</TabsTrigger>
            </TabsList>
            
            {nodeTemplates.map((category) => (
              <TabsContent key={category.type} value={category.type} className="space-y-2">
                {category.items.map((item) => (
                  <Card 
                    key={item.id}
                    className="cursor-grab hover:shadow-md transition-shadow"
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData('application/reactflow', category.type)
                      event.dataTransfer.setData('application/nodedata', JSON.stringify(item))
                      event.dataTransfer.effectAllowed = 'move'
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{item.icon}</span>
                        <div>
                          <h4 className="font-medium text-sm">{item.label}</h4>
                          <p className="text-xs text-gray-500">{item.description}</p>
                        </div>
                      </div>
                      <Badge variant="outline" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
                        {category.category}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>

      {/* Main Flow Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b p-4 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="font-semibold text-lg bg-transparent border-none outline-none"
              />
              <Badge variant="outline">
                {nodes.length} nodes, {edges.length} connections
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportWorkflow}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={saveWorkflow}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button 
                size="sm" 
                onClick={executeWorkflow}
                disabled={isExecuting || nodes.length === 0}
              >
                {isExecuting ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Execute
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            className="bg-gray-50 dark:bg-gray-900"
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
            <Controls />
            <MiniMap className="!bg-white !border !border-gray-200" />
            
            {/* Execution Status Panel */}
            <Panel position="top-right">
              <Card className="w-64">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Workflow className="h-4 w-4" />
                    Execution Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xs">
                    <div className="flex justify-between">
                      <span>Total Nodes:</span>
                      <span>{nodes.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Executed:</span>
                      <span>{executionResults.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate:</span>
                      <span>
                        {executionResults.size > 0 
                          ? `${Math.round((Array.from(executionResults.values()).filter(r => r.success).length / executionResults.size) * 100)}%`
                          : '—'
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Panel>
          </ReactFlow>
        </div>
      </div>

      {/* Property Panel */}
      {selectedNode && (
        <div className="w-80 border-l bg-white dark:bg-gray-800 overflow-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Node Properties</h3>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => duplicateNode(selectedNode)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteNode(selectedNode.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={selectedNode.data.title}
                  onChange={(e) => {
                    setNodes((nds) =>
                      nds.map((node) =>
                        node.id === selectedNode.id
                          ? { ...node, data: { ...node.data, title: e.target.value } }
                          : node
                      )
                    )
                  }}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={selectedNode.data.description}
                  onChange={(e) => {
                    setNodes((nds) =>
                      nds.map((node) =>
                        node.id === selectedNode.id
                          ? { ...node, data: { ...node.data, description: e.target.value } }
                          : node
                      )
                    )
                  }}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  rows={3}
                />
              </div>

              {/* Configuration based on node type */}
              <div>
                <label className="text-sm font-medium">Configuration</label>
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <pre className="text-xs">
                    {JSON.stringify(selectedNode.data.config || {}, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Execution Results */}
              {executionResults.has(selectedNode.id) && (
                <div>
                  <label className="text-sm font-medium">Last Execution</label>
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <pre className="text-xs">
                      {JSON.stringify(executionResults.get(selectedNode.id), null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}