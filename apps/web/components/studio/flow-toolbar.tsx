'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Play,
  Square,
  Save,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Grid,
  Lock,
  Unlock,
  Copy,
  Scissors,
  Clipboard,
  RotateCcw,
  Settings,
  Share2,
  Download,
  Upload,
  Eye,
  EyeOff,
  Layers,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

interface FlowToolbarProps {
  isRunning?: boolean
  onRun?: () => void
  onStop?: () => void
  onSave?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  onFitView?: () => void
  onToggleGrid?: () => void
  onToggleLock?: () => void
  onCopy?: () => void
  onCut?: () => void
  onPaste?: () => void
  canUndo?: boolean
  canRedo?: boolean
  hasUnsavedChanges?: boolean
  zoomLevel?: number
  showGrid?: boolean
  isLocked?: boolean
}

export function FlowToolbar({
  isRunning = false,
  onRun,
  onStop,
  onSave,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onFitView,
  onToggleGrid,
  onToggleLock,
  onCopy,
  onCut,
  onPaste,
  canUndo = false,
  canRedo = false,
  hasUnsavedChanges = false,
  zoomLevel = 100,
  showGrid = true,
  isLocked = false
}: FlowToolbarProps) {
  const [showMiniToolbar, setShowMiniToolbar] = useState(false)

  return (
    <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
      {/* Left Side - Main Actions */}
      <div className="flex items-center gap-2 bg-background/95 backdrop-blur-sm border rounded-lg p-2 shadow-sm">
        {/* Run/Stop */}
        <div className="flex items-center gap-1">
          {isRunning ? (
            <Button
              size="sm"
              variant="destructive"
              onClick={onStop}
              className="flex items-center gap-1"
            >
              <Square className="h-4 w-4" />
              Stop
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onRun}
              className="flex items-center gap-1"
            >
              <Play className="h-4 w-4" />
              Run
            </Button>
          )}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* File Operations */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={onSave}
            className="flex items-center gap-1"
          >
            <Save className="h-4 w-4" />
            Save
            {hasUnsavedChanges && (
              <Badge variant="destructive" className="text-xs ml-1">
                •
              </Badge>
            )}
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Edit Operations */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Clipboard Operations */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={onCopy}
            title="Copy"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onCut}
            title="Cut"
          >
            <Scissors className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onPaste}
            title="Paste"
          >
            <Clipboard className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Center - Status */}
      <div className="flex items-center gap-2 bg-background/95 backdrop-blur-sm border rounded-lg px-3 py-2 shadow-sm">
        {isRunning && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Running...</span>
          </div>
        )}
        {hasUnsavedChanges && !isRunning && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-sm text-muted-foreground">Unsaved changes</span>
          </div>
        )}
        {!hasUnsavedChanges && !isRunning && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span className="text-sm text-muted-foreground">Saved</span>
          </div>
        )}
      </div>

      {/* Right Side - View Controls */}
      <div className="flex items-center gap-2">
        {/* View Controls */}
        <div className="flex items-center gap-1 bg-background/95 backdrop-blur-sm border rounded-lg p-2 shadow-sm">
          <Button
            size="sm"
            variant="ghost"
            onClick={onZoomOut}
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <div className="px-2 py-1 text-xs font-medium min-w-[50px] text-center">
            {zoomLevel}%
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onZoomIn}
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onFitView}
            title="Fit to View"
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>

        {/* Display Options */}
        <div className="flex items-center gap-1 bg-background/95 backdrop-blur-sm border rounded-lg p-2 shadow-sm">
          <Button
            size="sm"
            variant={showGrid ? "default" : "ghost"}
            onClick={onToggleGrid}
            title="Toggle Grid"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={isLocked ? "default" : "ghost"}
            onClick={onToggleLock}
            title={isLocked ? "Unlock Canvas" : "Lock Canvas"}
          >
            {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
          </Button>
        </div>

        {/* More Options */}
        <div className="flex items-center gap-1 bg-background/95 backdrop-blur-sm border rounded-lg p-2 shadow-sm">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowMiniToolbar(!showMiniToolbar)}
            title="More Options"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mini Toolbar - Additional Options */}
      {showMiniToolbar && (
        <div className="absolute top-16 right-4 bg-background/95 backdrop-blur-sm border rounded-lg p-2 shadow-lg">
          <div className="flex flex-col gap-1 min-w-[200px]">
            {/* File Operations */}
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
              File Operations
            </div>
            <Button size="sm" variant="ghost" className="justify-start">
              <Upload className="h-4 w-4 mr-2" />
              Import Workflow
            </Button>
            <Button size="sm" variant="ghost" className="justify-start">
              <Download className="h-4 w-4 mr-2" />
              Export Workflow
            </Button>
            <Button size="sm" variant="ghost" className="justify-start">
              <Share2 className="h-4 w-4 mr-2" />
              Share Workflow
            </Button>

            <Separator className="my-2" />

            {/* View Options */}
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
              View Options
            </div>
            <Button size="sm" variant="ghost" className="justify-start">
              <Layers className="h-4 w-4 mr-2" />
              Show Layers
            </Button>
            <Button size="sm" variant="ghost" className="justify-start">
              <Eye className="h-4 w-4 mr-2" />
              Show/Hide Nodes
            </Button>
            <Button size="sm" variant="ghost" className="justify-start">
              <EyeOff className="h-4 w-4 mr-2" />
              Hide Connections
            </Button>

            <Separator className="my-2" />

            {/* Alignment Tools */}
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
              Alignment
            </div>
            <Button size="sm" variant="ghost" className="justify-start">
              <AlignLeft className="h-4 w-4 mr-2" />
              Align Left
            </Button>
            <Button size="sm" variant="ghost" className="justify-start">
              <AlignCenter className="h-4 w-4 mr-2" />
              Align Center
            </Button>
            <Button size="sm" variant="ghost" className="justify-start">
              <AlignRight className="h-4 w-4 mr-2" />
              Align Right
            </Button>

            <Separator className="my-2" />

            {/* Layer Operations */}
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
              Layer Order
            </div>
            <Button size="sm" variant="ghost" className="justify-start">
              <ArrowUp className="h-4 w-4 mr-2" />
              Bring Forward
            </Button>
            <Button size="sm" variant="ghost" className="justify-start">
              <ArrowDown className="h-4 w-4 mr-2" />
              Send Backward
            </Button>

            <Separator className="my-2" />

            {/* Reset Options */}
            <Button size="sm" variant="ghost" className="justify-start">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Canvas
            </Button>
          </div>
        </div>
      )}

      {/* Click outside to close mini toolbar */}
      {showMiniToolbar && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMiniToolbar(false)}
        />
      )}
    </div>
  )
}