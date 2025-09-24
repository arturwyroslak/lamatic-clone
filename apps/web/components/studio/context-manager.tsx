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
import { Progress } from '@/components/ui/progress'
import {
  Database,
  FileText,
  Globe,
  Search,
  Upload,
  Download,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  Filter,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap
} from 'lucide-react'

interface ContextSource {
  id: string
  name: string
  type: 'document' | 'database' | 'api' | 'web' | 'file'
  status: 'active' | 'syncing' | 'error' | 'inactive'
  description: string
  documents: number
  size: string
  lastSync: Date
  syncFrequency: string
  vectorized: boolean
  chunks: number
  embedding: string
}

interface VectorStore {
  id: string
  name: string
  provider: 'weaviate' | 'pinecone' | 'chroma' | 'qdrant'
  status: 'connected' | 'disconnected' | 'error'
  dimensions: number
  documents: number
  similarity: 'cosine' | 'euclidean' | 'dot'
  endpoint: string
  indexName: string
}

export function ContextManager() {
  const [activeTab, setActiveTab] = useState('sources')
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const [selectedStore, setSelectedStore] = useState<string | null>(null)
  
  const [contextSources, setContextSources] = useState<ContextSource[]>([
    {
      id: 'source-1',
      name: 'Company Documentation',
      type: 'document',
      status: 'active',
      description: 'Internal company docs and policies',
      documents: 247,
      size: '15.2 MB',
      lastSync: new Date('2024-01-22T10:30:00'),
      syncFrequency: 'Daily',
      vectorized: true,
      chunks: 1856,
      embedding: 'text-embedding-ada-002'
    },
    {
      id: 'source-2',
      name: 'Customer Database',
      type: 'database',
      status: 'syncing',
      description: 'PostgreSQL customer data',
      documents: 12450,
      size: '142.8 MB',
      lastSync: new Date('2024-01-22T09:15:00'),
      syncFrequency: 'Real-time',
      vectorized: false,
      chunks: 0,
      embedding: ''
    },
    {
      id: 'source-3',
      name: 'Knowledge Base API',
      type: 'api',
      status: 'active',
      description: 'External knowledge base REST API',
      documents: 892,
      size: '8.7 MB',
      lastSync: new Date('2024-01-22T08:45:00'),
      syncFrequency: 'Hourly',
      vectorized: true,
      chunks: 3204,
      embedding: 'text-embedding-ada-002'
    },
    {
      id: 'source-4',
      name: 'Website Content',
      type: 'web',
      status: 'error',
      description: 'Scraped website content',
      documents: 156,
      size: '2.3 MB',
      lastSync: new Date('2024-01-21T16:20:00'),
      syncFrequency: 'Weekly',
      vectorized: false,
      chunks: 0,
      embedding: ''
    }
  ])

  const [vectorStores, setVectorStores] = useState<VectorStore[]>([
    {
      id: 'store-1',
      name: 'Main Vector Database',
      provider: 'weaviate',
      status: 'connected',
      dimensions: 1536,
      documents: 5108,
      similarity: 'cosine',
      endpoint: 'https://lamatic-weaviate.weaviate.network',
      indexName: 'Documents'
    },
    {
      id: 'store-2',
      name: 'Secondary Index',
      provider: 'pinecone',
      status: 'connected',
      dimensions: 1536,
      documents: 2340,
      similarity: 'cosine',
      endpoint: 'https://lamatic-12345.pinecone.io',
      indexName: 'knowledge-base'
    }
  ])

  const getSourceIcon = (type: ContextSource['type']) => {
    switch (type) {
      case 'document': return <FileText className="h-4 w-4" />
      case 'database': return <Database className="h-4 w-4" />
      case 'api': return <Zap className="h-4 w-4" />
      case 'web': return <Globe className="h-4 w-4" />
      case 'file': return <Upload className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: ContextSource['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'syncing': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'inactive': return <Clock className="h-4 w-4 text-gray-400" />
      default: return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: ContextSource['status']) => {
    const variants = {
      active: 'default',
      syncing: 'secondary',
      error: 'destructive',
      inactive: 'outline'
    } as const
    
    return (
      <Badge variant={variants[status]}>
        {status}
      </Badge>
    )
  }

  const getTypeColor = (type: ContextSource['type']) => {
    const colors = {
      document: 'bg-blue-100 text-blue-800',
      database: 'bg-green-100 text-green-800',
      api: 'bg-purple-100 text-purple-800',
      web: 'bg-orange-100 text-orange-800',
      file: 'bg-gray-100 text-gray-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const syncSource = async (sourceId: string) => {
    setContextSources(prev => prev.map(source => 
      source.id === sourceId 
        ? { ...source, status: 'syncing' as const }
        : source
    ))
    
    // Simulate sync process
    setTimeout(() => {
      setContextSources(prev => prev.map(source => 
        source.id === sourceId 
          ? { 
              ...source, 
              status: 'active' as const, 
              lastSync: new Date(),
              documents: source.documents + Math.floor(Math.random() * 10)
            }
          : source
      ))
    }, 3000)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Database className="h-5 w-5" />
              Context Manager
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage data sources and vector databases for RAG workflows
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-1" />
              Sync All
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Source
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="w-full justify-start border-b rounded-none h-12 bg-transparent p-0">
            <TabsTrigger value="sources" className="rounded-none">Data Sources</TabsTrigger>
            <TabsTrigger value="vectors" className="rounded-none">Vector Stores</TabsTrigger>
            <TabsTrigger value="search" className="rounded-none">Search</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-none">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="sources" className="flex-1 m-0 p-4">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
              {/* Sources List */}
              <div className="xl:col-span-2">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Context Sources</CardTitle>
                      <div className="flex items-center gap-2">
                        <Input placeholder="Filter sources..." className="w-48" />
                        <Button size="sm" variant="outline">
                          <Filter className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-3">
                        {contextSources.map((source) => (
                          <div
                            key={source.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              selectedSource === source.id ? 'bg-accent' : 'hover:bg-accent/50'
                            }`}
                            onClick={() => setSelectedSource(source.id)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getSourceIcon(source.type)}
                                <span className="font-medium">{source.name}</span>
                                <Badge className={getTypeColor(source.type)}>
                                  {source.type}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(source.status)}
                                {getStatusBadge(source.status)}
                              </div>
                            </div>
                            
                            <div className="text-sm text-muted-foreground mb-3">
                              {source.description}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                              <div>
                                <span className="font-medium">Documents:</span> {source.documents.toLocaleString()}
                              </div>
                              <div>
                                <span className="font-medium">Size:</span> {source.size}
                              </div>
                              <div>
                                <span className="font-medium">Last Sync:</span> {source.lastSync.toLocaleTimeString()}
                              </div>
                              <div>
                                <span className="font-medium">Frequency:</span> {source.syncFrequency}
                              </div>
                              {source.vectorized && (
                                <>
                                  <div>
                                    <span className="font-medium">Chunks:</span> {source.chunks.toLocaleString()}
                                  </div>
                                  <div>
                                    <span className="font-medium">Embedding:</span> {source.embedding}
                                  </div>
                                </>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 mt-3 pt-2 border-t">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-7"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  syncSource(source.id)
                                }}
                                disabled={source.status === 'syncing'}
                              >
                                <RefreshCw className={`h-3 w-3 mr-1 ${source.status === 'syncing' ? 'animate-spin' : ''}`} />
                                Sync
                              </Button>
                              <Button size="sm" variant="outline" className="h-7">
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button size="sm" variant="outline" className="h-7">
                                <Settings className="h-3 w-3 mr-1" />
                                Settings
                              </Button>
                              {source.vectorized && (
                                <Badge variant="secondary" className="text-xs">
                                  <Zap className="h-3 w-3 mr-1" />
                                  Vectorized
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Source Details */}
              <div>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Source Details</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {selectedSource ? (
                      <ScrollArea className="h-[500px]">
                        {(() => {
                          const source = contextSources.find(s => s.id === selectedSource)
                          if (!source) return null
                          
                          return (
                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium">Name</Label>
                                <p className="text-sm">{source.name}</p>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Type</Label>
                                  <Badge className={`${getTypeColor(source.type)} mt-1`}>
                                    {source.type}
                                  </Badge>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Status</Label>
                                  <div className="flex items-center gap-2 mt-1">
                                    {getStatusIcon(source.status)}
                                    <span className="text-sm">{source.status}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <Separator />
                              
                              <div>
                                <Label className="text-sm font-medium">Statistics</Label>
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                  <div className="p-2 bg-muted rounded">
                                    <span className="text-xs text-muted-foreground">Documents</span>
                                    <p className="text-sm font-medium">{source.documents.toLocaleString()}</p>
                                  </div>
                                  <div className="p-2 bg-muted rounded">
                                    <span className="text-xs text-muted-foreground">Size</span>
                                    <p className="text-sm font-medium">{source.size}</p>
                                  </div>
                                  {source.vectorized && (
                                    <>
                                      <div className="p-2 bg-muted rounded">
                                        <span className="text-xs text-muted-foreground">Chunks</span>
                                        <p className="text-sm font-medium">{source.chunks.toLocaleString()}</p>
                                      </div>
                                      <div className="p-2 bg-muted rounded">
                                        <span className="text-xs text-muted-foreground">Embedding</span>
                                        <p className="text-sm font-medium text-xs">{source.embedding}</p>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium">Sync Settings</Label>
                                <div className="space-y-2 mt-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Frequency:</span>
                                    <span>{source.syncFrequency}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Last Sync:</span>
                                    <span>{source.lastSync.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Vectorized:</span>
                                    <span>{source.vectorized ? 'Yes' : 'No'}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-col gap-2 pt-2">
                                <Button size="sm" className="w-full">
                                  <RefreshCw className="h-3 w-3 mr-1" />
                                  Sync Now
                                </Button>
                                <Button size="sm" variant="outline" className="w-full">
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit Source
                                </Button>
                                <Button size="sm" variant="outline" className="w-full">
                                  <Download className="h-3 w-3 mr-1" />
                                  Export Data
                                </Button>
                                <Button size="sm" variant="destructive" className="w-full">
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete Source
                                </Button>
                              </div>
                            </div>
                          )
                        })()}
                      </ScrollArea>
                    ) : (
                      <div className="flex items-center justify-center h-[500px] text-muted-foreground">
                        Select a source to view details
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="vectors" className="flex-1 m-0 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vectorStores.map((store) => (
                <Card key={store.id} className="cursor-pointer hover:bg-accent/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        <span className="font-medium">{store.name}</span>
                      </div>
                      <Badge variant={store.status === 'connected' ? 'default' : 'destructive'}>
                        {store.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
                      <div>
                        <span className="font-medium">Provider:</span> {store.provider}
                      </div>
                      <div>
                        <span className="font-medium">Documents:</span> {store.documents.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Dimensions:</span> {store.dimensions}
                      </div>
                      <div>
                        <span className="font-medium">Similarity:</span> {store.similarity}
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground mb-3">
                      <div><strong>Endpoint:</strong> {store.endpoint}</div>
                      <div><strong>Index:</strong> {store.indexName}</div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Search className="h-3 w-3 mr-1" />
                        Query
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="search" className="flex-1 m-0 p-4">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Semantic Search
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Search Query</Label>
                    <Input 
                      placeholder="Enter your search query..." 
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Vector Store</Label>
                      <select className="w-full mt-1 p-2 border rounded">
                        <option>Main Vector Database</option>
                        <option>Secondary Index</option>
                      </select>
                    </div>
                    <div>
                      <Label>Results Limit</Label>
                      <Input type="number" defaultValue="10" className="mt-1" />
                    </div>
                    <div>
                      <Label>Similarity Threshold</Label>
                      <Input type="number" defaultValue="0.7" step="0.1" min="0" max="1" className="mt-1" />
                    </div>
                  </div>
                  <Button className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    Search Context
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Search Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Search results will appear here
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="flex-1 m-0 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Documents</p>
                      <p className="text-2xl font-bold">13,745</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Vector Chunks</p>
                      <p className="text-2xl font-bold">5,060</p>
                    </div>
                    <Zap className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Sources</p>
                      <p className="text-2xl font-bold">3</p>
                    </div>
                    <Database className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Storage Used</p>
                      <p className="text-2xl font-bold">168.5 MB</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Context Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Detailed analytics and insights about your context data would be displayed here
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}