'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Rocket,
  Globe,
  Activity,
  Zap,
  Settings,
  Copy,
  ExternalLink,
  Play,
  Square,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Database,
  Shield,
  BarChart3
} from 'lucide-react'

interface DeploymentPanelProps {
  workflowId?: string
}

interface Deployment {
  id: string
  name: string
  environment: 'development' | 'staging' | 'production'
  status: 'pending' | 'deploying' | 'active' | 'failed' | 'inactive'
  endpoint: string
  region: string[]
  version: string
  createdAt: Date
  lastDeployment?: Date
  metrics: {
    requests: number
    errors: number
    latency: number
    uptime: number
  }
}

export function DeploymentPanel({ workflowId }: DeploymentPanelProps) {
  const [activeTab, setActiveTab] = useState('deployments')
  const [isDeploying, setIsDeploying] = useState(false)
  const [selectedDeployment, setSelectedDeployment] = useState<string | null>(null)
  
  const [deployments, setDeployments] = useState<Deployment[]>([
    {
      id: 'deploy-1',
      name: 'Production API',
      environment: 'production',
      status: 'active',
      endpoint: 'https://api-prod.lamatic.ai/workflows/workflow-123',
      region: ['us-east-1', 'eu-west-1'],
      version: 'v1.2.3',
      createdAt: new Date('2024-01-15'),
      lastDeployment: new Date('2024-01-20'),
      metrics: {
        requests: 145200,
        errors: 12,
        latency: 245,
        uptime: 99.9
      }
    },
    {
      id: 'deploy-2', 
      name: 'Staging Environment',
      environment: 'staging',
      status: 'active',
      endpoint: 'https://api-staging.lamatic.ai/workflows/workflow-123',
      region: ['us-east-1'],
      version: 'v1.3.0-beta',
      createdAt: new Date('2024-01-18'),
      lastDeployment: new Date('2024-01-22'),
      metrics: {
        requests: 8432,
        errors: 3,
        latency: 198,
        uptime: 99.5
      }
    },
    {
      id: 'deploy-3',
      name: 'Development Build',
      environment: 'development',
      status: 'failed',
      endpoint: 'https://api-dev.lamatic.ai/workflows/workflow-123',
      region: ['us-east-1'],
      version: 'v1.3.1-alpha',
      createdAt: new Date('2024-01-22'),
      lastDeployment: new Date('2024-01-22'),
      metrics: {
        requests: 234,
        errors: 15,
        latency: 892,
        uptime: 85.2
      }
    }
  ])

  const handleDeploy = async (environment: string) => {
    setIsDeploying(true)
    
    // Simulate deployment process
    const newDeployment: Deployment = {
      id: `deploy-${Date.now()}`,
      name: `${environment.charAt(0).toUpperCase() + environment.slice(1)} Deployment`,
      environment: environment as any,
      status: 'deploying',
      endpoint: `https://api-${environment}.lamatic.ai/workflows/${workflowId}`,
      region: ['us-east-1'],
      version: 'v1.3.2',
      createdAt: new Date(),
      metrics: {
        requests: 0,
        errors: 0,
        latency: 0,
        uptime: 0
      }
    }
    
    setDeployments(prev => [newDeployment, ...prev])
    
    // Simulate deployment steps
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setDeployments(prev => prev.map(d => 
      d.id === newDeployment.id 
        ? { ...d, status: Math.random() > 0.2 ? 'active' : 'failed' as any }
        : d
    ))
    
    setIsDeploying(false)
  }

  const getStatusIcon = (status: Deployment['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'deploying': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      case 'inactive': return <Square className="h-4 w-4 text-gray-400" />
      default: return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: Deployment['status']) => {
    const variants = {
      active: 'default',
      failed: 'destructive',
      deploying: 'secondary', 
      inactive: 'outline',
      pending: 'outline'
    } as const
    
    return (
      <Badge variant={variants[status]}>
        {status}
      </Badge>
    )
  }

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'production': return 'bg-red-100 text-red-800'
      case 'staging': return 'bg-yellow-100 text-yellow-800'
      case 'development': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              Deployments
            </h2>
            <p className="text-sm text-muted-foreground">
              Deploy and manage your workflow across different environments
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleDeploy('development')}
              disabled={isDeploying}
              variant="outline"
              size="sm"
            >
              Deploy to Dev
            </Button>
            <Button
              onClick={() => handleDeploy('production')}
              disabled={isDeploying}
              size="sm"
            >
              <Rocket className="h-4 w-4 mr-1" />
              Deploy to Prod
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="w-full justify-start border-b rounded-none h-12 bg-transparent p-0">
            <TabsTrigger value="deployments" className="rounded-none">Deployments</TabsTrigger>
            <TabsTrigger value="config" className="rounded-none">Configuration</TabsTrigger>
            <TabsTrigger value="metrics" className="rounded-none">Metrics</TabsTrigger>
            <TabsTrigger value="logs" className="rounded-none">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="deployments" className="flex-1 m-0 p-4">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
              {/* Deployments List */}
              <div className="xl:col-span-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Active Deployments</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-3">
                        {deployments.map((deployment) => (
                          <div
                            key={deployment.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              selectedDeployment === deployment.id ? 'bg-accent' : 'hover:bg-accent/50'
                            }`}
                            onClick={() => setSelectedDeployment(deployment.id)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(deployment.status)}
                                <span className="font-medium">{deployment.name}</span>
                                <Badge className={getEnvironmentColor(deployment.environment)}>
                                  {deployment.environment}
                                </Badge>
                              </div>
                              {getStatusBadge(deployment.status)}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                              <div>
                                <span className="font-medium">Version:</span> {deployment.version}
                              </div>
                              <div>
                                <span className="font-medium">Regions:</span> {deployment.region.join(', ')}
                              </div>
                              <div>
                                <span className="font-medium">Requests:</span> {deployment.metrics.requests.toLocaleString()}
                              </div>
                              <div>
                                <span className="font-medium">Uptime:</span> {deployment.metrics.uptime}%
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-3">
                              <Button size="sm" variant="outline" className="h-7">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Open
                              </Button>
                              <Button size="sm" variant="outline" className="h-7">
                                <Copy className="h-3 w-3 mr-1" />
                                Copy URL
                              </Button>
                              <Button size="sm" variant="outline" className="h-7">
                                <Settings className="h-3 w-3 mr-1" />
                                Settings
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Deployment Details */}
              <div>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Deployment Details</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {selectedDeployment ? (
                      <ScrollArea className="h-[500px]">
                        {(() => {
                          const deployment = deployments.find(d => d.id === selectedDeployment)
                          if (!deployment) return null
                          
                          return (
                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium">Endpoint</Label>
                                <div className="flex items-center gap-2 mt-1">
                                  <Input 
                                    value={deployment.endpoint} 
                                    readOnly 
                                    className="text-xs"
                                  />
                                  <Button size="sm" variant="outline">
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Status</Label>
                                  <div className="flex items-center gap-2 mt-1">
                                    {getStatusIcon(deployment.status)}
                                    <span className="text-sm">{deployment.status}</span>
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Environment</Label>
                                  <Badge className={`${getEnvironmentColor(deployment.environment)} mt-1`}>
                                    {deployment.environment}
                                  </Badge>
                                </div>
                              </div>
                              
                              <Separator />
                              
                              <div>
                                <Label className="text-sm font-medium">Performance Metrics</Label>
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                  <div className="p-2 bg-muted rounded">
                                    <div className="flex items-center gap-1">
                                      <Activity className="h-3 w-3" />
                                      <span className="text-xs">Requests</span>
                                    </div>
                                    <p className="text-sm font-medium">{deployment.metrics.requests.toLocaleString()}</p>
                                  </div>
                                  <div className="p-2 bg-muted rounded">
                                    <div className="flex items-center gap-1">
                                      <AlertCircle className="h-3 w-3" />
                                      <span className="text-xs">Errors</span>
                                    </div>
                                    <p className="text-sm font-medium">{deployment.metrics.errors}</p>
                                  </div>
                                  <div className="p-2 bg-muted rounded">
                                    <div className="flex items-center gap-1">
                                      <Zap className="h-3 w-3" />
                                      <span className="text-xs">Latency</span>
                                    </div>
                                    <p className="text-sm font-medium">{deployment.metrics.latency}ms</p>
                                  </div>
                                  <div className="p-2 bg-muted rounded">
                                    <div className="flex items-center gap-1">
                                      <CheckCircle className="h-3 w-3" />
                                      <span className="text-xs">Uptime</span>
                                    </div>
                                    <p className="text-sm font-medium">{deployment.metrics.uptime}%</p>
                                  </div>
                                </div>
                              </div>
                              
                              <Separator />
                              
                              <div>
                                <Label className="text-sm font-medium">Deployment Info</Label>
                                <div className="space-y-2 mt-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Version:</span>
                                    <span>{deployment.version}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Regions:</span>
                                    <span>{deployment.region.join(', ')}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Created:</span>
                                    <span>{deployment.createdAt.toLocaleDateString()}</span>
                                  </div>
                                  {deployment.lastDeployment && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Last Deploy:</span>
                                      <span>{deployment.lastDeployment.toLocaleDateString()}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex flex-col gap-2 pt-2">
                                <Button size="sm" className="w-full">
                                  <Play className="h-3 w-3 mr-1" />
                                  Restart Deployment
                                </Button>
                                <Button size="sm" variant="outline" className="w-full">
                                  <Settings className="h-3 w-3 mr-1" />
                                  Configure
                                </Button>
                                <Button size="sm" variant="destructive" className="w-full">
                                  <Square className="h-3 w-3 mr-1" />
                                  Stop Deployment
                                </Button>
                              </div>
                            </div>
                          )
                        })()}
                      </ScrollArea>
                    ) : (
                      <div className="flex items-center justify-center h-[500px] text-muted-foreground">
                        Select a deployment to view details
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="config" className="flex-1 m-0 p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Deployment Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Environment</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select environment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="staging">Staging</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Regions</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select regions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                        <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                        <SelectItem value="eu-west-1">Europe (Ireland)</SelectItem>
                        <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Auto Scaling</Label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <div>
                        <Label className="text-xs">Min</Label>
                        <Input type="number" defaultValue="1" />
                      </div>
                      <div>
                        <Label className="text-xs">Max</Label>
                        <Input type="number" defaultValue="10" />
                      </div>
                      <div>
                        <Label className="text-xs">Target</Label>
                        <Input type="number" defaultValue="3" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security & Access
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>API Key Management</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input value="sk-..." readOnly />
                      <Button size="sm" variant="outline">Regenerate</Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Rate Limiting</Label>
                    <Input type="number" defaultValue="1000" className="mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">Requests per minute</p>
                  </div>
                  
                  <div>
                    <Label>CORS Origins</Label>
                    <Input placeholder="https://yourdomain.com" className="mt-1" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="flex-1 m-0 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Requests</p>
                      <p className="text-2xl font-bold">153,632</p>
                    </div>
                    <Activity className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Error Rate</p>
                      <p className="text-2xl font-bold">0.08%</p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Latency</p>
                      <p className="text-2xl font-bold">245ms</p>
                    </div>
                    <Zap className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Cost</p>
                      <p className="text-2xl font-bold">$127</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Detailed performance charts and analytics would be displayed here
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="flex-1 m-0 p-4">
            <Card>
              <CardHeader>
                <CardTitle>Deployment Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="font-mono text-xs space-y-1">
                    <div className="text-muted-foreground">[2024-01-22 10:30:15] Starting deployment...</div>
                    <div className="text-blue-600">[2024-01-22 10:30:16] Building workflow bundle...</div>
                    <div className="text-green-600">[2024-01-22 10:30:18] Bundle created successfully</div>
                    <div className="text-blue-600">[2024-01-22 10:30:19] Deploying to edge locations...</div>
                    <div className="text-green-600">[2024-01-22 10:30:22] Deployed to us-east-1</div>
                    <div className="text-green-600">[2024-01-22 10:30:24] Deployed to eu-west-1</div>
                    <div className="text-green-600">[2024-01-22 10:30:25] Deployment completed successfully</div>
                    <div className="text-muted-foreground">[2024-01-22 10:30:26] Health checks passed</div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}