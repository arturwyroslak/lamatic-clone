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
  Bot,
  Brain,
  MessageSquare,
  Code,
  FileText,
  Search,
  Users,
  Settings,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Copy,
  Star,
  Zap
} from 'lucide-react'

interface Agent {
  id: string
  name: string
  type: 'chat' | 'text' | 'code' | 'analysis' | 'multimodal' | 'workflow'
  description: string
  status: 'active' | 'inactive' | 'training'
  model: string
  capabilities: string[]
  instructions: string
  temperature: number
  maxTokens: number
  createdAt: Date
  lastUsed?: Date
  usage: {
    totalRequests: number
    averageLatency: number
    successRate: number
  }
}

export function AgentManager() {
  const [activeTab, setActiveTab] = useState('agents')
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'agent-1',
      name: 'Customer Support Assistant',
      type: 'chat',
      description: 'Handles customer inquiries and provides helpful responses',
      status: 'active',
      model: 'gpt-4',
      capabilities: ['Q&A', 'Ticket Routing', 'Sentiment Analysis'],
      instructions: 'You are a helpful customer support assistant. Always be polite and provide accurate information.',
      temperature: 0.7,
      maxTokens: 1000,
      createdAt: new Date('2024-01-15'),
      lastUsed: new Date('2024-01-22'),
      usage: {
        totalRequests: 1450,
        averageLatency: 234,
        successRate: 98.5
      }
    },
    {
      id: 'agent-2',
      name: 'Code Review Bot',
      type: 'code',
      description: 'Reviews code changes and provides suggestions',
      status: 'active',
      model: 'gpt-4',
      capabilities: ['Code Analysis', 'Security Check', 'Best Practices'],
      instructions: 'Review code for quality, security issues, and adherence to best practices.',
      temperature: 0.3,
      maxTokens: 2000,
      createdAt: new Date('2024-01-10'),
      lastUsed: new Date('2024-01-20'),
      usage: {
        totalRequests: 892,
        averageLatency: 456,
        successRate: 96.2
      }
    },
    {
      id: 'agent-3',
      name: 'Content Generator',
      type: 'text',
      description: 'Generates marketing content and blog posts',
      status: 'inactive',
      model: 'gpt-3.5-turbo',
      capabilities: ['Content Creation', 'SEO Optimization', 'Brand Voice'],
      instructions: 'Generate engaging content that matches the brand voice and is optimized for SEO.',
      temperature: 0.8,
      maxTokens: 1500,
      createdAt: new Date('2024-01-08'),
      usage: {
        totalRequests: 234,
        averageLatency: 189,
        successRate: 94.8
      }
    },
    {
      id: 'agent-4',
      name: 'Data Analyst',
      type: 'analysis',
      description: 'Analyzes data and generates insights',
      status: 'training',
      model: 'claude-3-sonnet',
      capabilities: ['Data Analysis', 'Report Generation', 'Trend Identification'],
      instructions: 'Analyze provided data and generate clear, actionable insights.',
      temperature: 0.5,
      maxTokens: 2500,
      createdAt: new Date('2024-01-20'),
      usage: {
        totalRequests: 45,
        averageLatency: 567,
        successRate: 100
      }
    }
  ])

  const getAgentIcon = (type: Agent['type']) => {
    switch (type) {
      case 'chat': return <MessageSquare className="h-4 w-4" />
      case 'code': return <Code className="h-4 w-4" />
      case 'text': return <FileText className="h-4 w-4" />
      case 'analysis': return <Brain className="h-4 w-4" />
      case 'multimodal': return <Zap className="h-4 w-4" />
      case 'workflow': return <Bot className="h-4 w-4" />
      default: return <Bot className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: Agent['status']) => {
    switch (status) {
      case 'active': return <Play className="h-4 w-4 text-green-500" />
      case 'inactive': return <Pause className="h-4 w-4 text-gray-400" />
      case 'training': return <Brain className="h-4 w-4 text-blue-500 animate-pulse" />
      default: return <Pause className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: Agent['status']) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      training: 'outline'
    } as const
    
    return (
      <Badge variant={variants[status]}>
        {status}
      </Badge>
    )
  }

  const getTypeColor = (type: Agent['type']) => {
    const colors = {
      chat: 'bg-blue-100 text-blue-800',
      code: 'bg-purple-100 text-purple-800',
      text: 'bg-green-100 text-green-800',
      analysis: 'bg-orange-100 text-orange-800',
      multimodal: 'bg-pink-100 text-pink-800',
      workflow: 'bg-indigo-100 text-indigo-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Agent Manager
            </h2>
            <p className="text-sm text-muted-foreground">
              Create and manage AI agents for different tasks
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Agent
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="w-full justify-start border-b rounded-none h-12 bg-transparent p-0">
            <TabsTrigger value="agents" className="rounded-none">My Agents</TabsTrigger>
            <TabsTrigger value="templates" className="rounded-none">Templates</TabsTrigger>
            <TabsTrigger value="marketplace" className="rounded-none">Marketplace</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-none">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="flex-1 m-0 p-4">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
              {/* Agents List */}
              <div className="xl:col-span-2">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Active Agents</CardTitle>
                      <div className="flex items-center gap-2">
                        <Input placeholder="Search agents..." className="w-48" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-3">
                        {agents.map((agent) => (
                          <div
                            key={agent.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              selectedAgent === agent.id ? 'bg-accent' : 'hover:bg-accent/50'
                            }`}
                            onClick={() => setSelectedAgent(agent.id)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getAgentIcon(agent.type)}
                                <span className="font-medium">{agent.name}</span>
                                <Badge className={getTypeColor(agent.type)}>
                                  {agent.type}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(agent.status)}
                                {getStatusBadge(agent.status)}
                              </div>
                            </div>
                            
                            <div className="text-sm text-muted-foreground mb-3">
                              {agent.description}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                              <div>
                                <span className="font-medium">Model:</span> {agent.model}
                              </div>
                              <div>
                                <span className="font-medium">Requests:</span> {agent.usage.totalRequests.toLocaleString()}
                              </div>
                              <div>
                                <span className="font-medium">Success Rate:</span> {agent.usage.successRate}%
                              </div>
                              <div>
                                <span className="font-medium">Avg Latency:</span> {agent.usage.averageLatency}ms
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1 mt-3">
                              {agent.capabilities.slice(0, 3).map((capability, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {capability}
                                </Badge>
                              ))}
                              {agent.capabilities.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{agent.capabilities.length - 3} more
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 mt-3 pt-2 border-t">
                              <Button size="sm" variant="outline" className="h-7">
                                <Play className="h-3 w-3 mr-1" />
                                Test
                              </Button>
                              <Button size="sm" variant="outline" className="h-7">
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button size="sm" variant="outline" className="h-7">
                                <Copy className="h-3 w-3 mr-1" />
                                Clone
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Agent Details */}
              <div>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Agent Details</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {selectedAgent ? (
                      <ScrollArea className="h-[500px]">
                        {(() => {
                          const agent = agents.find(a => a.id === selectedAgent)
                          if (!agent) return null
                          
                          return (
                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium">Name</Label>
                                <p className="text-sm">{agent.name}</p>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium">Description</Label>
                                <p className="text-sm text-muted-foreground">{agent.description}</p>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Type</Label>
                                  <Badge className={`${getTypeColor(agent.type)} mt-1`}>
                                    {agent.type}
                                  </Badge>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Status</Label>
                                  <div className="flex items-center gap-2 mt-1">
                                    {getStatusIcon(agent.status)}
                                    <span className="text-sm">{agent.status}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <Separator />
                              
                              <div>
                                <Label className="text-sm font-medium">Configuration</Label>
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                  <div className="p-2 bg-muted rounded">
                                    <span className="text-xs text-muted-foreground">Model</span>
                                    <p className="text-sm font-medium">{agent.model}</p>
                                  </div>
                                  <div className="p-2 bg-muted rounded">
                                    <span className="text-xs text-muted-foreground">Temperature</span>
                                    <p className="text-sm font-medium">{agent.temperature}</p>
                                  </div>
                                  <div className="p-2 bg-muted rounded col-span-2">
                                    <span className="text-xs text-muted-foreground">Max Tokens</span>
                                    <p className="text-sm font-medium">{agent.maxTokens}</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium">System Instructions</Label>
                                <div className="mt-1 p-2 bg-muted rounded text-xs">
                                  {agent.instructions}
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium">Capabilities</Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {agent.capabilities.map((capability, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {capability}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              <Separator />
                              
                              <div>
                                <Label className="text-sm font-medium">Performance Metrics</Label>
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                  <div className="p-2 bg-muted rounded">
                                    <span className="text-xs text-muted-foreground">Total Requests</span>
                                    <p className="text-sm font-medium">{agent.usage.totalRequests.toLocaleString()}</p>
                                  </div>
                                  <div className="p-2 bg-muted rounded">
                                    <span className="text-xs text-muted-foreground">Success Rate</span>
                                    <p className="text-sm font-medium">{agent.usage.successRate}%</p>
                                  </div>
                                  <div className="p-2 bg-muted rounded col-span-2">
                                    <span className="text-xs text-muted-foreground">Avg Latency</span>
                                    <p className="text-sm font-medium">{agent.usage.averageLatency}ms</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-col gap-2 pt-2">
                                <Button size="sm" className="w-full">
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit Agent
                                </Button>
                                <Button size="sm" variant="outline" className="w-full">
                                  <Play className="h-3 w-3 mr-1" />
                                  Test Agent
                                </Button>
                                <Button size="sm" variant="outline" className="w-full">
                                  <Copy className="h-3 w-3 mr-1" />
                                  Clone Agent
                                </Button>
                                <Button size="sm" variant="destructive" className="w-full">
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete Agent
                                </Button>
                              </div>
                            </div>
                          )
                        })()}
                      </ScrollArea>
                    ) : (
                      <div className="flex items-center justify-center h-[500px] text-muted-foreground">
                        Select an agent to view details
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="flex-1 m-0 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Customer Support', type: 'chat', description: 'Handle customer inquiries' },
                { name: 'Content Writer', type: 'text', description: 'Generate marketing content' },
                { name: 'Code Reviewer', type: 'code', description: 'Review code quality' },
                { name: 'Data Analyst', type: 'analysis', description: 'Analyze data patterns' },
                { name: 'Research Assistant', type: 'multimodal', description: 'Research and summarize' },
                { name: 'Workflow Orchestrator', type: 'workflow', description: 'Manage complex workflows' }
              ].map((template, index) => (
                <Card key={index} className="cursor-pointer hover:bg-accent/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {getAgentIcon(template.type as Agent['type'])}
                      <span className="font-medium">{template.name}</span>
                      <Badge className={getTypeColor(template.type as Agent['type'])}>
                        {template.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                    <Button size="sm" className="w-full">
                      <Plus className="h-3 w-3 mr-1" />
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="marketplace" className="flex-1 m-0 p-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Agent Marketplace
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Browse and install pre-built agents from the community
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="flex-1 m-0 p-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Agent Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Default Model Provider</Label>
                  <select className="w-full mt-1 p-2 border rounded">
                    <option>OpenAI</option>
                    <option>Anthropic</option>
                    <option>Cohere</option>
                  </select>
                </div>
                <div>
                  <Label>Auto-backup Agents</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Automatically backup agent configurations</span>
                  </div>
                </div>
                <div>
                  <Label>Analytics Tracking</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Track agent usage and performance metrics</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}