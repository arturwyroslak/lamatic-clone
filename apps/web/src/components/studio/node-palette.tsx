'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  MessageSquare,
  Bot,
  Database,
  Image,
  FileText,
  Code,
  Zap,
  Filter,
  GitBranch,
  Settings,
  Calendar,
  Mail,
  Phone,
  Globe,
  ShoppingCart,
  CreditCard,
  Users,
  Building,
  Clock,
  Bell,
  Search,
  Download,
  Upload,
  Share2,
  Link,
  Hash,
  BarChart3,
  PieChart,
  TrendingUp,
  Activity,
  Eye,
  Lock,
  Unlock,
  Key,
  Shield
} from 'lucide-react'

// Complete node palette based on Lamatic.ai integrations
const nodeCategories = [
  {
    name: 'Triggers',
    description: 'Start your workflow with these triggers',
    nodes: [
      {
        type: 'slack-trigger',
        name: 'Slack Message',
        description: 'Triggered by Slack events',
        icon: MessageSquare,
        color: 'bg-green-500'
      },
      {
        type: 'teams-trigger',
        name: 'Teams Message',
        description: 'Triggered by Microsoft Teams events',
        icon: MessageSquare,
        color: 'bg-blue-500'
      },
      {
        type: 'webhook-trigger',
        name: 'Webhook',
        description: 'HTTP webhook trigger',
        icon: Zap,
        color: 'bg-orange-500'
      },
      {
        type: 'schedule-trigger',
        name: 'Schedule',
        description: 'Time-based trigger',
        icon: Clock,
        color: 'bg-purple-500'
      },
      {
        type: 'email-trigger',
        name: 'Email',
        description: 'Triggered by email events',
        icon: Mail,
        color: 'bg-red-500'
      },
      {
        type: 'form-trigger',
        name: 'Form Submit',
        description: 'Triggered by form submissions',
        icon: FileText,
        color: 'bg-indigo-500'
      }
    ]
  },
  {
    name: 'AI Models',
    description: 'AI-powered processing nodes',
    nodes: [
      {
        type: 'gpt-4',
        name: 'GPT-4',
        description: 'OpenAI GPT-4 model',
        icon: Bot,
        color: 'bg-green-600'
      },
      {
        type: 'claude-3',
        name: 'Claude 3',
        description: 'Anthropic Claude 3 model',
        icon: Bot,
        color: 'bg-orange-600'
      },
      {
        type: 'gemini',
        name: 'Gemini',
        description: 'Google Gemini model',
        icon: Bot,
        color: 'bg-blue-600'
      },
      {
        type: 'dall-e',
        name: 'DALL-E 3',
        description: 'OpenAI image generation',
        icon: Image,
        color: 'bg-pink-600'
      },
      {
        type: 'stable-diffusion',
        name: 'Stable Diffusion',
        description: 'Stability AI image generation',
        icon: Image,
        color: 'bg-purple-600'
      },
      {
        type: 'whisper',
        name: 'Whisper',
        description: 'OpenAI speech-to-text',
        icon: FileText,
        color: 'bg-teal-600'
      }
    ]
  },
  {
    name: 'Data Sources',
    description: 'Connect to external data sources',
    nodes: [
      {
        type: 'google-drive',
        name: 'Google Drive',
        description: 'Access Google Drive files',
        icon: Database,
        color: 'bg-yellow-500'
      },
      {
        type: 'google-sheets',
        name: 'Google Sheets',
        description: 'Read/write Google Sheets',
        icon: BarChart3,
        color: 'bg-green-500'
      },
      {
        type: 'airtable',
        name: 'Airtable',
        description: 'Access Airtable data',
        icon: Database,
        color: 'bg-orange-500'
      },
      {
        type: 'notion',
        name: 'Notion',
        description: 'Read/write Notion pages',
        icon: FileText,
        color: 'bg-gray-600'
      },
      {
        type: 'postgresql',
        name: 'PostgreSQL',
        description: 'Connect to PostgreSQL database',
        icon: Database,
        color: 'bg-blue-600'
      },
      {
        type: 'mongodb',
        name: 'MongoDB',
        description: 'Connect to MongoDB database',
        icon: Database,
        color: 'bg-green-600'
      },
      {
        type: 'aws-s3',
        name: 'AWS S3',
        description: 'Access AWS S3 buckets',
        icon: Database,
        color: 'bg-orange-600'
      }
    ]
  },
  {
    name: 'Communication',
    description: 'Send messages and notifications',
    nodes: [
      {
        type: 'slack-action',
        name: 'Send Slack Message',
        description: 'Send message to Slack',
        icon: MessageSquare,
        color: 'bg-green-500'
      },
      {
        type: 'teams-action',
        name: 'Send Teams Message',
        description: 'Send message to Microsoft Teams',
        icon: MessageSquare,
        color: 'bg-blue-500'
      },
      {
        type: 'discord-action',
        name: 'Send Discord Message',
        description: 'Send message to Discord',
        icon: MessageSquare,
        color: 'bg-indigo-500'
      },
      {
        type: 'email-action',
        name: 'Send Email',
        description: 'Send email message',
        icon: Mail,
        color: 'bg-red-500'
      },
      {
        type: 'sms-action',
        name: 'Send SMS',
        description: 'Send SMS message',
        icon: Phone,
        color: 'bg-green-500'
      },
      {
        type: 'telegram-action',
        name: 'Send Telegram',
        description: 'Send Telegram message',
        icon: MessageSquare,
        color: 'bg-blue-500'
      }
    ]
  },
  {
    name: 'Processing',
    description: 'Process and transform data',
    nodes: [
      {
        type: 'text-processor',
        name: 'Text Processor',
        description: 'Process and transform text',
        icon: FileText,
        color: 'bg-yellow-500'
      },
      {
        type: 'json-processor',
        name: 'JSON Processor',
        description: 'Parse and manipulate JSON',
        icon: Code,
        color: 'bg-blue-500'
      },
      {
        type: 'code-executor',
        name: 'Code Executor',
        description: 'Execute JavaScript code',
        icon: Code,
        color: 'bg-gray-500'
      },
      {
        type: 'filter',
        name: 'Filter',
        description: 'Filter data based on conditions',
        icon: Filter,
        color: 'bg-teal-500'
      },
      {
        type: 'mapper',
        name: 'Data Mapper',
        description: 'Map data between formats',
        icon: GitBranch,
        color: 'bg-purple-500'
      },
      {
        type: 'aggregator',
        name: 'Aggregator',
        description: 'Aggregate and combine data',
        icon: BarChart3,
        color: 'bg-orange-500'
      }
    ]
  },
  {
    name: 'Business Apps',
    description: 'Connect to business applications',
    nodes: [
      {
        type: 'hubspot',
        name: 'HubSpot',
        description: 'Connect to HubSpot CRM',
        icon: Building,
        color: 'bg-orange-500'
      },
      {
        type: 'salesforce',
        name: 'Salesforce',
        description: 'Connect to Salesforce CRM',
        icon: Building,
        color: 'bg-blue-500'
      },
      {
        type: 'zendesk',
        name: 'Zendesk',
        description: 'Connect to Zendesk support',
        icon: Users,
        color: 'bg-green-500'
      },
      {
        type: 'intercom',
        name: 'Intercom',
        description: 'Connect to Intercom chat',
        icon: MessageSquare,
        color: 'bg-blue-500'
      },
      {
        type: 'jira',
        name: 'Jira',
        description: 'Connect to Jira issues',
        icon: Settings,
        color: 'bg-blue-600'
      },
      {
        type: 'asana',
        name: 'Asana',
        description: 'Connect to Asana tasks',
        icon: Settings,
        color: 'bg-red-500'
      },
      {
        type: 'trello',
        name: 'Trello',
        description: 'Connect to Trello boards',
        icon: Settings,
        color: 'bg-blue-500'
      }
    ]
  },
  {
    name: 'E-commerce',
    description: 'E-commerce and payment integrations',
    nodes: [
      {
        type: 'shopify',
        name: 'Shopify',
        description: 'Connect to Shopify store',
        icon: ShoppingCart,
        color: 'bg-green-500'
      },
      {
        type: 'woocommerce',
        name: 'WooCommerce',
        description: 'Connect to WooCommerce store',
        icon: ShoppingCart,
        color: 'bg-purple-500'
      },
      {
        type: 'stripe',
        name: 'Stripe',
        description: 'Process payments with Stripe',
        icon: CreditCard,
        color: 'bg-indigo-500'
      },
      {
        type: 'paypal',
        name: 'PayPal',
        description: 'Process payments with PayPal',
        icon: CreditCard,
        color: 'bg-blue-500'
      }
    ]
  },
  {
    name: 'Utilities',
    description: 'Utility and helper nodes',
    nodes: [
      {
        type: 'delay',
        name: 'Delay',
        description: 'Add delay to workflow',
        icon: Clock,
        color: 'bg-gray-500'
      },
      {
        type: 'branch',
        name: 'Branch',
        description: 'Split flow into multiple paths',
        icon: GitBranch,
        color: 'bg-indigo-500'
      },
      {
        type: 'merge',
        name: 'Merge',
        description: 'Merge multiple paths',
        icon: GitBranch,
        color: 'bg-green-500'
      },
      {
        type: 'error-handler',
        name: 'Error Handler',
        description: 'Handle errors in workflow',
        icon: Shield,
        color: 'bg-red-500'
      },
      {
        type: 'logger',
        name: 'Logger',
        description: 'Log data for debugging',
        icon: Eye,
        color: 'bg-yellow-500'
      },
      {
        type: 'counter',
        name: 'Counter',
        description: 'Count occurrences',
        icon: Hash,
        color: 'bg-blue-500'
      }
    ]
  }
]

export function NodePalette() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6">
        {nodeCategories.map((category) => (
          <div key={category.name} className="space-y-3">
            <div>
              <h4 className="font-semibold text-sm">{category.name}</h4>
              <p className="text-xs text-muted-foreground">
                {category.description}
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {category.nodes.map((node) => {
                const IconComponent = node.icon
                return (
                  <Card
                    key={node.type}
                    className="p-3 cursor-move hover:shadow-md transition-all duration-200 hover:scale-105"
                    draggable
                    onDragStart={(e) => onDragStart(e, node.type)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded ${node.color} flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className="h-4 w-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate">
                          {node.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {node.description}
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
            
            {category !== nodeCategories[nodeCategories.length - 1] && (
              <Separator className="my-4" />
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}