'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Settings,
  Info,
  Zap,
  Database,
  Code,
  Eye,
  Save,
  RotateCcw,
  Copy,
  Trash2,
  Plus,
  Minus
} from 'lucide-react'

interface NodeProperty {
  key: string
  label: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'textarea' | 'array' | 'object'
  value: any
  options?: string[]
  required?: boolean
  description?: string
  placeholder?: string
  min?: number
  max?: number
}

interface SelectedNode {
  id: string
  type: string
  title: string
  description: string
  properties: NodeProperty[]
}

interface PropertyPanelProps {
  node?: any
  onNodeUpdate?: (updates: any) => void
  onClose?: () => void
}

export function PropertyPanel({ node, onNodeUpdate, onClose }: PropertyPanelProps = {}) {
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>({
    id: 'llm-1',
    type: 'gpt-4',
    title: 'GPT-4 Chat',
    description: 'Generate responses using OpenAI GPT-4',
    properties: [
      {
        key: 'title',
        label: 'Node Title',
        type: 'string',
        value: 'GPT-4 Chat',
        required: true,
        description: 'Display name for this node'
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        value: 'Generate responses using OpenAI GPT-4',
        description: 'Brief description of what this node does'
      },
      {
        key: 'model',
        label: 'Model',
        type: 'select',
        value: 'gpt-4',
        options: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
        required: true,
        description: 'AI model to use for generation'
      },
      {
        key: 'temperature',
        label: 'Temperature',
        type: 'number',
        value: 0.7,
        min: 0,
        max: 2,
        description: 'Controls randomness in responses (0-2)'
      },
      {
        key: 'maxTokens',
        label: 'Max Tokens',
        type: 'number',
        value: 1000,
        min: 1,
        max: 4096,
        description: 'Maximum number of tokens to generate'
      },
      {
        key: 'systemPrompt',
        label: 'System Prompt',
        type: 'textarea',
        value: 'You are a helpful AI assistant.',
        description: 'System instructions for the AI model',
        placeholder: 'Enter system instructions...'
      },
      {
        key: 'enableStreaming',
        label: 'Enable Streaming',
        type: 'boolean',
        value: false,
        description: 'Stream responses as they are generated'
      },
      {
        key: 'tools',
        label: 'Available Tools',
        type: 'array',
        value: ['web_search', 'calculator'],
        description: 'Tools that the AI can use'
      },
      {
        key: 'metadata',
        label: 'Metadata',
        type: 'object',
        value: {
          version: '1.0',
          category: 'ai',
          tags: ['chat', 'gpt-4']
        },
        description: 'Additional metadata for this node'
      }
    ]
  })

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const handlePropertyChange = (key: string, value: any) => {
    if (!selectedNode) return
    
    setSelectedNode(prev => ({
      ...prev!,
      properties: prev!.properties.map(prop =>
        prop.key === key ? { ...prop, value } : prop
      )
    }))
    setHasUnsavedChanges(true)
  }

  const handleSave = () => {
    console.log('Saving node properties:', selectedNode)
    setHasUnsavedChanges(false)
  }

  const handleReset = () => {
    // Reset to original values
    setHasUnsavedChanges(false)
  }

  const renderPropertyInput = (property: NodeProperty) => {
    switch (property.type) {
      case 'string':
        return (
          <Input
            value={property.value || ''}
            onChange={(e) => handlePropertyChange(property.key, e.target.value)}
            placeholder={property.placeholder}
            className="mt-1"
          />
        )
      
      case 'number':
        return (
          <Input
            type="number"
            value={property.value || ''}
            onChange={(e) => handlePropertyChange(property.key, parseFloat(e.target.value) || 0)}
            min={property.min}
            max={property.max}
            step={property.key === 'temperature' ? 0.1 : 1}
            className="mt-1"
          />
        )
      
      case 'boolean':
        return (
          <div className="flex items-center mt-1">
            <input
              type="checkbox"
              checked={property.value || false}
              onChange={(e) => handlePropertyChange(property.key, e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">{property.value ? 'Enabled' : 'Disabled'}</span>
          </div>
        )
      
      case 'select':
        return (
          <select
            value={property.value || ''}
            onChange={(e) => handlePropertyChange(property.key, e.target.value)}
            className="w-full mt-1 p-2 border rounded-md"
          >
            {property.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        )
      
      case 'textarea':
        return (
          <Textarea
            value={property.value || ''}
            onChange={(e) => handlePropertyChange(property.key, e.target.value)}
            placeholder={property.placeholder}
            className="mt-1 min-h-[100px]"
          />
        )
      
      case 'array':
        return (
          <div className="mt-1">
            <div className="space-y-2">
              {(property.value || []).map((item: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={item}
                    onChange={(e) => {
                      const newArray = [...(property.value || [])]
                      newArray[index] = e.target.value
                      handlePropertyChange(property.key, newArray)
                    }}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newArray = (property.value || []).filter((_: any, i: number) => i !== index)
                      handlePropertyChange(property.key, newArray)
                    }}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const newArray = [...(property.value || []), '']
                handlePropertyChange(property.key, newArray)
              }}
              className="mt-2"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Item
            </Button>
          </div>
        )
      
      case 'object':
        return (
          <div className="mt-1">
            <Textarea
              value={JSON.stringify(property.value || {}, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value)
                  handlePropertyChange(property.key, parsed)
                } catch (error) {
                  // Invalid JSON, don't update
                }
              }}
              className="font-mono text-xs min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter valid JSON format
            </p>
          </div>
        )
      
      default:
        return (
          <Input
            value={property.value || ''}
            onChange={(e) => handlePropertyChange(property.key, e.target.value)}
            className="mt-1"
          />
        )
    }
  }

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'gpt-4':
      case 'gpt-3.5-turbo':
      case 'claude-3':
        return <Zap className="h-4 w-4" />
      case 'database':
        return <Database className="h-4 w-4" />
      case 'webhook':
        return <Code className="h-4 w-4" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

  const getNodeTypeColor = (type: string) => {
    const colors = {
      'gpt-4': 'bg-green-100 text-green-800',
      'gpt-3.5-turbo': 'bg-blue-100 text-blue-800',
      'claude-3': 'bg-purple-100 text-purple-800',
      'database': 'bg-orange-100 text-orange-800',
      'webhook': 'bg-pink-100 text-pink-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (!selectedNode) {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Properties
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <Eye className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Select a node to view its properties</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Properties
          </h2>
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-orange-600">
                Unsaved
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={!hasUnsavedChanges}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
            >
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Selected Node Info */}
        <div className="flex items-center gap-2">
          {getNodeIcon(selectedNode.type)}
          <span className="font-medium">{selectedNode.title}</span>
          <Badge className={getNodeTypeColor(selectedNode.type)}>
            {selectedNode.type}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {selectedNode.description}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="properties" className="h-full flex flex-col">
          <TabsList className="w-full justify-start border-b rounded-none h-12 bg-transparent p-0">
            <TabsTrigger value="properties" className="rounded-none">Properties</TabsTrigger>
            <TabsTrigger value="validation" className="rounded-none">Validation</TabsTrigger>
            <TabsTrigger value="styling" className="rounded-none">Styling</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <div className="p-4">
              <TabsContent value="properties" className="m-0">
                <div className="space-y-6">
                  {/* Basic Properties */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedNode.properties
                        .filter(prop => ['title', 'description'].includes(prop.key))
                        .map(property => (
                          <div key={property.key}>
                            <div className="flex items-center gap-2">
                              <Label>{property.label}</Label>
                              {property.required && (
                                <Badge variant="destructive" className="text-xs">
                                  Required
                                </Badge>
                              )}
                            </div>
                            {renderPropertyInput(property)}
                            {property.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {property.description}
                              </p>
                            )}
                          </div>
                        ))}
                    </CardContent>
                  </Card>

                  {/* Model Configuration */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Model Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedNode.properties
                        .filter(prop => ['model', 'temperature', 'maxTokens', 'systemPrompt', 'enableStreaming'].includes(prop.key))
                        .map(property => (
                          <div key={property.key}>
                            <div className="flex items-center gap-2">
                              <Label>{property.label}</Label>
                              {property.required && (
                                <Badge variant="destructive" className="text-xs">
                                  Required
                                </Badge>
                              )}
                            </div>
                            {renderPropertyInput(property)}
                            {property.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {property.description}
                              </p>
                            )}
                          </div>
                        ))}
                    </CardContent>
                  </Card>

                  {/* Advanced Configuration */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Advanced Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedNode.properties
                        .filter(prop => ['tools', 'metadata'].includes(prop.key))
                        .map(property => (
                          <div key={property.key}>
                            <div className="flex items-center gap-2">
                              <Label>{property.label}</Label>
                              {property.required && (
                                <Badge variant="destructive" className="text-xs">
                                  Required
                                </Badge>
                              )}
                            </div>
                            {renderPropertyInput(property)}
                            {property.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {property.description}
                              </p>
                            )}
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="validation" className="m-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Validation Rules</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Input Validation</Label>
                      <select className="w-full mt-1 p-2 border rounded-md">
                        <option>None</option>
                        <option>Required field</option>
                        <option>Email format</option>
                        <option>URL format</option>
                        <option>Custom regex</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label>Output Validation</Label>
                      <select className="w-full mt-1 p-2 border rounded-md">
                        <option>None</option>
                        <option>Non-empty response</option>
                        <option>JSON format</option>
                        <option>Custom validation</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label>Error Handling</Label>
                      <select className="w-full mt-1 p-2 border rounded-md">
                        <option>Stop workflow</option>
                        <option>Continue with error</option>
                        <option>Retry with backoff</option>
                        <option>Use fallback</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="styling" className="m-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Node Appearance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Node Color</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-8 h-8 rounded border bg-blue-500"></div>
                        <Input type="color" value="#3b82f6" className="w-16" />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Border Style</Label>
                      <select className="w-full mt-1 p-2 border rounded-md">
                        <option>Solid</option>
                        <option>Dashed</option>
                        <option>Dotted</option>
                        <option>None</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label>Size</Label>
                      <select className="w-full mt-1 p-2 border rounded-md">
                        <option>Auto</option>
                        <option>Small</option>
                        <option>Medium</option>
                        <option>Large</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Show Icon</Label>
                      <input type="checkbox" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Show Badge</Label>
                      <input type="checkbox" defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </div>

      {/* Footer Actions */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Copy className="h-4 w-4 mr-1" />
            Duplicate
          </Button>
          <Button variant="destructive" size="sm" className="flex-1">
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}