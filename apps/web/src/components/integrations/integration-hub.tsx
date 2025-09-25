'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Search, 
  Plus, 
  Star, 
  Zap, 
  Database, 
  MessageSquare, 
  Cloud,
  Bot,
  Mail,
  Calendar,
  ShoppingCart,
  FileText,
  BarChart3,
  Users,
  Settings,
  CheckCircle,
  Circle
} from 'lucide-react'

interface Integration {
  id: string
  name: string
  description: string
  category: string
  icon: string
  connected: boolean
  featured: boolean
  rating: number
  installs: number
  tags: string[]
}

const mockIntegrations: Integration[] = [
  // AI Models
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Access GPT-4, DALL-E, and Whisper models for advanced AI capabilities',
    category: 'AI Models',
    icon: '🤖',
    connected: true,
    featured: true,
    rating: 4.9,
    installs: 125000,
    tags: ['gpt-4', 'text-generation', 'image-generation']
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude AI models for conversational AI and text analysis',
    category: 'AI Models',
    icon: '🧠',
    connected: false,
    featured: true,
    rating: 4.8,
    installs: 89000,
    tags: ['claude', 'conversation', 'analysis']
  },
  {
    id: 'cohere',
    name: 'Cohere',
    description: 'Text generation, embeddings, and classification models',
    category: 'AI Models',
    icon: '⚡',
    connected: false,
    featured: false,
    rating: 4.6,
    installs: 45000,
    tags: ['embeddings', 'classification', 'generation']
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    description: 'Access thousands of open-source AI models',
    category: 'AI Models',
    icon: '🤗',
    connected: false,
    featured: true,
    rating: 4.7,
    installs: 67000,
    tags: ['open-source', 'models', 'transformers']
  },

  // Communication
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send messages and notifications to Slack workspaces',
    category: 'Communication',
    icon: '💬',
    connected: true,
    featured: true,
    rating: 4.8,
    installs: 200000,
    tags: ['messaging', 'notifications', 'team-communication']
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Create Discord bots and manage server communications',
    category: 'Communication',
    icon: '🎮',
    connected: false,
    featured: false,
    rating: 4.5,
    installs: 78000,
    tags: ['bots', 'gaming', 'community']
  },
  {
    id: 'telegram',
    name: 'Telegram',
    description: 'Send messages and create Telegram bots',
    category: 'Communication',
    icon: '✈️',
    connected: false,
    featured: false,
    rating: 4.6,
    installs: 56000,
    tags: ['bots', 'messaging', 'automation']
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Send WhatsApp messages using Business API',
    category: 'Communication',
    icon: '📱',
    connected: false,
    featured: true,
    rating: 4.7,
    installs: 92000,
    tags: ['business', 'messaging', 'mobile']
  },

  // Databases
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    description: 'Connect to PostgreSQL databases for data operations',
    category: 'Databases',
    icon: '🐘',
    connected: true,
    featured: true,
    rating: 4.9,
    installs: 150000,
    tags: ['sql', 'relational', 'database']
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    description: 'NoSQL document database for flexible data storage',
    category: 'Databases',
    icon: '🍃',
    connected: false,
    featured: true,
    rating: 4.7,
    installs: 120000,
    tags: ['nosql', 'documents', 'flexible']
  },
  {
    id: 'pinecone',
    name: 'Pinecone',
    description: 'Vector database for AI applications and similarity search',
    category: 'Databases',
    icon: '🌲',
    connected: false,
    featured: true,
    rating: 4.8,
    installs: 67000,
    tags: ['vector', 'ai', 'similarity-search']
  },
  {
    id: 'weaviate',
    name: 'Weaviate',
    description: 'Open-source vector database with GraphQL API',
    category: 'Databases',
    icon: '🔗',
    connected: false,
    featured: false,
    rating: 4.6,
    installs: 34000,
    tags: ['vector', 'graphql', 'open-source']
  },

  // Cloud Storage
  {
    id: 'aws-s3',
    name: 'AWS S3',
    description: 'Store and retrieve files from Amazon S3 buckets',
    category: 'Storage',
    icon: '☁️',
    connected: false,
    featured: true,
    rating: 4.8,
    installs: 180000,
    tags: ['aws', 'storage', 'files']
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'Access and sync files from Google Drive',
    category: 'Storage',
    icon: '📁',
    connected: false,
    featured: true,
    rating: 4.7,
    installs: 145000,
    tags: ['google', 'files', 'sync']
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'File storage and sharing with Dropbox',
    category: 'Storage',
    icon: '📦',
    connected: false,
    featured: false,
    rating: 4.5,
    installs: 89000,
    tags: ['files', 'sharing', 'sync']
  },

  // Productivity
  {
    id: 'notion',
    name: 'Notion',
    description: 'Create and manage Notion pages and databases',
    category: 'Productivity',
    icon: '📝',
    connected: false,
    featured: true,
    rating: 4.8,
    installs: 98000,
    tags: ['notes', 'database', 'workspace']
  },
  {
    id: 'airtable',
    name: 'Airtable',
    description: 'Spreadsheet-database hybrid for structured data',
    category: 'Productivity',
    icon: '📊',
    connected: false,
    featured: true,
    rating: 4.7,
    installs: 76000,
    tags: ['database', 'spreadsheet', 'collaboration']
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    description: 'Read and write data to Google Sheets',
    category: 'Productivity',
    icon: '📈',
    connected: false,
    featured: false,
    rating: 4.6,
    installs: 134000,
    tags: ['spreadsheet', 'data', 'collaboration']
  },

  // Email & Calendar
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Send and receive emails through Gmail',
    category: 'Email',
    icon: '📧',
    connected: false,
    featured: true,
    rating: 4.7,
    installs: 156000,
    tags: ['email', 'google', 'communication']
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Manage events and schedules in Google Calendar',
    category: 'Calendar',
    icon: '📅',
    connected: false,
    featured: true,
    rating: 4.8,
    installs: 123000,
    tags: ['calendar', 'scheduling', 'events']
  },
  {
    id: 'calendly',
    name: 'Calendly',
    description: 'Schedule meetings and appointments automatically',
    category: 'Calendar',
    icon: '⏰',
    connected: false,
    featured: false,
    rating: 4.6,
    installs: 67000,
    tags: ['scheduling', 'meetings', 'automation']
  }
]

