import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button } from '@lamatic/ui'
import { Play, Pause, Settings, MoreVertical } from 'lucide-react'

const workflows = [
  {
    id: 'wf-001',
    name: 'Customer Support Bot',
    description: 'Automated customer support using GPT-4',
    status: 'Active',
    lastRun: '5 minutes ago',
    executions: 1429,
    successRate: '98.5%'
  },
  {
    id: 'wf-002',
    name: 'Document Processor',
    description: 'Extract and analyze document content',
    status: 'Active', 
    lastRun: '2 hours ago',
    executions: 324,
    successRate: '95.2%'
  }
]

export function WorkflowList() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Workflows</h1>
            <p className="text-gray-500 mt-2">Manage your AI workflows</p>
          </div>
          <Button>Create Workflow</Button>
        </div>
        <div className="grid gap-6">
          {workflows.map((workflow) => (
            <Card key={workflow.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {workflow.name}
                  <Badge variant="default">{workflow.status}</Badge>
                </CardTitle>
                <CardDescription>{workflow.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <div>Last Run: {workflow.lastRun}</div>
                    <div>Executions: {workflow.executions.toLocaleString()}</div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
