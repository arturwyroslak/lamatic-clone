'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FlowBuilder } from './flow-builder'
import { TestRunner } from './test-runner'
import { DeploymentPanel } from './deployment-panel'
import { ContextManager } from './context-manager'
import { PromptLibrary } from './prompt-library'
import { AgentManager } from './agent-manager'
import { ToolsManager } from './tools-manager'
import { LogsViewer } from './logs-viewer'
import { ReportsViewer } from './reports-viewer'
import { SettingsPanel } from './settings-panel'
import {
  Workflow,
  Bot,
  Database,
  TestTube,
  Rocket,
  FileText,
  Settings,
  BarChart3,
  ScrollText,
  Wrench,
  Play,
  Save,
  Share2,
  Download
} from 'lucide-react'
import { useFlowStore } from '@/store/flow-store'
import { useWorkspace } from '@/hooks/use-workspace'

interface StudioInterfaceProps {
  workflowId?: string
}

export function StudioInterface({ workflowId }: StudioInterfaceProps) {
  const [activeTab, setActiveTab] = useState('flows')
  const { workspace } = useWorkspace()
  const { workflow, isLoading } = useFlowStore()
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Studio Header */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Workflow className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">Studio</h1>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Workspace:</span>
                <Badge variant="outline">{workspace?.name}</Badge>
              </div>
              {workflow && (
                <>
                  <Separator orientation="vertical" className="h-6" />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Flow:</span>
                    <span className="font-medium">{workflow.name}</span>
                    <Badge variant={workflow.status === 'published' ? 'default' : 'secondary'}>
                      {workflow.status}
                    </Badge>
                  </div>
                </>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm">
                <TestTube className="h-4 w-4 mr-2" />
                Test
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button size="sm">
                <Rocket className="h-4 w-4 mr-2" />
                Deploy
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Studio Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          {/* Studio Navigation */}
          <div className="border-b">
            <TabsList className="grid w-full grid-cols-12 h-12">
              <TabsTrigger value="flows" className="flex items-center gap-2">
                <Workflow className="h-4 w-4" />
                Flows
              </TabsTrigger>
              <TabsTrigger value="agents" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Agents
              </TabsTrigger>
              <TabsTrigger value="prompts" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Prompts
              </TabsTrigger>
              <TabsTrigger value="tools" className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Tools
              </TabsTrigger>
              <TabsTrigger value="context" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Context
              </TabsTrigger>
              <TabsTrigger value="tests" className="flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                Tests
              </TabsTrigger>
              <TabsTrigger value="deployments" className="flex items-center gap-2">
                <Rocket className="h-4 w-4" />
                Deploy
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center gap-2">
                <ScrollText className="h-4 w-4" />
                Logs
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            <TabsContent value="flows" className="h-full m-0 p-0">
              <FlowBuilder workflowId={workflowId} />
            </TabsContent>
            
            <TabsContent value="agents" className="h-full m-0 p-4">
              <AgentManager />
            </TabsContent>
            
            <TabsContent value="prompts" className="h-full m-0 p-4">
              <PromptLibrary />
            </TabsContent>
            
            <TabsContent value="tools" className="h-full m-0 p-4">
              <ToolsManager />
            </TabsContent>
            
            <TabsContent value="context" className="h-full m-0 p-4">
              <ContextManager />
            </TabsContent>
            
            <TabsContent value="tests" className="h-full m-0 p-4">
              <TestRunner workflowId={workflowId} />
            </TabsContent>
            
            <TabsContent value="deployments" className="h-full m-0 p-4">
              <DeploymentPanel workflowId={workflowId} />
            </TabsContent>
            
            <TabsContent value="logs" className="h-full m-0 p-4">
              <LogsViewer />
            </TabsContent>
            
            <TabsContent value="reports" className="h-full m-0 p-4">
              <ReportsViewer />
            </TabsContent>
            
            <TabsContent value="settings" className="h-full m-0 p-4">
              <SettingsPanel />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}