'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Play,
  Square,
  TestTube,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Settings,
  Plus,
  Trash2,
  Copy
} from 'lucide-react'

interface TestRunnerProps {
  workflowId?: string
}

interface TestCase {
  id: string
  name: string
  description: string
  inputs: Record<string, any>
  expectedOutputs: Record<string, any>
  status: 'pending' | 'running' | 'passed' | 'failed'
  duration?: number
  error?: string
  actualOutputs?: Record<string, any>
}

export function TestRunner({ workflowId }: TestRunnerProps) {
  const [activeTab, setActiveTab] = useState('test-cases')
  const [isRunning, setIsRunning] = useState(false)
  const [selectedTest, setSelectedTest] = useState<string | null>(null)
  
  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      id: 'test-1',
      name: 'Basic Message Processing',
      description: 'Test basic message processing with GPT-4',
      inputs: {
        message: 'Hello, how are you?',
        context: 'casual conversation'
      },
      expectedOutputs: {
        response: 'Should contain greeting response',
        confidence: '>0.8'
      },
      status: 'passed',
      duration: 1250,
      actualOutputs: {
        response: 'Hello! I\'m doing well, thank you for asking. How can I help you today?',
        confidence: 0.92
      }
    },
    {
      id: 'test-2',
      name: 'Error Handling',
      description: 'Test workflow behavior with invalid inputs',
      inputs: {
        message: '',
        context: null
      },
      expectedOutputs: {
        error: 'Should handle empty message gracefully'
      },
      status: 'failed',
      duration: 500,
      error: 'Validation error: message cannot be empty',
      actualOutputs: {
        error: 'ValidationError: message is required'
      }
    },
    {
      id: 'test-3',
      name: 'Performance Benchmark',
      description: 'Test response time under load',
      inputs: {
        message: 'Complex analysis request with multiple parameters',
        context: 'performance testing'
      },
      expectedOutputs: {
        response: 'Should respond within 2 seconds',
        latency: '<2000ms'
      },
      status: 'pending'
    }
  ])

  const runAllTests = async () => {
    setIsRunning(true)
    
    for (const test of testCases) {
      setSelectedTest(test.id)
      setTestCases(prev => prev.map(t => 
        t.id === test.id ? { ...t, status: 'running' } : t
      ))
      
      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
      
      // Random pass/fail for demo
      const passed = Math.random() > 0.3
      setTestCases(prev => prev.map(t => 
        t.id === test.id ? { 
          ...t, 
          status: passed ? 'passed' : 'failed',
          duration: Math.floor(500 + Math.random() * 2000),
          error: passed ? undefined : 'Test assertion failed',
          actualOutputs: passed ? test.expectedOutputs : { error: 'Unexpected result' }
        } : t
      ))
    }
    
    setIsRunning(false)
    setSelectedTest(null)
  }

  const runSingleTest = async (testId: string) => {
    setSelectedTest(testId)
    setTestCases(prev => prev.map(t => 
      t.id === testId ? { ...t, status: 'running' } : t
    ))
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const passed = Math.random() > 0.2
    setTestCases(prev => prev.map(t => 
      t.id === testId ? { 
        ...t, 
        status: passed ? 'passed' : 'failed',
        duration: Math.floor(500 + Math.random() * 2000),
        error: passed ? undefined : 'Test assertion failed'
      } : t
    ))
    
    setSelectedTest(null)
  }

  const getStatusIcon = (status: TestCase['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />
      case 'running': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: TestCase['status']) => {
    const variants = {
      passed: 'default',
      failed: 'destructive', 
      running: 'secondary',
      pending: 'outline'
    } as const
    
    return (
      <Badge variant={variants[status]} className="ml-2">
        {status}
      </Badge>
    )
  }

  const passedTests = testCases.filter(t => t.status === 'passed').length
  const failedTests = testCases.filter(t => t.status === 'failed').length
  const totalTests = testCases.length

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Test Runner
            </h2>
            <p className="text-sm text-muted-foreground">
              Test your workflow with different inputs and scenarios
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {passedTests}/{totalTests} Passed
            </Badge>
            {failedTests > 0 && (
              <Badge variant="destructive">
                {failedTests} Failed
              </Badge>
            )}
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isRunning ? 'Stop Tests' : 'Run All Tests'}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="w-full justify-start border-b rounded-none h-12 bg-transparent p-0">
            <TabsTrigger value="test-cases" className="rounded-none">Test Cases</TabsTrigger>
            <TabsTrigger value="results" className="rounded-none">Results</TabsTrigger>
            <TabsTrigger value="coverage" className="rounded-none">Coverage</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-none">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="test-cases" className="flex-1 m-0 p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              {/* Test Cases List */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Test Cases</CardTitle>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Test
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {testCases.map((test) => (
                        <div
                          key={test.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedTest === test.id ? 'bg-accent' : 'hover:bg-accent/50'
                          }`}
                          onClick={() => setSelectedTest(test.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(test.status)}
                              <span className="font-medium">{test.name}</span>
                              {getStatusBadge(test.status)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  runSingleTest(test.id)
                                }}
                                disabled={test.status === 'running'}
                              >
                                <Play className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{test.description}</p>
                          {test.duration && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Duration: {test.duration}ms
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Test Details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Test Details</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {selectedTest ? (
                    <ScrollArea className="h-[400px]">
                      {(() => {
                        const test = testCases.find(t => t.id === selectedTest)
                        if (!test) return null
                        
                        return (
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium">Name</Label>
                              <p className="text-sm">{test.name}</p>
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium">Description</Label>
                              <p className="text-sm text-muted-foreground">{test.description}</p>
                            </div>
                            
                            <Separator />
                            
                            <div>
                              <Label className="text-sm font-medium">Input Data</Label>
                              <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                                {JSON.stringify(test.inputs, null, 2)}
                              </pre>
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium">Expected Output</Label>
                              <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                                {JSON.stringify(test.expectedOutputs, null, 2)}
                              </pre>
                            </div>
                            
                            {test.actualOutputs && (
                              <div>
                                <Label className="text-sm font-medium">Actual Output</Label>
                                <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                                  {JSON.stringify(test.actualOutputs, null, 2)}
                                </pre>
                              </div>
                            )}
                            
                            {test.error && (
                              <div>
                                <Label className="text-sm font-medium text-red-600">Error</Label>
                                <p className="mt-1 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                                  {test.error}
                                </p>
                              </div>
                            )}
                          </div>
                        )
                      })()}
                    </ScrollArea>
                  ) : (
                    <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                      Select a test case to view details
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="results" className="flex-1 m-0 p-4">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Tests</p>
                        <p className="text-2xl font-bold">{totalTests}</p>
                      </div>
                      <TestTube className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Passed</p>
                        <p className="text-2xl font-bold text-green-600">{passedTests}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Failed</p>
                        <p className="text-2xl font-bold text-red-600">{failedTests}</p>
                      </div>
                      <XCircle className="h-8 w-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Test Results History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Test history and detailed results would be displayed here
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="coverage" className="flex-1 m-0 p-4">
            <Card>
              <CardHeader>
                <CardTitle>Test Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Test coverage analysis and workflow path coverage would be displayed here
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="flex-1 m-0 p-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Test Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Test Timeout (seconds)</Label>
                  <Input type="number" defaultValue="30" className="mt-1" />
                </div>
                <div>
                  <Label>Parallel Execution</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <input type="checkbox" id="parallel" />
                    <label htmlFor="parallel" className="text-sm">Run tests in parallel</label>
                  </div>
                </div>
                <div>
                  <Label>Environment</Label>
                  <select className="w-full mt-1 p-2 border rounded">
                    <option>Development</option>
                    <option>Staging</option>
                    <option>Production</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}