const categories = [
  { id: 'all', name: 'All Integrations', icon: Settings, count: mockIntegrations.length },
  { id: 'AI Models', name: 'AI Models', icon: Bot, count: mockIntegrations.filter(i => i.category === 'AI Models').length },
  { id: 'Communication', name: 'Communication', icon: MessageSquare, count: mockIntegrations.filter(i => i.category === 'Communication').length },
  { id: 'Databases', name: 'Databases', icon: Database, count: mockIntegrations.filter(i => i.category === 'Databases').length },
  { id: 'Storage', name: 'Storage', icon: Cloud, count: mockIntegrations.filter(i => i.category === 'Storage').length },
  { id: 'Productivity', name: 'Productivity', icon: FileText, count: mockIntegrations.filter(i => i.category === 'Productivity').length },
  { id: 'Email', name: 'Email', icon: Mail, count: mockIntegrations.filter(i => i.category === 'Email').length },
  { id: 'Calendar', name: 'Calendar', icon: Calendar, count: mockIntegrations.filter(i => i.category === 'Calendar').length }
]

export function IntegrationHub() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [filterConnected, setFilterConnected] = useState<'all' | 'connected' | 'available'>('all')

  const filteredIntegrations = useMemo(() => {
    return mockIntegrations.filter(integration => {
      const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          integration.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          integration.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory
      
      const matchesConnection = filterConnected === 'all' || 
                              (filterConnected === 'connected' && integration.connected) ||
                              (filterConnected === 'available' && !integration.connected)
      
      return matchesSearch && matchesCategory && matchesConnection
    })
  }, [searchTerm, selectedCategory, filterConnected])

  const connectedCount = mockIntegrations.filter(i => i.connected).length
  const featuredIntegrations = mockIntegrations.filter(i => i.featured)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Integration Hub</h1>
          <p className="text-gray-600 mt-1">
            Connect to 150+ services and AI models. {connectedCount} integrations connected.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-green-600 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            {connectedCount} Connected
          </Badge>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search integrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={filterConnected}
            onChange={(e) => setFilterConnected(e.target.value as any)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">All Status</option>
            <option value="connected">Connected</option>
            <option value="available">Available</option>
          </select>
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <ScrollArea className="w-full">
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-max gap-1">
            {categories.map((category) => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="flex items-center gap-2 px-4 py-2 whitespace-nowrap"
              >
                <category.icon className="h-4 w-4" />
                <span>{category.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        <TabsContent value={selectedCategory} className="mt-6">
          {/* Featured Section */}
          {selectedCategory === 'all' && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Featured Integrations
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredIntegrations.slice(0, 6).map((integration) => (
                  <IntegrationCard key={integration.id} integration={integration} featured />
                ))}
              </div>
            </div>
          )}

          {/* All Integrations */}
          <div>
            <h3 className="text-xl font-semibold mb-4">
              {selectedCategory === 'all' ? 'All Integrations' : `${selectedCategory} Integrations`}
              <Badge variant="outline" className="ml-2">
                {filteredIntegrations.length}
              </Badge>
            </h3>
            
            {filteredIntegrations.length === 0 ? (
              <Card className="p-8 text-center">
                <Circle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium mb-2">No integrations found</h4>
                <p className="text-gray-600">
                  Try adjusting your search criteria or browse different categories.
                </p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredIntegrations.map((integration) => (
                  <IntegrationCard key={integration.id} integration={integration} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function IntegrationCard({ integration, featured = false }: { integration: Integration; featured?: boolean }) {
  return (
    <Card className={`hover:shadow-md transition-shadow ${featured ? 'ring-2 ring-blue-100' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{integration.icon}</div>
            <div>
              <CardTitle className="text-lg">{integration.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {integration.category}
                </Badge>
                {integration.connected && (
                  <Badge className="text-xs bg-green-100 text-green-800">
                    Connected
                  </Badge>
                )}
                {featured && (
                  <Badge className="text-xs bg-yellow-100 text-yellow-800">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="mb-4">
          {integration.description}
        </CardDescription>
        
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500" />
              <span>{integration.rating}</span>
            </div>
            <span>{integration.installs.toLocaleString()} installs</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {integration.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {integration.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{integration.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            variant={integration.connected ? "outline" : "default"} 
            size="sm" 
            className="flex-1"
          >
            {integration.connected ? (
              <>
                <Settings className="h-3 w-3 mr-1" />
                Configure
              </>
            ) : (
              <>
                <Zap className="h-3 w-3 mr-1" />
                Connect
              </>
            )}
          </Button>
          <Button variant="ghost" size="sm">
            Learn More
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
