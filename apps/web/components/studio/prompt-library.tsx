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
  FileText,
  MessageSquare,
  Code,
  Brain,
  Star,
  Copy,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Tag,
  Download,
  Upload,
  Share,
  BookOpen,
  Zap,
  Users
} from 'lucide-react'

interface PromptTemplate {
  id: string
  name: string
  description: string
  content: string
  category: 'chat' | 'completion' | 'analysis' | 'creative' | 'technical' | 'business'
  tags: string[]
  variables: string[]
  model: string
  temperature: number
  maxTokens: number
  isPublic: boolean
  rating: number
  usage: number
  author: string
  createdAt: Date
  updatedAt: Date
}

export function PromptLibrary() {
  const [activeTab, setActiveTab] = useState('library')
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  const [prompts, setPrompts] = useState<PromptTemplate[]>([
    {
      id: 'prompt-1',
      name: 'Customer Support Assistant',
      description: 'Helpful and empathetic customer support responses',
      content: `You are a professional customer support representative for {{company_name}}. 

Your role is to:
- Provide helpful and accurate information
- Show empathy for customer concerns
- Escalate complex issues when needed
- Maintain a professional but friendly tone

Customer inquiry: {{customer_message}}

Please respond in a helpful and professional manner.`,
      category: 'chat',
      tags: ['customer-service', 'support', 'professional'],
      variables: ['company_name', 'customer_message'],
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 500,
      isPublic: true,
      rating: 4.8,
      usage: 1250,
      author: 'system',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: 'prompt-2',
      name: 'Code Review Assistant',
      description: 'Comprehensive code review with suggestions',
      content: `You are an expert software engineer performing a code review. Analyze the following code and provide:

1. Code quality assessment
2. Security considerations
3. Performance improvements
4. Best practice recommendations
5. Bug identification

Code to review:
{{code}}

Programming language: {{language}}

Provide a detailed review with specific suggestions for improvement.`,
      category: 'technical',
      tags: ['code-review', 'programming', 'quality'],
      variables: ['code', 'language'],
      model: 'gpt-4',
      temperature: 0.3,
      maxTokens: 1000,
      isPublic: true,
      rating: 4.9,
      usage: 892,
      author: 'system',
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: 'prompt-3',
      name: 'Marketing Copy Generator',
      description: 'Engaging marketing content for products',
      content: `Create compelling marketing copy for {{product_name}}.

Product details:
- Product: {{product_name}}
- Target audience: {{target_audience}}
- Key benefits: {{key_benefits}}
- Tone: {{tone}}

Generate:
1. Catchy headline
2. Product description (100-150 words)
3. Call-to-action
4. Key selling points (3-5 bullet points)

Make it persuasive and engaging while staying true to the brand voice.`,
      category: 'creative',
      tags: ['marketing', 'copywriting', 'sales'],
      variables: ['product_name', 'target_audience', 'key_benefits', 'tone'],
      model: 'gpt-3.5-turbo',
      temperature: 0.8,
      maxTokens: 800,
      isPublic: false,
      rating: 4.6,
      usage: 456,
      author: 'user123',
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-18')
    },
    {
      id: 'prompt-4',
      name: 'Data Analysis Report',
      description: 'Structured analysis of datasets with insights',
      content: `Analyze the provided dataset and create a comprehensive report.

Dataset: {{dataset_description}}
Data: {{data}}

Please provide:

1. **Executive Summary**
   - Key findings (2-3 main insights)
   - Overall trends

2. **Detailed Analysis**
   - Statistical summary
   - Pattern identification
   - Anomaly detection

3. **Insights & Recommendations**
   - Actionable insights
   - Strategic recommendations
   - Next steps

4. **Visualizations Suggested**
   - Recommended chart types
   - Key metrics to highlight

Format the report professionally with clear sections and bullet points.`,
      category: 'analysis',
      tags: ['data-analysis', 'reporting', 'insights'],
      variables: ['dataset_description', 'data'],
      model: 'claude-3-sonnet',
      temperature: 0.4,
      maxTokens: 1500,
      isPublic: true,
      rating: 4.7,
      usage: 234,
      author: 'analyst_pro',
      createdAt: new Date('2024-01-14'),
      updatedAt: new Date('2024-01-22')
    },
    {
      id: 'prompt-5',
      name: 'Meeting Summary',
      description: 'Convert meeting transcripts into structured summaries',
      content: `Transform the following meeting transcript into a professional summary.

Meeting details:
- Date: {{meeting_date}}
- Participants: {{participants}}
- Topic: {{meeting_topic}}

Transcript:
{{transcript}}

Create a summary with:

1. **Meeting Overview**
2. **Key Discussion Points**
3. **Decisions Made**
4. **Action Items** (with assigned owners and deadlines)
5. **Next Steps**

Keep it concise but comprehensive.`,
      category: 'business',
      tags: ['meeting', 'summary', 'productivity'],
      variables: ['meeting_date', 'participants', 'meeting_topic', 'transcript'],
      model: 'gpt-4',
      temperature: 0.5,
      maxTokens: 1200,
      isPublic: true,
      rating: 4.5,
      usage: 678,
      author: 'business_user',
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-21')
    }
  ])

  const getCategoryIcon = (category: PromptTemplate['category']) => {
    switch (category) {
      case 'chat': return <MessageSquare className="h-4 w-4" />
      case 'completion': return <FileText className="h-4 w-4" />
      case 'analysis': return <Brain className="h-4 w-4" />
      case 'creative': return <Zap className="h-4 w-4" />
      case 'technical': return <Code className="h-4 w-4" />
      case 'business': return <Users className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: PromptTemplate['category']) => {
    const colors = {
      chat: 'bg-blue-100 text-blue-800',
      completion: 'bg-green-100 text-green-800',
      analysis: 'bg-purple-100 text-purple-800',
      creative: 'bg-pink-100 text-pink-800',
      technical: 'bg-orange-100 text-orange-800',
      business: 'bg-indigo-100 text-indigo-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < Math.floor(rating) 
          ? 'text-yellow-400 fill-current' 
          : i < rating 
            ? 'text-yellow-400 fill-current opacity-50' 
            : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Prompt Library
            </h2>
            <p className="text-sm text-muted-foreground">
              Create, manage, and share prompt templates for your AI workflows
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-1" />
              Import
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Prompt
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="w-full justify-start border-b rounded-none h-12 bg-transparent p-0">
            <TabsTrigger value="library" className="rounded-none">My Library</TabsTrigger>
            <TabsTrigger value="public" className="rounded-none">Public Templates</TabsTrigger>
            <TabsTrigger value="create" className="rounded-none">Create</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-none">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="flex-1 m-0 p-4">
            {/* Filters */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search prompts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Categories</option>
                <option value="chat">Chat</option>
                <option value="completion">Completion</option>
                <option value="analysis">Analysis</option>
                <option value="creative">Creative</option>
                <option value="technical">Technical</option>
                <option value="business">Business</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
              {/* Prompts List */}
              <div className="xl:col-span-2">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="grid gap-4">
                    {filteredPrompts.map((prompt) => (
                      <Card
                        key={prompt.id}
                        className={`cursor-pointer transition-colors ${
                          selectedPrompt === prompt.id ? 'ring-2 ring-primary' : 'hover:bg-accent/50'
                        }`}
                        onClick={() => setSelectedPrompt(prompt.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(prompt.category)}
                              <span className="font-medium">{prompt.name}</span>
                              <Badge className={getCategoryColor(prompt.category)}>
                                {prompt.category}
                              </Badge>
                              {prompt.isPublic && (
                                <Badge variant="outline" className="text-xs">
                                  <Share className="h-3 w-3 mr-1" />
                                  Public
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {renderStars(prompt.rating)}
                              <span className="text-xs text-muted-foreground ml-1">
                                ({prompt.rating})
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            {prompt.description}
                          </p>
                          
                          <div className="flex items-center gap-1 mb-3">
                            {prompt.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                            {prompt.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{prompt.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground mb-3">
                            <div>
                              <span className="font-medium">Model:</span> {prompt.model}
                            </div>
                            <div>
                              <span className="font-medium">Usage:</span> {prompt.usage}
                            </div>
                            <div>
                              <span className="font-medium">Variables:</span> {prompt.variables.length}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="h-7">
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </Button>
                            <Button size="sm" variant="outline" className="h-7">
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button size="sm" variant="outline" className="h-7">
                              <Download className="h-3 w-3 mr-1" />
                              Export
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Prompt Details */}
              <div>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Prompt Details</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {selectedPrompt ? (
                      <ScrollArea className="h-[calc(100vh-400px)]">
                        {(() => {
                          const prompt = prompts.find(p => p.id === selectedPrompt)
                          if (!prompt) return null
                          
                          return (
                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium">Name</Label>
                                <p className="text-sm">{prompt.name}</p>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium">Description</Label>
                                <p className="text-sm text-muted-foreground">{prompt.description}</p>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Category</Label>
                                  <Badge className={`${getCategoryColor(prompt.category)} mt-1`}>
                                    {prompt.category}
                                  </Badge>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Rating</Label>
                                  <div className="flex items-center gap-1 mt-1">
                                    {renderStars(prompt.rating)}
                                    <span className="text-xs text-muted-foreground ml-1">
                                      ({prompt.rating})
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <Separator />
                              
                              <div>
                                <Label className="text-sm font-medium">Configuration</Label>
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                  <div className="p-2 bg-muted rounded">
                                    <span className="text-xs text-muted-foreground">Model</span>
                                    <p className="text-sm font-medium">{prompt.model}</p>
                                  </div>
                                  <div className="p-2 bg-muted rounded">
                                    <span className="text-xs text-muted-foreground">Temperature</span>
                                    <p className="text-sm font-medium">{prompt.temperature}</p>
                                  </div>
                                  <div className="p-2 bg-muted rounded col-span-2">
                                    <span className="text-xs text-muted-foreground">Max Tokens</span>
                                    <p className="text-sm font-medium">{prompt.maxTokens}</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium">Variables</Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {prompt.variables.map((variable, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {`{{${variable}}}`}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium">Tags</Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {prompt.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      <Tag className="h-3 w-3 mr-1" />
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium">Prompt Content</Label>
                                <div className="mt-1 p-3 bg-muted rounded text-xs font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
                                  {prompt.content}
                                </div>
                              </div>
                              
                              <Separator />
                              
                              <div>
                                <Label className="text-sm font-medium">Usage Statistics</Label>
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                  <div className="p-2 bg-muted rounded">
                                    <span className="text-xs text-muted-foreground">Total Usage</span>
                                    <p className="text-sm font-medium">{prompt.usage}</p>
                                  </div>
                                  <div className="p-2 bg-muted rounded">
                                    <span className="text-xs text-muted-foreground">Author</span>
                                    <p className="text-sm font-medium">{prompt.author}</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-col gap-2 pt-2">
                                <Button size="sm" className="w-full">
                                  <Copy className="h-3 w-3 mr-1" />
                                  Use Prompt
                                </Button>
                                <Button size="sm" variant="outline" className="w-full">
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit Prompt
                                </Button>
                                <Button size="sm" variant="outline" className="w-full">
                                  <Star className="h-3 w-3 mr-1" />
                                  Add to Favorites
                                </Button>
                                <Button size="sm" variant="destructive" className="w-full">
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete Prompt
                                </Button>
                              </div>
                            </div>
                          )
                        })()}
                      </ScrollArea>
                    ) : (
                      <div className="flex items-center justify-center h-[calc(100vh-400px)] text-muted-foreground">
                        Select a prompt to view details
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="public" className="flex-1 m-0 p-4">
            <Card>
              <CardHeader>
                <CardTitle>Public Prompt Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Browse and discover prompts shared by the community
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="flex-1 m-0 p-4">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Prompt</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Prompt Name</Label>
                      <Input placeholder="Enter prompt name..." className="mt-1" />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <select className="w-full mt-1 p-2 border rounded">
                        <option>Select category</option>
                        <option>Chat</option>
                        <option>Completion</option>
                        <option>Analysis</option>
                        <option>Creative</option>
                        <option>Technical</option>
                        <option>Business</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Description</Label>
                    <Input placeholder="Brief description of the prompt..." className="mt-1" />
                  </div>
                  
                  <div>
                    <Label>Prompt Content</Label>
                    <Textarea 
                      placeholder="Enter your prompt template here. Use {{variable_name}} for variables..."
                      className="mt-1 min-h-[200px] font-mono"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Model</Label>
                      <select className="w-full mt-1 p-2 border rounded">
                        <option>gpt-4</option>
                        <option>gpt-3.5-turbo</option>
                        <option>claude-3-sonnet</option>
                        <option>claude-3-haiku</option>
                      </select>
                    </div>
                    <div>
                      <Label>Temperature</Label>
                      <Input type="number" step="0.1" min="0" max="1" defaultValue="0.7" className="mt-1" />
                    </div>
                    <div>
                      <Label>Max Tokens</Label>
                      <Input type="number" defaultValue="1000" className="mt-1" />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Tags (comma-separated)</Label>
                    <Input placeholder="tag1, tag2, tag3" className="mt-1" />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="public" />
                    <label htmlFor="public" className="text-sm">Make this prompt public</label>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Prompt
                    </Button>
                    <Button variant="outline">
                      Test Prompt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="flex-1 m-0 p-4">
            <Card>
              <CardHeader>
                <CardTitle>Library Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Default Model</Label>
                  <select className="w-full mt-1 p-2 border rounded">
                    <option>gpt-4</option>
                    <option>gpt-3.5-turbo</option>
                    <option>claude-3-sonnet</option>
                  </select>
                </div>
                <div>
                  <Label>Auto-save Interval</Label>
                  <Input type="number" defaultValue="30" className="mt-1" />
                  <p className="text-xs text-muted-foreground mt-1">Seconds between auto-saves</p>
                </div>
                <div>
                  <Label>Export Format</Label>
                  <select className="w-full mt-1 p-2 border rounded">
                    <option>JSON</option>
                    <option>YAML</option>
                    <option>CSV</option>
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