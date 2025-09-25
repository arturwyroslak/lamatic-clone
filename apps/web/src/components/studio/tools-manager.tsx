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
  Wrench,
  Search,
  Code,
  Database,
  Globe,
  Calculator,
  Mail,
  Calendar,
  Image,
  FileText,
  Zap,
  Settings,
  Plus,
  Edit,
  Trash2,
  Play,
  Download,
  Upload,
  Star,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react'

interface Tool {
  id: string
  name: string
  description: string
  category: 'search' | 'data' | 'communication' | 'utility' | 'ai' | 'custom'
  type: 'built-in' | 'external' | 'custom'
  status: 'active' | 'inactive' | 'error'
  version: string
  apiEndpoint?: string
  documentation: string
  parameters: ToolParameter[]
  usage: number
  rating: number
  author: string
  isPublic: boolean
  createdAt: Date
  lastUsed?: Date
}

interface ToolParameter {
  name: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  required: boolean
  description: string
  defaultValue?: any
}

export function ToolsManager() {
  const [activeTab, setActiveTab] = useState('available')
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  const [tools, setTools] = useState<Tool[]>([
    {
      id: 'tool-1',
      name: 'Web Search',
      description: 'Search the web for current information and real-time data',
      category: 'search',
      type: 'built-in',
      status: 'active',
      version: '2.1.0',
      apiEndpoint: 'https://api.serper.dev/search',
      documentation: 'https://docs.lamatic.ai/tools/web-search',
      parameters: [
        {
          name: 'query',
          type: 'string',
          required: true,
          description: 'Search query to execute'
        },
        {
          name: 'num_results',
          type: 'number',
          required: false,
          description: 'Number of results to return',
          defaultValue: 10
        },
        {
          name: 'language',
          type: 'string',
          required: false,
          description: 'Search language (ISO code)',
          defaultValue: 'en'
        }
      ],
      usage: 2450,
      rating: 4.8,
      author: 'Lamatic',
      isPublic: true,
      createdAt: new Date('2024-01-10'),
      lastUsed: new Date('2024-01-22')
    },
    {
      id: 'tool-2',
      name: 'Database Query',
      description: 'Execute SQL queries against connected databases',
      category: 'data',
      type: 'built-in',
      status: 'active',
      version: '1.5.0',
      documentation: 'https://docs.lamatic.ai/tools/database-query',
      parameters: [
        {
          name: 'connection_id',
          type: 'string',
          required: true,
          description: 'Database connection identifier'
        },
        {
          name: 'query',
          type: 'string',
          required: true,
          description: 'SQL query to execute'
        },
        {
          name: 'limit',
          type: 'number',
          required: false,
          description: 'Maximum number of rows to return',
          defaultValue: 100
        }
      ],
      usage: 1890,
      rating: 4.6,
      author: 'Lamatic',
      isPublic: true,
      createdAt: new Date('2024-01-08'),
      lastUsed: new Date('2024-01-21')
    },
    {
      id: 'tool-3',
      name: 'Email Sender',
      description: 'Send emails through various providers (SMTP, SendGrid, etc.)',
      category: 'communication',
      type: 'built-in',
      status: 'active',
      version: '1.3.0',
      documentation: 'https://docs.lamatic.ai/tools/email-sender',
      parameters: [
        {
          name: 'to',
          type: 'string',
          required: true,
          description: 'Recipient email address'
        },
        {
          name: 'subject',
          type: 'string',
          required: true,
          description: 'Email subject line'
        },
        {
          name: 'body',
          type: 'string',
          required: true,
          description: 'Email body content'
        },
        {
          name: 'html',
          type: 'boolean',
          required: false,
          description: 'Whether body is HTML',
          defaultValue: false
        }
      ],
      usage: 1234,
      rating: 4.7,
      author: 'Lamatic',
      isPublic: true,
      createdAt: new Date('2024-01-12'),
      lastUsed: new Date('2024-01-20')
    },
    {
      id: 'tool-4',
      name: 'Code Executor',
      description: 'Execute Python, JavaScript, and other code snippets safely',
      category: 'utility',
      type: 'built-in',
      status: 'active',
      version: '2.0.0',
      documentation: 'https://docs.lamatic.ai/tools/code-executor',
      parameters: [
        {
          name: 'code',
          type: 'string',
          required: true,
          description: 'Code to execute'
        },
        {
          name: 'language',
          type: 'string',
          required: true,
          description: 'Programming language'
        },
        {
          name: 'timeout',
          type: 'number',
          required: false,
          description: 'Execution timeout in seconds',
          defaultValue: 30
        }
      ],
      usage: 987,
      rating: 4.5,
      author: 'Lamatic',
      isPublic: true,
      createdAt: new Date('2024-01-15'),
      lastUsed: new Date('2024-01-19')
    },
    {
      id: 'tool-5',
      name: 'Image Generator',
      description: 'Generate images using DALL-E, Midjourney, or Stable Diffusion',
      category: 'ai',
      type: 'external',
      status: 'active',
      version: '1.2.0',
      apiEndpoint: 'https://api.openai.com/v1/images/generations',
      documentation: 'https://docs.lamatic.ai/tools/image-generator',
      parameters: [
        {
          name: 'prompt',
          type: 'string',
          required: true,
          description: 'Image generation prompt'
        },
        {
          name: 'size',
          type: 'string',
          required: false,
          description: 'Image size (256x256, 512x512, 1024x1024)',
          defaultValue: '512x512'
        },
        {
          name: 'style',
          type: 'string',
          required: false,
          description: 'Art style preference'
        }
      ],
      usage: 756,
      rating: 4.9,
      author: 'Community',
      isPublic: true,
      createdAt: new Date('2024-01-14'),
      lastUsed: new Date('2024-01-18')
    },
    {
      id: 'tool-6',
      name: 'Custom Analytics',
      description: 'Custom tool for analyzing user behavior data',
      category: 'custom',
      type: 'custom',
      status: 'inactive',
      version: '0.9.0',
      documentation: 'Custom tool documentation',
      parameters: [
        {
          name: 'dataset',
          type: 'object',
          required: true,
          description: 'Analytics dataset to process'
        },
        {
          name: 'metrics',
          type: 'array',
          required: true,
          description: 'List of metrics to calculate'
        }
      ],
      usage: 45,
      rating: 4.2,
      author: 'user123',
      isPublic: false,
      createdAt: new Date('2024-01-16'),
      lastUsed: new Date('2024-01-17')
    }
  ])

  const getCategoryIcon = (category: Tool['category']) => {
    switch (category) {
      case 'search': return <Search className="h-4 w-4" />
      case 'data': return <Database className="h-4 w-4" />
      case 'communication': return <Mail className="h-4 w-4" />
      case 'utility': return <Calculator className="h-4 w-4" />
      case 'ai': return <Zap className="h-4 w-4" />
      case 'custom': return <Code className="h-4 w-4" />
      default: return <Wrench className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: Tool['category']) => {
    const colors = {
      search: 'bg-blue-100 text-blue-800',
      data: 'bg-green-100 text-green-800',
      communication: 'bg-purple-100 text-purple-800',
      utility: 'bg-orange-100 text-orange-800',
      ai: 'bg-pink-100 text-pink-800',
      custom: 'bg-gray-100 text-gray-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status: Tool['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'inactive': return <Clock className="h-4 w-4 text-gray-400" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: Tool['status']) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      error: 'destructive'
    } as const
    
    return (
      <Badge variant={variants[status]}>
        {status}
      </Badge>
    )
  }

  const getTypeColor = (type: Tool['type']) => {
    const colors = {
      'built-in': 'bg-blue-50 text-blue-700 border-blue-200',
      'external': 'bg-green-50 text-green-700 border-green-200',
      'custom': 'bg-purple-50 text-purple-700 border-purple-200'
    }
    return colors[type] || 'bg-gray-50 text-gray-700 border-gray-200'
  }

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < Math.floor(rating) 
          ? 'text-yellow-400 fill-current' 
          : i < rating 
            ? 'text-yellow-400 fill-current opacity-50' 
            : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Tools Manager
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage tools and functions for your AI workflows
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-1" />
              Import Tool
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Create Tool
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="w-full justify-start border-b rounded-none h-12 bg-transparent p-0">
            <TabsTrigger value="available" className="rounded-none">Available Tools</TabsTrigger>
            <TabsTrigger value="installed" className="rounded-none">Installed</TabsTrigger>
            <TabsTrigger value="custom" className="rounded-none">Custom Tools</TabsTrigger>
            <TabsTrigger value="marketplace" className="rounded-none">Marketplace</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="flex-1 m-0 p-4">
            {/* Filters */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Categories</option>
                <option value="search">Search</option>
                <option value="data">Data</option>
                <option value="communication">Communication</option>
                <option value="utility">Utility</option>
                <option value="ai">AI</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
              {/* Tools List */}
              <div className="xl:col-span-2">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="grid gap-4">
                    {filteredTools.map((tool) => (
                      <Card
                        key={tool.id}
                        className={`cursor-pointer transition-colors ${
                          selectedTool === tool.id ? 'ring-2 ring-primary' : 'hover:bg-accent/50'
                        }`}
                        onClick={() => setSelectedTool(tool.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(tool.category)}
                              <span className="font-medium">{tool.name}</span>
                              <Badge className={getCategoryColor(tool.category)}>
                                {tool.category}
                              </Badge>
                              <Badge variant="outline" className={getTypeColor(tool.type)}>
                                {tool.type}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(tool.status)}
                              {getStatusBadge(tool.status)}
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            {tool.description}
                          </p>
                          
                          <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground mb-3">
                            <div>
                              <span className="font-medium">Version:</span> {tool.version}
                            </div>
                            <div>
                              <span className="font-medium">Usage:</span> {tool.usage.toLocaleString()}
                            </div>
                            <div>
                              <span className="font-medium">Parameters:</span> {tool.parameters.length}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-1">
                              {renderStars(tool.rating)}
                              <span className="text-xs text-muted-foreground ml-1">
                                ({tool.rating})
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              by {tool.author}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="h-7">
                              <Play className="h-3 w-3 mr-1" />
                              Test
                            </Button>
                            <Button size="sm" variant="outline" className="h-7">
                              <FileText className="h-3 w-3 mr-1" />
                              Docs
                            </Button>
                            <Button size="sm" variant="outline" className="h-7">
                              <Settings className="h-3 w-3 mr-1" />
                              Configure
                            </Button>
                            {tool.status === 'inactive' && (
                              <Button size="sm" className="h-7">
                                <Plus className="h-3 w-3 mr-1" />
                                Install
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Tool Details */}
              <div>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Tool Details</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {selectedTool ? (
                      <ScrollArea className="h-[calc(100vh-400px)]">
                        {(() => {
                          const tool = tools.find(t => t.id === selectedTool)
                          if (!tool) return null
                          
                          return (
                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium">Name</Label>
                                <p className="text-sm">{tool.name}</p>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium">Description</Label>
                                <p className="text-sm text-muted-foreground">{tool.description}</p>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Category</Label>
                                  <Badge className={`${getCategoryColor(tool.category)} mt-1`}>
                                    {tool.category}
                                  </Badge>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Type</Label>
                                  <Badge variant="outline" className={`${getTypeColor(tool.type)} mt-1`}>
                                    {tool.type}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Status</Label>
                                  <div className="flex items-center gap-2 mt-1">
                                    {getStatusIcon(tool.status)}
                                    <span className="text-sm">{tool.status}</span>
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Version</Label>
                                  <p className="text-sm mt-1">{tool.version}</p>
                                </div>
                              </div>
                              
                              <Separator />
                              
                              <div>
                                <Label className="text-sm font-medium">Parameters</Label>
                                <div className="space-y-2 mt-2">
                                  {tool.parameters.map((param, index) => (
                                    <div key={index} className="p-2 bg-muted rounded text-xs">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium">{param.name}</span>
                                        <Badge variant="outline" className="text-xs">
                                          {param.type}
                                        </Badge>
                                        {param.required && (
                                          <Badge variant="destructive" className="text-xs">
                                            required
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-muted-foreground">{param.description}</p>
                                      {param.defaultValue !== undefined && (
                                        <p className="text-muted-foreground">
                                          Default: {JSON.stringify(param.defaultValue)}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <Separator />
                              
                              <div>
                                <Label className="text-sm font-medium">Usage Statistics</Label>
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                  <div className="p-2 bg-muted rounded">
                                    <span className="text-xs text-muted-foreground">Total Usage</span>
                                    <p className="text-sm font-medium">{tool.usage.toLocaleString()}</p>
                                  </div>
                                  <div className="p-2 bg-muted rounded">
                                    <span className="text-xs text-muted-foreground">Rating</span>
                                    <div className="flex items-center gap-1">
                                      {renderStars(tool.rating)}
                                      <span className="text-xs">{tool.rating}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {tool.apiEndpoint && (
                                <div>
                                  <Label className="text-sm font-medium">API Endpoint</Label>
                                  <div className="mt-1 p-2 bg-muted rounded text-xs font-mono break-all">
                                    {tool.apiEndpoint}
                                  </div>
                                </div>
                              )}
                              
                              <div>
                                <Label className="text-sm font-medium">Author</Label>
                                <p className="text-sm mt-1">{tool.author}</p>
                              </div>
                              
                              <div className="flex flex-col gap-2 pt-2">
                                <Button size="sm" className="w-full">
                                  <Play className="h-3 w-3 mr-1" />
                                  Test Tool
                                </Button>
                                <Button size="sm" variant="outline" className="w-full">
                                  <FileText className="h-3 w-3 mr-1" />
                                  View Documentation
                                </Button>
                                <Button size="sm" variant="outline" className="w-full">
                                  <Settings className="h-3 w-3 mr-1" />
                                  Configure
                                </Button>
                                <Button size="sm" variant="outline" className="w-full">
                                  <Download className="h-3 w-3 mr-1" />
                                  Export
                                </Button>
                                {tool.type === 'custom' && (
                                  <Button size="sm" variant="destructive" className="w-full">
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Delete Tool
                                  </Button>
                                )}
                              </div>
                            </div>
                          )
                        })()}
                      </ScrollArea>
                    ) : (
                      <div className="flex items-center justify-center h-[calc(100vh-400px)] text-muted-foreground">
                        Select a tool to view details
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="installed" className="flex-1 m-0 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.filter(tool => tool.status === 'active').map((tool) => (
                <Card key={tool.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {getCategoryIcon(tool.category)}
                      <span className="font-medium">{tool.name}</span>
                      <Badge className={getCategoryColor(tool.category)}>
                        {tool.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{tool.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span>Usage: {tool.usage}</span>
                      <span>v{tool.version}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Play className="h-3 w-3 mr-1" />
                        Test
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="flex-1 m-0 p-4">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Create Custom Tool</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tool Name</Label>
                      <Input placeholder="Enter tool name..." className="mt-1" />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <select className="w-full mt-1 p-2 border rounded">
                        <option>Select category</option>
                        <option>Search</option>
                        <option>Data</option>
                        <option>Communication</option>
                        <option>Utility</option>
                        <option>AI</option>
                        <option>Custom</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Description</Label>
                    <Input placeholder="Brief description of the tool..." className="mt-1" />
                  </div>
                  
                  <div>
                    <Label>API Endpoint (optional)</Label>
                    <Input placeholder="https://api.example.com/endpoint" className="mt-1" />
                  </div>
                  
                  <div>
                    <Label>Implementation</Label>
                    <Textarea 
                      placeholder="Tool implementation code (JavaScript/Python)..."
                      className="mt-1 min-h-[200px] font-mono"
                    />
                  </div>
                  
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Tool
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="marketplace" className="flex-1 m-0 p-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Tool Marketplace
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Browse and install tools from the community marketplace
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}