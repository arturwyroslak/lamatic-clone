'use client'

import React, { memo } from 'react'
import { Handle, Position, NodeProps, Node } from '@xyflow/react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Settings, Play, Pause, MoreVertical, AlertCircle, CheckCircle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export interface NodeData {
  type: 'trigger' | 'llm' | 'action' | 'data' | 'processor'
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  config: Record<string, any>
  status?: 'idle' | 'running' | 'success' | 'error'
  lastRun?: Date
  executionTime?: number
  error?: string
}

const nodeTypeConfig = {
  trigger: {
    hasInput: false,
    hasOutput: true,
    bgColor: 'bg-green-50 dark:bg-green-950',
    borderColor: 'border-green-200 dark:border-green-800',
    headerColor: 'bg-green-100 dark:bg-green-900'
  },
  llm: {
    hasInput: true,
    hasOutput: true,
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    borderColor: 'border-blue-200 dark:border-blue-800',
    headerColor: 'bg-blue-100 dark:bg-blue-900'
  },
  action: {
    hasInput: true,
    hasOutput: false,
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    borderColor: 'border-purple-200 dark:border-purple-800',
    headerColor: 'bg-purple-100 dark:bg-purple-900'
  },
  data: {
    hasInput: true,
    hasOutput: true,
    bgColor: 'bg-orange-50 dark:bg-orange-950',
    borderColor: 'border-orange-200 dark:border-orange-800',
    headerColor: 'bg-orange-100 dark:bg-orange-900'
  },
  processor: {
    hasInput: true,
    hasOutput: true,
    bgColor: 'bg-gray-50 dark:bg-gray-950',
    borderColor: 'border-gray-200 dark:border-gray-800',
    headerColor: 'bg-gray-100 dark:bg-gray-900'
  }
}

const statusIcons = {
  idle: null,
  running: Play,
  success: CheckCircle,
  error: AlertCircle
}

const statusColors = {
  idle: 'text-muted-foreground',
  running: 'text-blue-500 animate-pulse',
  success: 'text-green-500',
  error: 'text-red-500'
}

export function FlowNode({ id, data, selected }: NodeProps<Node<NodeData>>) {
  const config = nodeTypeConfig[data.type]
  const IconComponent = data.icon
  const StatusIcon = data.status ? statusIcons[data.status] : null

  const handleNodeAction = (action: string) => {
    console.log(`Node ${id} action:`, action)
    // Implement node actions
  }

  return (
    <Card
      className={cn(
        'min-w-[280px] shadow-lg transition-all duration-200',
        config.bgColor,
        config.borderColor,
        selected && 'ring-2 ring-primary ring-offset-2',
        data.status === 'running' && 'animate-pulse'
      )}
    >
      {/* Input Handle */}
      {config.hasInput && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-primary !border-2 !border-background"
        />
      )}

      {/* Node Header */}
      <div className={cn('px-4 py-2 rounded-t-lg', config.headerColor)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('w-6 h-6 rounded flex items-center justify-center', data.color)}>
              <IconComponent className="h-3 w-3 text-white" />
            </div>
            <div>
              <div className="font-medium text-sm">{data.title}</div>
              <Badge variant="outline" className="text-xs">
                {data.type}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {StatusIcon && (
              <StatusIcon className={cn('h-4 w-4', statusColors[data.status!])} />
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleNodeAction('test')}>
                  <Play className="h-4 w-4 mr-2" />
                  Test Node
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNodeAction('configure')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleNodeAction('delete')}
                  className="text-destructive"
                >
                  Delete Node
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Node Content */}
      <div className="px-4 py-3">
        <p className="text-sm text-muted-foreground mb-3">
          {data.description}
        </p>
        
        {/* Configuration Preview */}
        {Object.keys(data.config).length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Configuration
            </div>
            <div className="space-y-1">
              {Object.entries(data.config).slice(0, 3).map(([key, value]) => (
                <div key={key} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{key}:</span>
                  <span className="font-mono truncate max-w-[100px]">
                    {typeof value === 'string' ? value : JSON.stringify(value)}
                  </span>
                </div>
              ))}
              {Object.keys(data.config).length > 3 && (
                <div className="text-xs text-muted-foreground text-center">
                  +{Object.keys(data.config).length - 3} more...
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Execution Info */}
        {data.lastRun && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Last run:</span>
              <span>{data.lastRun.toLocaleTimeString()}</span>
            </div>
            {data.executionTime && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Duration:</span>
                <span>{data.executionTime}ms</span>
              </div>
            )}
          </div>
        )}
        
        {/* Error Message */}
        {data.error && (
          <div className="mt-3 p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-xs font-medium text-red-700 dark:text-red-300">
                Error
              </span>
            </div>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              {data.error}
            </p>
          </div>
        )}
      </div>

      {/* Output Handle */}
      {config.hasOutput && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !bg-primary !border-2 !border-background"
        />
      )}
    </Card>
  )
}

export default memo(FlowNode)