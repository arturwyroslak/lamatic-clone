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
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Users,
  Activity,
  Download,
  Share,
  Calendar,
  Filter,
  RefreshCw,
  Eye,
  Settings,
  AlertTriangle,
  CheckCircle,
  Zap
} from 'lucide-react'

interface Report {
  id: string
  name: string
  type: 'performance' | 'usage' | 'cost' | 'errors' | 'custom'
  description: string
  lastUpdated: Date
  schedule: string
  status: 'active' | 'inactive' | 'processing'
  format: 'dashboard' | 'pdf' | 'csv' | 'json'
}

interface Metric {
  name: string
  value: number | string
  change: number
  trend: 'up' | 'down' | 'stable'
  icon: React.ReactNode
  color: string
}

export function ReportsViewer() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState('7d')
  
  const [reports, setReports] = useState<Report[]>([
    {
      id: 'report-1',
      name: 'Performance Overview',
      type: 'performance',
      description: 'Workflow execution times and success rates',
      lastUpdated: new Date('2024-01-22T10:30:00'),
      schedule: 'Daily',
      status: 'active',
      format: 'dashboard'
    },
    {
      id: 'report-2',
      name: 'Usage Analytics',
      type: 'usage',
      description: 'API calls, user activity, and resource utilization',
      lastUpdated: new Date('2024-01-22T09:15:00'),
      schedule: 'Hourly',
      status: 'active',
      format: 'dashboard'
    },
    {
      id: 'report-3',
      name: 'Cost Analysis',
      type: 'cost',
      description: 'Monthly spending breakdown by service and user',
      lastUpdated: new Date('2024-01-22T08:00:00'),
      schedule: 'Daily',
      status: 'active',
      format: 'pdf'
    },
    {
      id: 'report-4',
      name: 'Error Summary',
      type: 'errors',
      description: 'Failed workflows and error patterns',
      lastUpdated: new Date('2024-01-22T07:30:00'),
      schedule: 'Every 6 hours',
      status: 'processing',
      format: 'dashboard'
    }
  ])

  const [metrics] = useState<Metric[]>([
    {
      name: 'Total Workflows',
      value: '1,247',
      change: 12.5,
      trend: 'up',
      icon: <Activity className="h-5 w-5" />,
      color: 'text-blue-600'
    },
    {
      name: 'Success Rate',
      value: '98.2%',
      change: 0.8,
      trend: 'up',
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'text-green-600'
    },
    {
      name: 'Avg Response Time',
      value: '245ms',
      change: -15.2,
      trend: 'down',
      icon: <Clock className="h-5 w-5" />,
      color: 'text-orange-600'
    },
    {
      name: 'Monthly Cost',
      value: '$1,234',
      change: 8.7,
      trend: 'up',
      icon: <DollarSign className="h-5 w-5" />,
      color: 'text-purple-600'
    },
    {
      name: 'Active Users',
      value: '89',
      change: 23.1,
      trend: 'up',
      icon: <Users className="h-5 w-5" />,
      color: 'text-indigo-600'
    },
    {
      name: 'API Calls',
      value: '45.2K',
      change: 18.9,
      trend: 'up',
      icon: <Zap className="h-5 w-5" />,
      color: 'text-pink-600'
    },
    {
      name: 'Error Rate',
      value: '1.8%',
      change: -0.3,
      trend: 'down',
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'text-red-600'
    },
    {
      name: 'Uptime',
      value: '99.9%',
      change: 0.1,
      trend: 'stable',
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-emerald-600'
    }
  ])

  const getReportIcon = (type: Report['type']) => {
    switch (type) {
      case 'performance': return <BarChart3 className="h-4 w-4" />
      case 'usage': return <Activity className="h-4 w-4" />
      case 'cost': return <DollarSign className="h-4 w-4" />
      case 'errors': return <AlertTriangle className="h-4 w-4" />
      case 'custom': return <Settings className="h-4 w-4" />
      default: return <BarChart3 className="h-4 w-4" />
    }
  }

  const getReportColor = (type: Report['type']) => {
    const colors = {
      performance: 'bg-blue-100 text-blue-800',
      usage: 'bg-green-100 text-green-800',
      cost: 'bg-purple-100 text-purple-800',
      errors: 'bg-red-100 text-red-800',
      custom: 'bg-gray-100 text-gray-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const getStatusBadge = (status: Report['status']) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      processing: 'outline'
    } as const
    
    return (
      <Badge variant={variants[status]}>
        {status}
      </Badge>
    )
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />
      case 'stable': return <div className="h-4 w-4 border-b-2 border-gray-400" />
    }
  }

  const formatChange = (change: number) => {
    const sign = change > 0 ? '+' : ''
    return `${sign}${change}%`
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Reports & Analytics
            </h2>
            <p className="text-sm text-muted-foreground">
              Monitor performance, usage, and business metrics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
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
            <TabsTrigger value="dashboard" className="rounded-none">Dashboard</TabsTrigger>
            <TabsTrigger value="reports" className="rounded-none">Reports</TabsTrigger>
            <TabsTrigger value="custom" className="rounded-none">Custom Reports</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-none">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="flex-1 m-0 p-4">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {metrics.map((metric, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className={metric.color}>
                          {metric.icon}
                        </div>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(metric.trend)}
                          <span className={`text-xs ${
                            metric.change > 0 ? 'text-green-600' : 
                            metric.change < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {formatChange(metric.change)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{metric.name}</p>
                        <p className="text-2xl font-bold">{metric.value}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Workflow Executions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      Workflow execution chart would be displayed here
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Response Times</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      Response time trends chart would be displayed here
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Usage Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Top Workflows</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { name: 'Customer Support Bot', executions: 456, percentage: 35 },
                        { name: 'Data Processing', executions: 312, percentage: 24 },
                        { name: 'Email Automation', executions: 234, percentage: 18 },
                        { name: 'Lead Generation', executions: 189, percentage: 14 },
                        { name: 'Report Generator', executions: 123, percentage: 9 }
                      ].map((workflow, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{workflow.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {workflow.executions}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${workflow.percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Model Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { model: 'GPT-4', usage: 45, cost: '$234.56' },
                        { model: 'GPT-3.5 Turbo', usage: 30, cost: '$89.23' },
                        { model: 'Claude 3 Sonnet', usage: 15, cost: '$156.78' },
                        { model: 'Claude 3 Haiku', usage: 10, cost: '$45.12' }
                      ].map((model, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{model.model}</p>
                            <p className="text-xs text-muted-foreground">{model.cost}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">{model.usage}%</p>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${model.usage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Error Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { error: 'Rate Limit Exceeded', count: 12, severity: 'medium' },
                        { error: 'Database Timeout', count: 8, severity: 'high' },
                        { error: 'Invalid API Key', count: 5, severity: 'low' },
                        { error: 'Model Unavailable', count: 3, severity: 'high' }
                      ].map((error, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{error.error}</p>
                            <Badge
                              variant={error.severity === 'high' ? 'destructive' : 
                                     error.severity === 'medium' ? 'secondary' : 'outline'}
                              className="text-xs mt-1"
                            >
                              {error.severity}
                            </Badge>
                          </div>
                          <span className="text-sm font-medium">{error.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="reports" className="flex-1 m-0 p-4">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
              {/* Reports List */}
              <div className="xl:col-span-2">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Available Reports</CardTitle>
                      <Button size="sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        Schedule Report
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ScrollArea className="h-[calc(100vh-350px)]">
                      <div className="space-y-3">
                        {reports.map((report) => (
                          <div
                            key={report.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              selectedReport === report.id ? 'bg-accent' : 'hover:bg-accent/50'
                            }`}
                            onClick={() => setSelectedReport(report.id)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getReportIcon(report.type)}
                                <span className="font-medium">{report.name}</span>
                                <Badge className={getReportColor(report.type)}>
                                  {report.type}
                                </Badge>
                              </div>
                              {getStatusBadge(report.status)}
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-3">
                              {report.description}
                            </p>
                            
                            <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                              <div>
                                <span className="font-medium">Schedule:</span> {report.schedule}
                              </div>
                              <div>
                                <span className="font-medium">Format:</span> {report.format}
                              </div>
                              <div>
                                <span className="font-medium">Updated:</span>{' '}
                                {report.lastUpdated.toLocaleDateString()}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-3">
                              <Button size="sm" variant="outline" className="h-7">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button size="sm" variant="outline" className="h-7">
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                              <Button size="sm" variant="outline" className="h-7">
                                <Share className="h-3 w-3 mr-1" />
                                Share
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Report Preview */}
              <div>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Report Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {selectedReport ? (
                      <ScrollArea className="h-[calc(100vh-450px)]">
                        {(() => {
                          const report = reports.find(r => r.id === selectedReport)
                          if (!report) return null
                          
                          return (
                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium">Name</Label>
                                <p className="text-sm">{report.name}</p>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium">Description</Label>
                                <p className="text-sm text-muted-foreground">{report.description}</p>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Type</Label>
                                  <Badge className={`${getReportColor(report.type)} mt-1`}>
                                    {report.type}
                                  </Badge>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Status</Label>
                                  <div className="mt-1">
                                    {getStatusBadge(report.status)}
                                  </div>
                                </div>
                              </div>
                              
                              <Separator />
                              
                              <div>
                                <Label className="text-sm font-medium">Configuration</Label>
                                <div className="space-y-2 mt-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Schedule:</span>
                                    <span>{report.schedule}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Format:</span>
                                    <span>{report.format}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Last Updated:</span>
                                    <span>{report.lastUpdated.toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium">Report Preview</Label>
                                <div className="mt-2 p-3 bg-muted rounded">
                                  <div className="text-xs text-muted-foreground mb-2">
                                    Sample data for {report.name}
                                  </div>
                                  <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                      <span>Total Executions:</span>
                                      <span>1,247</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Success Rate:</span>
                                      <span>98.2%</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Avg Response:</span>
                                      <span>245ms</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Total Cost:</span>
                                      <span>$1,234</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-col gap-2 pt-2">
                                <Button size="sm" className="w-full">
                                  <Eye className="h-3 w-3 mr-1" />
                                  View Full Report
                                </Button>
                                <Button size="sm" variant="outline" className="w-full">
                                  <Download className="h-3 w-3 mr-1" />
                                  Download Report
                                </Button>
                                <Button size="sm" variant="outline" className="w-full">
                                  <Settings className="h-3 w-3 mr-1" />
                                  Configure
                                </Button>
                                <Button size="sm" variant="outline" className="w-full">
                                  <Share className="h-3 w-3 mr-1" />
                                  Share Report
                                </Button>
                              </div>
                            </div>
                          )
                        })()}
                      </ScrollArea>
                    ) : (
                      <div className="flex items-center justify-center h-[calc(100vh-450px)] text-muted-foreground">
                        Select a report to preview
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="custom" className="flex-1 m-0 p-4">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Create Custom Report</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Report Name</Label>
                      <Input placeholder="Enter report name..." className="mt-1" />
                    </div>
                    <div>
                      <Label>Report Type</Label>
                      <select className="w-full mt-1 p-2 border rounded">
                        <option>Performance</option>
                        <option>Usage</option>
                        <option>Cost</option>
                        <option>Errors</option>
                        <option>Custom</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Description</Label>
                    <Input placeholder="Brief description of the report..." className="mt-1" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Data Source</Label>
                      <select className="w-full mt-1 p-2 border rounded">
                        <option>Workflow Logs</option>
                        <option>Performance Metrics</option>
                        <option>Usage Statistics</option>
                        <option>Cost Data</option>
                      </select>
                    </div>
                    <div>
                      <Label>Schedule</Label>
                      <select className="w-full mt-1 p-2 border rounded">
                        <option>Manual</option>
                        <option>Hourly</option>
                        <option>Daily</option>
                        <option>Weekly</option>
                        <option>Monthly</option>
                      </select>
                    </div>
                    <div>
                      <Label>Format</Label>
                      <select className="w-full mt-1 p-2 border rounded">
                        <option>Dashboard</option>
                        <option>PDF</option>
                        <option>CSV</option>
                        <option>JSON</option>
                      </select>
                    </div>
                  </div>
                  
                  <Button>
                    Create Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="flex-1 m-0 p-4">
            <Card>
              <CardHeader>
                <CardTitle>Report Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Default Date Range</Label>
                  <select className="w-full mt-1 p-2 border rounded">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                  </select>
                </div>
                <div>
                  <Label>Auto-refresh Interval</Label>
                  <select className="w-full mt-1 p-2 border rounded">
                    <option>5 minutes</option>
                    <option>15 minutes</option>
                    <option>1 hour</option>
                    <option>Manual</option>
                  </select>
                </div>
                <div>
                  <Label>Export Format</Label>
                  <select className="w-full mt-1 p-2 border rounded">
                    <option>PDF</option>
                    <option>CSV</option>
                    <option>JSON</option>
                    <option>Excel</option>
                  </select>
                </div>
                <div>
                  <Label>Email Notifications</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Send email notifications for scheduled reports</span>
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