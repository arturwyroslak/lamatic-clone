'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { IntegrationCard } from './integration-card'
import { IntegrationModal } from './integration-modal'
import { useIntegrations } from '@/hooks/use-integrations'
import { IntegrationConfig, IntegrationCategory } from '@/types/integrations'
import { Search, Filter, Star, Zap, Database, MessageSquare, Code, Palette } from 'lucide-react'

const categoryIcons = {
  [IntegrationCategory.COMMUNICATION]: MessageSquare,
  [IntegrationCategory.PRODUCTIVITY]: Zap,
  [IntegrationCategory.STORAGE]: Database,
  [IntegrationCategory.DATABASE]: Database,
  [IntegrationCategory.CRM]: Star,
  [IntegrationCategory.PROJECT_MANAGEMENT]: Palette,
  [IntegrationCategory.AUTOMATION]: Code,
  [IntegrationCategory.WEB_SCRAPING]: Search,
  [IntegrationCategory.TEXT_GENERATION]: MessageSquare,
  [IntegrationCategory.CHAT]: MessageSquare,
  [IntegrationCategory.MULTIMODAL]: Palette,
  [IntegrationCategory.IMAGE_GENERATION]: Palette,
  [IntegrationCategory.CHAT_WIDGET]: MessageSquare,
  [IntegrationCategory.SEARCH_WIDGET]: Search,
  [IntegrationCategory.API]: Code,
  [IntegrationCategory.WEBHOOK]: Zap,
}

const categoryLabels = {
  [IntegrationCategory.COMMUNICATION]: 'Communication',
  [IntegrationCategory.PRODUCTIVITY]: 'Productivity',
  [IntegrationCategory.STORAGE]: 'Storage',
  [IntegrationCategory.DATABASE]: 'Database',
  [IntegrationCategory.CRM]: 'CRM',
  [IntegrationCategory.PROJECT_MANAGEMENT]: 'Project Management',
  [IntegrationCategory.ECOMMERCE]: 'E-commerce',
  [IntegrationCategory.AUTOMATION]: 'Automation',
  [IntegrationCategory.WEB_SCRAPING]: 'Web Scraping',
  [IntegrationCategory.TEXT_GENERATION]: 'Text Generation',
  [IntegrationCategory.CHAT]: 'Chat',
  [IntegrationCategory.MULTIMODAL]: 'Multimodal',
  [IntegrationCategory.IMAGE_GENERATION]: 'Image Generation',
  [IntegrationCategory.AUDIO_TRANSCRIPT]: 'Audio Transcript',
  [IntegrationCategory.AUDIO_GENERATION]: 'Audio Generation',
  [IntegrationCategory.VIDEO]: 'Video',
  [IntegrationCategory.EMBEDDING]: 'Embedding',
  [IntegrationCategory.CHAT_WIDGET]: 'Chat Widget',
  [IntegrationCategory.SEARCH_WIDGET]: 'Search Widget',
  [IntegrationCategory.CUSTOM_WIDGET]: 'Custom Widget',
  [IntegrationCategory.API]: 'API',
  [IntegrationCategory.WEBHOOK]: 'Webhook',
  [IntegrationCategory.SDK]: 'SDK',
}

export function IntegrationHub() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationConfig | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const { integrations, modelProviders, isLoading } = useIntegrations()

  // Filter integrations based on search and filters
  const filteredIntegrations = useMemo(() => {
    let filtered = integrations

    if (searchQuery) {
      filtered = filtered.filter(integration =>
        integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        integration.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        integration.features.some(feature => 
          feature.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(integration => integration.category === selectedCategory)
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(integration => integration.type === selectedType)
    }

    return filtered
  }, [integrations, searchQuery, selectedCategory, selectedType])

  // Group integrations by category
  const integrationsByCategory = useMemo(() => {
    const grouped = new Map<string, IntegrationConfig[]>()
    
    filteredIntegrations.forEach(integration => {
      const category = integration.category
      if (!grouped.has(category)) {
        grouped.set(category, [])
      }
      grouped.get(category)!.push(integration)
    })
    
    return grouped
  }, [filteredIntegrations])

  const handleIntegrationClick = (integration: IntegrationConfig) => {
    setSelectedIntegration(integration)
    setIsModalOpen(true)
  }

  const getStats = () => {
    const appsCount = integrations.filter(i => i.type === 'app' || i.type === 'data_source').length
    const modelsCount = modelProviders.length
    const interfacesCount = integrations.filter(i => i.type === 'interface').length
    const devToolsCount = integrations.filter(i => i.type === 'developer_tool').length
    
    return { appsCount, modelsCount, interfacesCount, devToolsCount }
  }

  const stats = getStats()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Apps & Data Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.appsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              AI Models
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.modelsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Interfaces
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.interfacesCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Developer Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.devToolsCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="app">Apps</SelectItem>
            <SelectItem value="data_source">Data Sources</SelectItem>
            <SelectItem value="model">Models</SelectItem>
            <SelectItem value="interface">Interfaces</SelectItem>
            <SelectItem value="developer_tool">Developer Tools</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Integration Tabs */}
      <Tabs defaultValue="apps" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="apps">Apps & Data Sources</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="interfaces">Interfaces</TabsTrigger>
          <TabsTrigger value="dev-tools">Developer Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="apps" className="space-y-6">
          {Array.from(integrationsByCategory.entries())
            .filter(([category]) => {
              const categoryIntegrations = integrationsByCategory.get(category)
              return categoryIntegrations?.some(i => i.type === 'app' || i.type === 'data_source')
            })
            .map(([category, categoryIntegrations]) => {
              const filteredCategoryIntegrations = categoryIntegrations.filter(
                i => i.type === 'app' || i.type === 'data_source'
              )
              
              if (filteredCategoryIntegrations.length === 0) return null
              
              const Icon = categoryIcons[category as IntegrationCategory] || Database
              
              return (
                <div key={category} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">
                      {categoryLabels[category as IntegrationCategory] || category}
                    </h3>
                    <Badge variant="secondary">
                      {filteredCategoryIntegrations.length}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCategoryIntegrations.map((integration) => (
                      <IntegrationCard
                        key={integration.id}
                        integration={integration}
                        onClick={() => handleIntegrationClick(integration)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modelProviders.map((provider) => (
              <Card key={provider.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <img
                        src={provider.icon}
                        alt={provider.name}
                        className="w-6 h-6"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{provider.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {provider.models.length} models
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {provider.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {provider.features.slice(0, 3).map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {provider.features.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{provider.features.length - 3}
                      </Badge>
                    )}
                  </div>
                  <Button className="w-full" size="sm">
                    Add Provider
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="interfaces" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations
              .filter(i => i.type === 'interface')
              .map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onClick={() => handleIntegrationClick(integration)}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="dev-tools" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations
              .filter(i => i.type === 'developer_tool')
              .map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onClick={() => handleIntegrationClick(integration)}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Integration Modal */}
      {selectedIntegration && (
        <IntegrationModal
          integration={selectedIntegration}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedIntegration(null)
          }}
        />
      )}
    </div>
  )
}