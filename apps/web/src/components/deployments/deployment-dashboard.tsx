'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Plus,
  Rocket,
  Globe,
  Settings,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  BarChart3,
  RefreshCw,
  ExternalLink,
  Copy,
  MoreHorizontal,
  Trash2,
  Play,
  Square,
  GitBranch
} from 'lucide-react'

interface Deployment {
  id: string
  name: string
  workflow: {
    id: string
    name: string
  }
  environment: 'development' | 'staging' | 'production'
  status: 'pending' | 'deploying' | 'active' | 'failed' | 'stopped'
  url?: string
  version: string
  deployedAt?: string
  createdAt: string
  metrics: {
    requests: number
    errors: number
    latency: number
    uptime: number
  }
}

const mockDeployments: Deployment[] = [
  {
    id: '1',
    name: 'Customer Support Bot',
    workflow: { id: 'w1', name: 'Customer Support Workflow' },
    environment: 'production',
    status: 'active',
    url: 'https://bot.example.com',
    version: 'v1.2.0',
    deployedAt: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-15T10:00:00Z',
    metrics: {
      requests: 15420,
      errors: 23,
      latency: 245,
      uptime: 99.8
    }
  },
  {
    id: '2',
    name: 'Lead Qualification',
    workflow: { id: 'w2', name: 'Lead Processing Pipeline' },
    environment: 'staging',
    status: 'active',
    url: 'https://staging-leads.example.com',
    version: 'v2.1.0-rc.1',
    deployedAt: '2024-01-14T15:45:00Z',
    createdAt: '2024-01-14T15:30:00Z',
    metrics: {
      requests: 892,
      errors: 5,
      latency: 180,
      uptime: 99.9
    }
  },
  {
    id: '3',
    name: 'Document Processor',
    workflow: { id: 'w3', name: 'AI Document Analysis' },
    environment: 'development',
    status: 'deploying',
    version: 'v0.8.3',
    createdAt: '2024-01-16T09:15:00Z',
    metrics: {
      requests: 0,
      errors: 0,
      latency: 0,
      uptime: 0
    }
  },
  {
    id: '4',
    name: 'Content Generator',
    workflow: { id: 'w4', name: 'AI Content Pipeline' },
    environment: 'production',
    status: 'failed',
    version: 'v1.0.1',
    createdAt: '2024-01-16T08:00:00Z',
    metrics: {
      requests: 127,
      errors: 127,
      latency: 0,
      uptime: 0
    }
  }
]

const getStatusColor = (status: Deployment['status']) => {
  switch (status) {
    case 'active':
      return 'bg-green-500'
    case 'deploying':
      return 'bg-blue-500'
    case 'pending':
      return 'bg-yellow-500'
    case 'failed':
      return 'bg-red-500'
    case 'stopped':
      return 'bg-gray-500'
    default:
      return 'bg-gray-500'
  }
}

const getStatusIcon = (status: Deployment['status']) => {
  switch (status) {
    case 'active':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'deploying':
      return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />
    case 'failed':
      return <AlertCircle className="h-4 w-4 text-red-500" />
    case 'stopped':
      return <Square className="h-4 w-4 text-gray-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-500" />
  }
}

const getEnvironmentColor = (env: Deployment['environment']) => {
  switch (env) {
    case 'production':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'staging':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'development':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function DeploymentDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [deployments] = useState<Deployment[]>(mockDeployments)

  const activeDeployments = deployments.filter(d => d.status === 'active')
  const failedDeployments = deployments.filter(d => d.status === 'failed')
  const totalRequests = deployments.reduce((sum, d) => sum + d.metrics.requests, 0)
  const totalErrors = deployments.reduce((sum, d) => sum + d.metrics.errors, 0)
  const avgUptime = deployments.length > 0 
    ? deployments.reduce((sum, d) => sum + d.metrics.uptime, 0) / deployments.length 
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Deployments</h2>
          <p className="text-muted-foreground">
            Manage and monitor your workflow deployments
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Deployment
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deployments</CardTitle>
            <Rocket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDeployments.length}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
              {deployments.length} total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Zap className="h-3 w-3 text-blue-500 mr-1" />
              Last 24 hours
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(2) : 0}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {failedDeployments.length > 0 && (
                <>
                  <AlertCircle className="h-3 w-3 text-red-500 mr-1" />
                  {failedDeployments.length} failed
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Uptime</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgUptime.toFixed(1)}%</div>
            <Progress value={avgUptime} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {deployments.map((deployment) => (
              <Card key={deployment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(deployment.status)}
                        <div>
                          <h3 className="font-semibold">{deployment.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {deployment.workflow.name}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline" 
                        className={getEnvironmentColor(deployment.environment)}
                      >
                        {deployment.environment}
                      </Badge>
                      <Badge variant="outline">
                        {deployment.version}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Status</p>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(deployment.status)}`} />
                        <span className="text-sm capitalize">{deployment.status}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Requests</p>
                      <p className="text-sm text-muted-foreground">
                        {deployment.metrics.requests.toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Latency</p>
                      <p className="text-sm text-muted-foreground">
                        {deployment.metrics.latency}ms avg
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Uptime</p>
                      <p className="text-sm text-muted-foreground">
                        {deployment.metrics.uptime}%
                      </p>
                    </div>
                  </div>
                  
                  {deployment.url && (
                    <>
                      <Separator className="my-4" />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-mono">{deployment.url}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Copy className="h-4 w-4 mr-2" />
                            Copy URL
                          </Button>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                  
                  <Separator className="my-4" />
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {deployment.deployedAt 
                        ? `Deployed ${new Date(deployment.deployedAt).toLocaleDateString()}`
                        : `Created ${new Date(deployment.createdAt).toLocaleDateString()}`
                      }
                    </div>
                    <div className="flex items-center space-x-2">
                      {deployment.status === 'active' && (
                        <Button variant="outline" size="sm">
                          <Square className="h-4 w-4 mr-2" />
                          Stop
                        </Button>
                      )}
                      {deployment.status === 'stopped' && (
                        <Button variant="outline" size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Start
                        </Button>
                      )}
                      {deployment.status === 'failed' && (
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Redeploy
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {activeDeployments.map((deployment) => (
              <Card key={deployment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{deployment.name}</h3>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        Active
                      </Badge>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Metrics
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Requests (24h)</p>
                      <p className="text-2xl font-bold">{deployment.metrics.requests.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Avg Latency</p>
                      <p className="text-2xl font-bold">{deployment.metrics.latency}ms</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Uptime</p>
                      <p className="text-2xl font-bold">{deployment.metrics.uptime}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deployment History</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {deployments.map((deployment) => (
                    <div key={deployment.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(deployment.status)}
                        <div>
                          <p className="font-medium">{deployment.name}</p>
                          <p className="text-sm text-muted-foreground">{deployment.version}</p>
                        </div>
                      </div>
                      <div className="flex-1" />
                      <Badge variant="outline" className={getEnvironmentColor(deployment.environment)}>
                        {deployment.environment}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        {new Date(deployment.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Default Environment</h4>
                <p className="text-sm text-muted-foreground">
                  Choose the default environment for new deployments
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Auto-scaling</h4>
                <p className="text-sm text-muted-foreground">
                  Configure automatic scaling based on request volume
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Monitoring</h4>
                <p className="text-sm text-muted-foreground">
                  Set up alerts and monitoring for your deployments
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}