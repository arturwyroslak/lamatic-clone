'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Settings,
  User,
  Shield,
  Bell,
  Palette,
  Database,
  Key,
  Globe,
  Zap,
  Save,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'

export function SettingsPanel() {
  const [activeTab, setActiveTab] = useState('general')
  const [showApiKey, setShowApiKey] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  const [settings, setSettings] = useState({
    general: {
      workspaceName: 'My Workspace',
      description: 'AI workflow automation workspace',
      timezone: 'America/New_York',
      language: 'English',
      theme: 'system'
    },
    models: {
      defaultProvider: 'openai',
      openaiApiKey: 'sk-...hidden...',
      anthropicApiKey: '',
      cohereApiKey: '',
      defaultModel: 'gpt-4',
      defaultTemperature: 0.7,
      defaultMaxTokens: 1000
    },
    deployment: {
      autoDeployOnSave: false,
      defaultEnvironment: 'development',
      enableCaching: true,
      cacheTimeout: 300,
      rateLimitPerMinute: 1000,
      enableAnalytics: true
    },
    notifications: {
      emailNotifications: true,
      deploymentAlerts: true,
      errorAlerts: true,
      usageAlerts: true,
      weeklyReports: false,
      slackWebhook: ''
    },
    security: {
      apiKeyRotation: 'manual',
      sessionTimeout: 24,
      enableMFA: false,
      ipWhitelist: '',
      auditLogging: true
    }
  })

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }))
    setHasUnsavedChanges(true)
  }

  const handleSave = () => {
    // Simulate save
    console.log('Saving settings:', settings)
    setHasUnsavedChanges(false)
    // Would typically send to API
  }

  const handleReset = () => {
    // Reset to defaults
    setHasUnsavedChanges(false)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Workspace Settings
            </h2>
            <p className="text-sm text-muted-foreground">
              Configure your workspace preferences and integrations
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-orange-600">
                Unsaved changes
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={!hasUnsavedChanges}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
            >
              <Save className="h-4 w-4 mr-1" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="w-full justify-start border-b rounded-none h-12 bg-transparent p-0">
            <TabsTrigger value="general" className="rounded-none">General</TabsTrigger>
            <TabsTrigger value="models" className="rounded-none">AI Models</TabsTrigger>
            <TabsTrigger value="deployment" className="rounded-none">Deployment</TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-none">Notifications</TabsTrigger>
            <TabsTrigger value="security" className="rounded-none">Security</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <div className="p-6">
              <TabsContent value="general" className="m-0">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Workspace Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Workspace Name</Label>
                        <Input
                          value={settings.general.workspaceName}
                          onChange={(e) => handleSettingChange('general', 'workspaceName', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={settings.general.description}
                          onChange={(e) => handleSettingChange('general', 'description', e.target.value)}
                          className="mt-1"
                          placeholder="Describe your workspace..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Timezone</Label>
                          <select
                            value={settings.general.timezone}
                            onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                            className="w-full mt-1 p-2 border rounded-md"
                          >
                            <option value="America/New_York">Eastern Time</option>
                            <option value="America/Los_Angeles">Pacific Time</option>
                            <option value="America/Chicago">Central Time</option>
                            <option value="Europe/London">GMT</option>
                            <option value="Europe/Berlin">CET</option>
                            <option value="Asia/Tokyo">JST</option>
                          </select>
                        </div>
                        <div>
                          <Label>Language</Label>
                          <select
                            value={settings.general.language}
                            onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
                            className="w-full mt-1 p-2 border rounded-md"
                          >
                            <option value="English">English</option>
                            <option value="Spanish">Español</option>
                            <option value="French">Français</option>
                            <option value="German">Deutsch</option>
                            <option value="Japanese">日本語</option>
                          </select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Appearance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <Label>Theme</Label>
                        <select
                          value={settings.general.theme}
                          onChange={(e) => handleSettingChange('general', 'theme', e.target.value)}
                          className="w-full mt-1 p-2 border rounded-md"
                        >
                          <option value="system">System</option>
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                        </select>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="models" className="m-0">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        API Keys
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>OpenAI API Key</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type={showApiKey ? 'text' : 'password'}
                            value={settings.models.openaiApiKey}
                            onChange={(e) => handleSettingChange('models', 'openaiApiKey', e.target.value)}
                            placeholder="sk-..."
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowApiKey(!showApiKey)}
                          >
                            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label>Anthropic API Key</Label>
                        <Input
                          type="password"
                          value={settings.models.anthropicApiKey}
                          onChange={(e) => handleSettingChange('models', 'anthropicApiKey', e.target.value)}
                          placeholder="sk-ant-..."
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Cohere API Key</Label>
                        <Input
                          type="password"
                          value={settings.models.cohereApiKey}
                          onChange={(e) => handleSettingChange('models', 'cohereApiKey', e.target.value)}
                          placeholder="Enter Cohere API key..."
                          className="mt-1"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Default Model Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Default Provider</Label>
                          <select
                            value={settings.models.defaultProvider}
                            onChange={(e) => handleSettingChange('models', 'defaultProvider', e.target.value)}
                            className="w-full mt-1 p-2 border rounded-md"
                          >
                            <option value="openai">OpenAI</option>
                            <option value="anthropic">Anthropic</option>
                            <option value="cohere">Cohere</option>
                            <option value="huggingface">Hugging Face</option>
                          </select>
                        </div>
                        <div>
                          <Label>Default Model</Label>
                          <select
                            value={settings.models.defaultModel}
                            onChange={(e) => handleSettingChange('models', 'defaultModel', e.target.value)}
                            className="w-full mt-1 p-2 border rounded-md"
                          >
                            <option value="gpt-4">GPT-4</option>
                            <option value="gpt-4-turbo">GPT-4 Turbo</option>
                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                            <option value="claude-3-opus">Claude 3 Opus</option>
                            <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Default Temperature</Label>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            max="1"
                            value={settings.models.defaultTemperature}
                            onChange={(e) => handleSettingChange('models', 'defaultTemperature', parseFloat(e.target.value))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Default Max Tokens</Label>
                          <Input
                            type="number"
                            value={settings.models.defaultMaxTokens}
                            onChange={(e) => handleSettingChange('models', 'defaultMaxTokens', parseInt(e.target.value))}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="deployment" className="m-0">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Deployment Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto-deploy on Save</Label>
                          <p className="text-sm text-muted-foreground">
                            Automatically deploy workflows when saved
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.deployment.autoDeployOnSave}
                          onChange={(e) => handleSettingChange('deployment', 'autoDeployOnSave', e.target.checked)}
                        />
                      </div>
                      <div>
                        <Label>Default Environment</Label>
                        <select
                          value={settings.deployment.defaultEnvironment}
                          onChange={(e) => handleSettingChange('deployment', 'defaultEnvironment', e.target.value)}
                          className="w-full mt-1 p-2 border rounded-md"
                        >
                          <option value="development">Development</option>
                          <option value="staging">Staging</option>
                          <option value="production">Production</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Enable Caching</Label>
                          <p className="text-sm text-muted-foreground">
                            Cache responses to improve performance
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.deployment.enableCaching}
                          onChange={(e) => handleSettingChange('deployment', 'enableCaching', e.target.checked)}
                        />
                      </div>
                      <div>
                        <Label>Cache Timeout (seconds)</Label>
                        <Input
                          type="number"
                          value={settings.deployment.cacheTimeout}
                          onChange={(e) => handleSettingChange('deployment', 'cacheTimeout', parseInt(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Performance & Limits</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Rate Limit (requests per minute)</Label>
                        <Input
                          type="number"
                          value={settings.deployment.rateLimitPerMinute}
                          onChange={(e) => handleSettingChange('deployment', 'rateLimitPerMinute', parseInt(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Enable Analytics</Label>
                          <p className="text-sm text-muted-foreground">
                            Collect usage and performance analytics
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.deployment.enableAnalytics}
                          onChange={(e) => handleSettingChange('deployment', 'enableAnalytics', e.target.checked)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="m-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notification Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.emailNotifications}
                        onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <h4 className="font-medium">Alert Types</h4>
                      
                      <div className="flex items-center justify-between">
                        <Label>Deployment Alerts</Label>
                        <input
                          type="checkbox"
                          checked={settings.notifications.deploymentAlerts}
                          onChange={(e) => handleSettingChange('notifications', 'deploymentAlerts', e.target.checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label>Error Alerts</Label>
                        <input
                          type="checkbox"
                          checked={settings.notifications.errorAlerts}
                          onChange={(e) => handleSettingChange('notifications', 'errorAlerts', e.target.checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label>Usage Alerts</Label>
                        <input
                          type="checkbox"
                          checked={settings.notifications.usageAlerts}
                          onChange={(e) => handleSettingChange('notifications', 'usageAlerts', e.target.checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label>Weekly Reports</Label>
                        <input
                          type="checkbox"
                          checked={settings.notifications.weeklyReports}
                          onChange={(e) => handleSettingChange('notifications', 'weeklyReports', e.target.checked)}
                        />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <Label>Slack Webhook URL</Label>
                      <Input
                        value={settings.notifications.slackWebhook}
                        onChange={(e) => handleSettingChange('notifications', 'slackWebhook', e.target.value)}
                        placeholder="https://hooks.slack.com/services/..."
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Optional: Receive notifications in Slack
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="m-0">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Security Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>API Key Rotation</Label>
                        <select
                          value={settings.security.apiKeyRotation}
                          onChange={(e) => handleSettingChange('security', 'apiKeyRotation', e.target.value)}
                          className="w-full mt-1 p-2 border rounded-md"
                        >
                          <option value="manual">Manual</option>
                          <option value="30days">Every 30 days</option>
                          <option value="90days">Every 90 days</option>
                          <option value="365days">Yearly</option>
                        </select>
                      </div>
                      
                      <div>
                        <Label>Session Timeout (hours)</Label>
                        <Input
                          type="number"
                          value={settings.security.sessionTimeout}
                          onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Enable Multi-Factor Authentication</Label>
                          <p className="text-sm text-muted-foreground">
                            Require MFA for all users
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.security.enableMFA}
                          onChange={(e) => handleSettingChange('security', 'enableMFA', e.target.checked)}
                        />
                      </div>
                      
                      <div>
                        <Label>IP Whitelist</Label>
                        <Textarea
                          value={settings.security.ipWhitelist}
                          onChange={(e) => handleSettingChange('security', 'ipWhitelist', e.target.value)}
                          placeholder="192.168.1.0/24&#10;10.0.0.0/8"
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          One IP or CIDR per line. Leave empty to allow all IPs.
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Audit Logging</Label>
                          <p className="text-sm text-muted-foreground">
                            Log all user actions for compliance
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.security.auditLogging}
                          onChange={(e) => handleSettingChange('security', 'auditLogging', e.target.checked)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Data Management</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Export Data
                        </Button>
                        <Button variant="outline">
                          <Upload className="h-4 w-4 mr-2" />
                          Import Data
                        </Button>
                      </div>
                      <Separator />
                      <div>
                        <Button variant="destructive" className="w-full">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Workspace
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1">
                          This action cannot be undone. All data will be permanently deleted.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  )
}