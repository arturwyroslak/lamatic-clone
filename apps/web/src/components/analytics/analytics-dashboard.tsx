'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Activity,
  TrendingUp,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  RefreshCw,
  Calendar,
  Filter
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalRequests: number
    successfulRequests: number
    failedRequests: number
    avgResponseTime: number
    totalCost: number
    activeWorkflows: number
  }
  performance: {
    requestsOverTime: Array<{ timestamp: string; requests: number }>
    responseTimeOverTime: Array<{ timestamp: string; responseTime: number }>
    errorRateOverTime: Array<{ timestamp: string; errorRate: number }>
  }
  usage: {
    topWorkflows: Array<{ name: string; executions: number; successRate: number }>
    modelUsage: Array<{ model: string; requests: number; cost: number }>
    integrationUsage: Array<{ integration: string; calls: number; status: string }>
  }
  costs: {
    totalSpend: number
    spendByModel: Array<{ model: string; spend: number }>
    spendOverTime: Array<{ date: string; amount: number }>
    projectedSpend: number
  }
  errors: {
    recentErrors: Array<{
      id: string
      workflow: string
      error: string
      timestamp: string
      severity: 'low' | 'medium' | 'high' | 'critical'
    }>
    errorsByType: Array<{ type: string; count: number }>
  }
}

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const loadAnalyticsData = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock data matching Lamatic.ai capabilities
    setData({
      overview: {
        totalRequests: 45280,
        successfulRequests: 43876,
        failedRequests: 1404,
        avgResponseTime: 245,
        totalCost: 892.45,
        activeWorkflows: 12
      },
      performance: {
        requestsOverTime: generateTimeSeriesData(24, 1000, 3000),
        responseTimeOverTime: generateTimeSeriesData(24, 200, 400),
        errorRateOverTime: generateTimeSeriesData(24, 1, 5)
      },
      usage: {
        topWorkflows: [
          { name: 'Customer Support Bot', executions: 8920, successRate: 98.5 },
          { name: 'Content Generator', executions: 5640, successRate: 96.2 },
          { name: 'Lead Qualification', executions: 3200, successRate: 94.8 }
        ],
        modelUsage: [
          { model: 'GPT-4', requests: 15420, cost: 462.60 },
          { model: 'GPT-3.5 Turbo', requests: 18950, cost: 284.25 },
          { model: 'Claude 3 Sonnet', requests: 6890, cost: 145.60 }
        ],
        integrationUsage: [
          { integration: 'Slack', calls: 12540, status: 'healthy' },
          { integration: 'Salesforce', calls: 8920, status: 'healthy' },
          { integration: 'Google Drive', calls: 3450, status: 'degraded' }
        ]
      },
      costs: {
        totalSpend: 892.45,
        spendByModel: [
          { model: 'GPT-4', spend: 462.60 },
          { model: 'GPT-3.5 Turbo', spend: 284.25 },
          { model: 'Claude 3 Sonnet', spend: 145.60 }
        ],
        spendOverTime: generateSpendData(7),
        projectedSpend: 3567.80
      },
      errors: {
        recentErrors: [
          {
            id: '1',
            workflow: 'Customer Support Bot',
            error: 'Rate limit exceeded for OpenAI API',
            timestamp: '2024-01-25T10:30:00Z',
            severity: 'high'
          },
          {
            id: '2', 
            workflow: 'Content Generator',
            error: 'Timeout waiting for model response',
            timestamp: '2024-01-25T09:45:00Z',
            severity: 'medium'
          }
        ],
        errorsByType: [
          { type: 'Rate Limits', count: 45 },
          { type: 'Timeouts', count: 23 },
          { type: 'Model Errors', count: 12 },
          { type: 'Integration Failures', count: 8 }
        ]
      }
    })
    setLoading(false)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time insights into workflow performance, costs, and usage patterns
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadAnalyticsData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((data.overview.successfulRequests / data.overview.totalRequests) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              +0.2% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              -15ms from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.overview.totalCost}</div>
            <p className="text-xs text-muted-foreground">
              +8.2% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Requests</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.failedRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              -2.1% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.activeWorkflows}</div>
            <p className="text-xs text-muted-foreground">
              +2 new this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Request Volume</CardTitle>
                <CardDescription>Real-time request tracking with sub-100ms updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <LineChart className="h-8 w-8 mr-2" />
                  Chart: Live request volume tracking
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Edge Performance</CardTitle>
                <CardDescription>Global edge response times</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <LineChart className="h-8 w-8 mr-2" />
                  Chart: Global edge latency map
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Workflows</CardTitle>
                <CardDescription>Most executed workflows with success rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.usage.topWorkflows.map((workflow, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{workflow.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {workflow.executions.toLocaleString()} executions
                        </p>
                      </div>
                      <Badge variant="outline">
                        {workflow.successRate}% success
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Model Usage & Costs</CardTitle>
                <CardDescription>AI model performance and spend analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.usage.modelUsage.map((model, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{model.model}</p>
                        <p className="text-sm text-muted-foreground">
                          {model.requests.toLocaleString()} requests
                        </p>
                      </div>
                      <p className="font-mono text-sm">${model.cost}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="costs" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cost Optimization</CardTitle>
                <CardDescription>AI-powered cost analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <PieChart className="h-8 w-8 mr-2" />
                  Chart: Smart cost breakdown
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Predictive Spend Analysis</CardTitle>
                <CardDescription>AI forecasting for budget planning</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <BarChart3 className="h-8 w-8 mr-2" />
                  Chart: Predictive cost modeling
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cost Intelligence</CardTitle>
              <CardDescription>Projected monthly spend: ${data.costs.projectedSpend}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <p className="text-muted-foreground mb-2">
                  Based on AI analysis of your usage patterns, you're projected to spend ${data.costs.projectedSpend} this month.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-800 font-medium">💡 AI Recommendation</p>
                  <p className="text-blue-700 text-sm">
                    Switch 30% of simple tasks to GPT-3.5 Turbo to save ~$180/month while maintaining 95% quality.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Real-time Error Tracking</CardTitle>
                <CardDescription>Live error monitoring with intelligent alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.errors.recentErrors.map((error) => (
                    <div key={error.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{error.workflow}</p>
                        <div className={`w-2 h-2 rounded-full ${getSeverityColor(error.severity)}`} />
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{error.error}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(error.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Intelligence</CardTitle>
                <CardDescription>Automated error categorization and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.errors.errorsByType.map((errorType, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <p className="font-medium">{errorType.type}</p>
                      <Badge variant="destructive">{errorType.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Performance Insights</CardTitle>
                <CardDescription>Machine learning-powered optimization recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <p className="font-medium">🎯 Smart Model Selection</p>
                    <p className="text-sm text-muted-foreground">
                      Our AI detected 40% cost savings opportunity by using GPT-3.5 Turbo for simple classification tasks
                    </p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <p className="font-medium">⚡ Semantic Cache Optimization</p>
                    <p className="text-sm text-muted-foreground">
                      Enable semantic caching for content workflows - potential 65% response time improvement
                    </p>
                  </div>
                  <div className="border-l-4 border-yellow-500 pl-4">
                    <p className="font-medium">⚠️ Rate Limit Prediction</p>
                    <p className="text-sm text-muted-foreground">
                      High probability of hitting OpenAI rate limits in next 2 hours - consider request queuing
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workflow Intelligence</CardTitle>
                <CardDescription>Advanced workflow optimization insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                    <div>
                      <p className="font-medium">Parallel Processing Opportunity</p>
                      <p className="text-sm text-muted-foreground">
                        Customer Support workflow can benefit from 3x speedup with parallel agent execution
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                    <div>
                      <p className="font-medium">Edge Performance Boost</p>
                      <p className="text-sm text-muted-foreground">
                        Deploy to 3 additional edge regions for 45% global latency reduction
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
                    <div>
                      <p className="font-medium">Vector Search Enhancement</p>
                      <p className="text-sm text-muted-foreground">
                        Hybrid search implementation could improve RAG accuracy by 23%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper functions for generating realistic mock data
function generateTimeSeriesData(points: number, min: number, max: number) {
  const data = []
  const now = new Date()
  
  for (let i = points - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000).toISOString()
    const value = Math.floor(Math.random() * (max - min) + min)
    data.push({ timestamp, requests: value, responseTime: value, errorRate: value / 100 })
  }
  
  return data
}

function generateSpendData(days: number) {
  const data = []
  const now = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const amount = Math.floor(Math.random() * 200 + 50)
    data.push({ date, amount })
  }
  
  return data
}