'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  ScrollText,
  Filter,
  Search,
  Download,
  RefreshCw,
  Calendar,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Settings,
  Eye,
  Trash2
} from 'lucide-react'

interface LogEntry {
  id: string
  timestamp: Date
  level: 'info' | 'warn' | 'error' | 'debug' | 'success'
  source: string
  message: string
  context?: Record<string, any>
  duration?: number
  userId?: string
  workflowId?: string
  nodeId?: string
}

export function LogsViewer() {
  const [activeTab, setActiveTab] = useState('realtime')
  const [selectedLog, setSelectedLog] = useState<string | null>(null)
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAutoRefresh, setIsAutoRefresh] = useState(true)
  
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'log-1',
      timestamp: new Date('2024-01-22T10:30:15.234Z'),
      level: 'info',
      source: 'workflow-engine',
      message: 'Workflow execution started',
      context: {
        workflowId: 'wf-123',
        userId: 'user-456',
        trigger: 'webhook'
      },
      workflowId: 'wf-123',
      userId: 'user-456'
    },
    {
      id: 'log-2',
      timestamp: new Date('2024-01-22T10:30:16.891Z'),
      level: 'info',
      source: 'llm-node',
      message: 'GPT-4 processing request',
      context: {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 1000,
        prompt: 'Hello, how can I help you today?'
      },
      duration: 1250,
      workflowId: 'wf-123',
      nodeId: 'node-llm-1'
    },
    {
      id: 'log-3',
      timestamp: new Date('2024-01-22T10:30:18.142Z'),
      level: 'success',
      source: 'llm-node',
      message: 'LLM response generated successfully',
      context: {
        tokens: 45,
        cost: 0.0012,
        response: 'Hello! I\'m here to help you with any questions or tasks you might have...'
      },
      duration: 1251,
      workflowId: 'wf-123',
      nodeId: 'node-llm-1'
    },
    {
      id: 'log-4',
      timestamp: new Date('2024-01-22T10:30:18.398Z'),
      level: 'info',
      source: 'slack-action',
      message: 'Sending message to Slack',
      context: {
        channel: '#general',
        messageType: 'thread_reply',
        threadTs: '1642876215.234'
      },
      workflowId: 'wf-123',
      nodeId: 'node-slack-1'
    },
    {
      id: 'log-5',
      timestamp: new Date('2024-01-22T10:30:19.567Z'),
      level: 'success',
      source: 'slack-action',
      message: 'Message sent to Slack successfully',
      context: {
        messageId: 'msg-789',
        channel: '#general',
        timestamp: '1642876219.567'
      },
      duration: 1169,
      workflowId: 'wf-123',
      nodeId: 'node-slack-1'
    },
    {
      id: 'log-6',
      timestamp: new Date('2024-01-22T10:30:19.789Z'),
      level: 'info',
      source: 'workflow-engine',
      message: 'Workflow execution completed',
      context: {
        workflowId: 'wf-123',
        totalDuration: 4555,
        nodesExecuted: 3,
        status: 'success'
      },
      duration: 4555,
      workflowId: 'wf-123'
    },
    {
      id: 'log-7',
      timestamp: new Date('2024-01-22T10:25:32.111Z'),
      level: 'error',
      source: 'database-query',
      message: 'Database connection failed',
      context: {
        error: 'Connection timeout after 30 seconds',
        host: 'db.example.com',
        database: 'production',
        query: 'SELECT * FROM users WHERE active = true'
      },
      workflowId: 'wf-124',
      nodeId: 'node-db-1'
    },
    {
      id: 'log-8',
      timestamp: new Date('2024-01-22T10:25:30.456Z'),
      level: 'warn',
      source: 'rate-limiter',
      message: 'Rate limit approaching threshold',
      context: {
        currentRequests: 850,
        limit: 1000,
        resetTime: '2024-01-22T11:00:00Z',
        userId: 'user-789'
      },
      userId: 'user-789'
    },
    {
      id: 'log-9',
      timestamp: new Date('2024-01-22T10:20:15.333Z'),
      level: 'debug',
      source: 'webhook-handler',
      message: 'Processing incoming webhook',
      context: {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'user-agent': 'Slack-Hooks/1.0'
        },
        payload: '{"text": "Hello world", "channel": "#general"}'
      },
      workflowId: 'wf-125'
    }
  ])

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      case 'warn': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info': return <Info className="h-4 w-4 text-blue-500" />
      case 'debug': return <Settings className="h-4 w-4 text-gray-500" />
      default: return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getLevelBadge = (level: LogEntry['level']) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      warn: 'secondary',
      info: 'outline',
      debug: 'outline'
    } as const
    
    return (
      <Badge variant={variants[level]} className="text-xs">
        {level.toUpperCase()}
      </Badge>
    )
  }

  const getLevelColor = (level: LogEntry['level']) => {
    const colors = {
      success: 'text-green-600',
      error: 'text-red-600',
      warn: 'text-yellow-600',
      info: 'text-blue-600',
      debug: 'text-gray-600'
    }
    return colors[level] || 'text-gray-600'
  }

  const filteredLogs = logs.filter(log => {
    const matchesLevel = filterLevel === 'all' || log.level === filterLevel
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.source.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesLevel && matchesSearch
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDuration = (duration: number) => {
    if (duration < 1000) return `${duration}ms`
    return `${(duration / 1000).toFixed(2)}s`
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ScrollText className="h-5 w-5" />
              Logs Viewer
            </h2>
            <p className="text-sm text-muted-foreground">
              Monitor workflow execution logs and system events
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="auto-refresh"
                checked={isAutoRefresh}
                onChange={(e) => setIsAutoRefresh(e.target.checked)}
              />
              <label htmlFor="auto-refresh" className="text-sm">Auto-refresh</label>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="w-full justify-start border-b rounded-none h-12 bg-transparent p-0">
            <TabsTrigger value="realtime" className="rounded-none">Real-time</TabsTrigger>
            <TabsTrigger value="history" className="rounded-none">History</TabsTrigger>
            <TabsTrigger value="errors" className="rounded-none">Errors</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-none">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="realtime" className="flex-1 m-0 p-4">
            {/* Filters */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Levels</option>
                <option value="debug">Debug</option>
                <option value="info">Info</option>
                <option value="warn">Warning</option>
                <option value="error">Error</option>
                <option value="success">Success</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
              {/* Logs List */}
              <div className="xl:col-span-2">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Log Stream</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {filteredLogs.length} entries
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ScrollArea className="h-[calc(100vh-350px)]">
                      <div className="space-y-2 font-mono text-xs">
                        {filteredLogs.map((log) => (
                          <div
                            key={log.id}
                            className={`p-3 border rounded cursor-pointer transition-colors ${
                              selectedLog === log.id ? 'bg-accent' : 'hover:bg-accent/50'
                            }`}
                            onClick={() => setSelectedLog(log.id)}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">
                                  {formatTimestamp(log.timestamp)}
                                </span>
                                {getLevelIcon(log.level)}
                                {getLevelBadge(log.level)}
                                <span className="text-muted-foreground text-xs">
                                  {log.source}
                                </span>
                              </div>
                              {log.duration && (
                                <Badge variant="outline" className="text-xs">
                                  {formatDuration(log.duration)}
                                </Badge>
                              )}
                            </div>
                            
                            <div className={`font-medium ${getLevelColor(log.level)}`}>
                              {log.message}
                            </div>
                            
                            {log.context && Object.keys(log.context).length > 0 && (
                              <div className="mt-2 text-muted-foreground text-xs">
                                {Object.entries(log.context).slice(0, 2).map(([key, value]) => (
                                  <span key={key} className="mr-4">
                                    {key}: {typeof value === 'string' ? value.substring(0, 30) + (value.length > 30 ? '...' : '') : JSON.stringify(value)}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              {log.workflowId && (
                                <span>Workflow: {log.workflowId}</span>
                              )}
                              {log.nodeId && (
                                <span>Node: {log.nodeId}</span>
                              )}
                              {log.userId && (
                                <span>User: {log.userId}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Log Details */}
              <div>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Log Details</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {selectedLog ? (
                      <ScrollArea className="h-[calc(100vh-450px)]">
                        {(() => {
                          const log = logs.find(l => l.id === selectedLog)
                          if (!log) return null
                          
                          return (
                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium">Timestamp</Label>
                                <p className="text-sm font-mono">
                                  {log.timestamp.toISOString()}
                                </p>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Level</Label>
                                  <div className="flex items-center gap-2 mt-1">
                                    {getLevelIcon(log.level)}
                                    {getLevelBadge(log.level)}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Source</Label>
                                  <p className="text-sm mt-1">{log.source}</p>
                                </div>
                              </div>
                              
                              {log.duration && (
                                <div>
                                  <Label className="text-sm font-medium">Duration</Label>
                                  <p className="text-sm mt-1">{formatDuration(log.duration)}</p>
                                </div>
                              )}
                              
                              <div>
                                <Label className="text-sm font-medium">Message</Label>
                                <p className="text-sm mt-1 p-2 bg-muted rounded">
                                  {log.message}
                                </p>
                              </div>
                              
                              <Separator />
                              
                              <div>
                                <Label className="text-sm font-medium">Identifiers</Label>
                                <div className="space-y-2 mt-2 text-sm">
                                  {log.workflowId && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Workflow ID:</span>
                                      <span className="font-mono">{log.workflowId}</span>
                                    </div>
                                  )}
                                  {log.nodeId && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Node ID:</span>
                                      <span className="font-mono">{log.nodeId}</span>
                                    </div>
                                  )}
                                  {log.userId && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">User ID:</span>
                                      <span className="font-mono">{log.userId}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {log.context && Object.keys(log.context).length > 0 && (
                                <div>
                                  <Label className="text-sm font-medium">Context Data</Label>
                                  <pre className="mt-1 p-3 bg-muted rounded text-xs font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
                                    {JSON.stringify(log.context, null, 2)}
                                  </pre>
                                </div>
                              )}
                              
                              <div className="flex flex-col gap-2 pt-2">
                                <Button size="sm" variant="outline" className="w-full">
                                  <Eye className="h-3 w-3 mr-1" />
                                  View Full Context
                                </Button>
                                <Button size="sm" variant="outline" className="w-full">
                                  <Download className="h-3 w-3 mr-1" />
                                  Export Entry
                                </Button>
                              </div>
                            </div>
                          )
                        })()}
                      </ScrollArea>
                    ) : (
                      <div className="flex items-center justify-center h-[calc(100vh-450px)] text-muted-foreground">
                        Select a log entry to view details
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="flex-1 m-0 p-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Historical Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <Label>Date Range</Label>
                    <select className="w-full mt-1 p-2 border rounded">
                      <option>Last 24 hours</option>
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>Custom range</option>
                    </select>
                  </div>
                  <div>
                    <Label>Workflow</Label>
                    <select className="w-full mt-1 p-2 border rounded">
                      <option>All workflows</option>
                      <option>wf-123</option>
                      <option>wf-124</option>
                      <option>wf-125</option>
                    </select>
                  </div>
                  <div>
                    <Label>Log Level</Label>
                    <select className="w-full mt-1 p-2 border rounded">
                      <option>All levels</option>
                      <option>Errors only</option>
                      <option>Warnings & Errors</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button className="w-full">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Historical log search results would be displayed here
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="errors" className="flex-1 m-0 p-4">
            <div className="space-y-4">
              {logs.filter(log => log.level === 'error').map((log) => (
                <Card key={log.id} className="border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="font-medium">{log.message}</span>
                        <Badge variant="destructive" className="text-xs">ERROR</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Source: {log.source}
                    </div>
                    {log.context && (
                      <pre className="text-xs bg-red-50 p-2 rounded mt-2">
                        {JSON.stringify(log.context, null, 2)}
                      </pre>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="flex-1 m-0 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Logs</p>
                      <p className="text-2xl font-bold">{logs.length}</p>
                    </div>
                    <ScrollText className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Errors</p>
                      <p className="text-2xl font-bold text-red-600">
                        {logs.filter(l => l.level === 'error').length}
                      </p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Warnings</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {logs.filter(l => l.level === 'warn').length}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                      <p className="text-2xl font-bold text-green-600">
                        {Math.round((logs.filter(l => l.level === 'success').length / logs.length) * 100)}%
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Log Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Detailed log analytics and trends would be displayed here
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}