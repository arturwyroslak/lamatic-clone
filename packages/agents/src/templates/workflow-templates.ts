// Comprehensive workflow templates for common automation scenarios
import { AgentTemplate } from './agent-templates'

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  featured: boolean
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  useCases: string[]
  nodes: WorkflowNode[]
  connections: WorkflowConnection[]
  variables: WorkflowVariable[]
  triggers: WorkflowTrigger[]
  stats?: {
    downloads: number
    rating: number
    reviews: number
    likes: number
  }
  metadata?: {
    createdAt: Date
    updatedAt: Date
    featured: boolean
    verified: boolean
    [key: string]: any
  }
}

export interface WorkflowNode {
  id: string
  type: 'trigger' | 'action' | 'condition' | 'agent' | 'integration' | 'tool'
  position: { x: number; y: number }
  data: {
    title: string
    description?: string
    config: Record<string, any>
    integration?: string
    agent?: string
    tool?: string
  }
}

export interface WorkflowConnection {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  condition?: string
}

export interface WorkflowVariable {
  id: string
  name: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  defaultValue?: any
  description?: string
  required: boolean
}

export interface WorkflowTrigger {
  id: string
  name?: string
  type: 'webhook' | 'schedule' | 'event' | 'manual' | 'form' | 'file_upload' | 'form_submission' | 'iot_stream' | 'behavioral_tracking'
  config: Record<string, any>
  enabled?: boolean
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'customer-support-automation',
    name: 'Customer Support Automation',
    description: 'Automatically categorize, route, and respond to customer support tickets',
    category: 'Customer Service',
    tags: ['support', 'automation', 'email', 'classification'],
    featured: true,
    difficulty: 'intermediate',
    estimatedTime: '15 minutes',
    useCases: [
      'Automatic ticket classification',
      'Smart routing to appropriate teams',
      'Automated first-response generation',
      'Escalation for complex issues'
    ],
    nodes: [
      {
        id: 'email-trigger',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          title: 'Email Received',
          description: 'Triggers when new support email arrives',
          config: {
            type: 'email',
            folder: 'support@company.com',
            filters: []
          }
        }
      },
      {
        id: 'classify-ticket',
        type: 'agent',
        position: { x: 300, y: 100 },
        data: {
          title: 'Classify Ticket',
          description: 'Analyze email content and classify issue type',
          agent: 'classification-agent',
          config: {
            model: 'gpt-4',
            categories: ['technical', 'billing', 'general', 'refund', 'urgent'],
            includeConfidence: true
          }
        }
      },
      {
        id: 'urgent-check',
        type: 'condition',
        position: { x: 500, y: 100 },
        data: {
          title: 'Is Urgent?',
          description: 'Check if ticket requires immediate attention',
          config: {
            condition: 'classification.category === "urgent" || classification.confidence > 0.9'
          }
        }
      },
      {
        id: 'urgent-notification',
        type: 'integration',
        position: { x: 700, y: 50 },
        data: {
          title: 'Notify Team Lead',
          description: 'Send immediate notification for urgent tickets',
          integration: 'slack',
          config: {
            action: 'send_message',
            channel: '#support-urgent',
            message: 'Urgent ticket received: {{email.subject}}'
          }
        }
      },
      {
        id: 'route-ticket',
        type: 'integration',
        position: { x: 700, y: 150 },
        data: {
          title: 'Route to Team',
          description: 'Assign ticket to appropriate team based on classification',
          integration: 'zendesk',
          config: {
            action: 'assign_ticket',
            assigneeMapping: {
              'technical': 'tech-team',
              'billing': 'billing-team',
              'general': 'general-support'
            }
          }
        }
      },
      {
        id: 'generate-response',
        type: 'agent',
        position: { x: 900, y: 150 },
        data: {
          title: 'Generate Auto-Response',
          description: 'Create personalized response based on issue type',
          agent: 'response-generator',
          config: {
            model: 'gpt-4',
            tone: 'professional',
            includeResolution: true
          }
        }
      },
      {
        id: 'send-response',
        type: 'integration',
        position: { x: 1100, y: 150 },
        data: {
          title: 'Send Response',
          description: 'Send generated response to customer',
          integration: 'email',
          config: {
            action: 'send_reply',
            template: 'support-response'
          }
        }
      }
    ],
    connections: [
      { id: 'c1', source: 'email-trigger', target: 'classify-ticket' },
      { id: 'c2', source: 'classify-ticket', target: 'urgent-check' },
      { id: 'c3', source: 'urgent-check', target: 'urgent-notification', condition: 'true' },
      { id: 'c4', source: 'urgent-check', target: 'route-ticket' },
      { id: 'c5', source: 'route-ticket', target: 'generate-response' },
      { id: 'c6', source: 'generate-response', target: 'send-response' }
    ],
    variables: [
      {
        id: 'support-email',
        name: 'Support Email Address',
        type: 'string',
        defaultValue: 'support@company.com',
        description: 'Email address to monitor for support tickets',
        required: true
      },
      {
        id: 'escalation-threshold',
        name: 'Escalation Confidence Threshold',
        type: 'number',
        defaultValue: 0.9,
        description: 'Confidence threshold for automatic escalation',
        required: false
      }
    ],
    triggers: [
      {
        id: 'email-webhook',
        type: 'webhook',
        config: {
          endpoint: '/webhooks/support-email',
          method: 'POST',
          authentication: 'api_key'
        }
      }
    ]
  },
  {
    id: 'content-marketing-pipeline',
    name: 'Content Marketing Pipeline',
    description: 'Automated content creation, optimization, and multi-channel distribution',
    category: 'Marketing',
    tags: ['content', 'marketing', 'social-media', 'automation'],
    featured: true,
    difficulty: 'advanced',
    estimatedTime: '30 minutes',
    useCases: [
      'Blog post generation from topics',
      'SEO optimization',
      'Social media adaptation',
      'Multi-platform publishing'
    ],
    nodes: [
      {
        id: 'topic-input',
        type: 'trigger',
        position: { x: 100, y: 200 },
        data: {
          title: 'Content Topic Input',
          description: 'Manual trigger or webhook with content topic',
          config: {
            type: 'webhook',
            inputSchema: {
              topic: 'string',
              targetAudience: 'string',
              keywords: 'array'
            }
          }
        }
      },
      {
        id: 'research-topic',
        type: 'agent',
        position: { x: 300, y: 200 },
        data: {
          title: 'Research Topic',
          description: 'Gather information and insights about the topic',
          agent: 'research-agent',
          config: {
            model: 'gpt-4',
            sources: ['web', 'news', 'academic'],
            depth: 'comprehensive'
          }
        }
      },
      {
        id: 'create-outline',
        type: 'agent',
        position: { x: 500, y: 200 },
        data: {
          title: 'Create Content Outline',
          description: 'Generate structured outline based on research',
          agent: 'content-planner',
          config: {
            model: 'gpt-4',
            structure: 'blog-post',
            includeHeadings: true,
            targetWordCount: 1500
          }
        }
      },
      {
        id: 'write-content',
        type: 'agent',
        position: { x: 700, y: 200 },
        data: {
          title: 'Write Full Content',
          description: 'Generate complete blog post from outline',
          agent: 'content-writer',
          config: {
            model: 'gpt-4',
            tone: 'professional',
            style: 'engaging',
            includeIntroConclusion: true
          }
        }
      },
      {
        id: 'seo-optimize',
        type: 'agent',
        position: { x: 900, y: 200 },
        data: {
          title: 'SEO Optimization',
          description: 'Optimize content for search engines',
          agent: 'seo-optimizer',
          config: {
            targetKeywords: '{{input.keywords}}',
            includeMetaDescription: true,
            addInternalLinks: true
          }
        }
      },
      {
        id: 'create-social-posts',
        type: 'agent',
        position: { x: 700, y: 350 },
        data: {
          title: 'Create Social Media Posts',
          description: 'Adapt content for different social platforms',
          agent: 'social-media-adapter',
          config: {
            platforms: ['twitter', 'linkedin', 'facebook'],
            includeHashtags: true,
            addCallToAction: true
          }
        }
      },
      {
        id: 'publish-blog',
        type: 'integration',
        position: { x: 1100, y: 150 },
        data: {
          title: 'Publish to Blog',
          description: 'Publish optimized content to company blog',
          integration: 'wordpress',
          config: {
            action: 'create_post',
            status: 'draft',
            category: '{{input.category}}'
          }
        }
      },
      {
        id: 'post-to-linkedin',
        type: 'integration',
        position: { x: 900, y: 350 },
        data: {
          title: 'Post to LinkedIn',
          description: 'Share content on LinkedIn company page',
          integration: 'linkedin',
          config: {
            action: 'post_update',
            includeLink: true
          }
        }
      },
      {
        id: 'post-to-twitter',
        type: 'integration',
        position: { x: 1100, y: 350 },
        data: {
          title: 'Post to Twitter',
          description: 'Share content on Twitter',
          integration: 'twitter',
          config: {
            action: 'post_tweet',
            includeThread: true
          }
        }
      }
    ],
    connections: [
      { id: 'c1', source: 'topic-input', target: 'research-topic' },
      { id: 'c2', source: 'research-topic', target: 'create-outline' },
      { id: 'c3', source: 'create-outline', target: 'write-content' },
      { id: 'c4', source: 'write-content', target: 'seo-optimize' },
      { id: 'c5', source: 'write-content', target: 'create-social-posts' },
      { id: 'c6', source: 'seo-optimize', target: 'publish-blog' },
      { id: 'c7', source: 'create-social-posts', target: 'post-to-linkedin' },
      { id: 'c8', source: 'create-social-posts', target: 'post-to-twitter' }
    ],
    variables: [
      {
        id: 'default-author',
        name: 'Default Author',
        type: 'string',
        defaultValue: 'Marketing Team',
        description: 'Default author for published content',
        required: true
      },
      {
        id: 'publishing-schedule',
        name: 'Publishing Schedule',
        type: 'object',
        defaultValue: { blog: 'immediate', social: 'scheduled' },
        description: 'When to publish content to different channels',
        required: false
      }
    ],
    triggers: [
      {
        id: 'content-webhook',
        type: 'webhook',
        config: {
          endpoint: '/webhooks/content-request',
          method: 'POST',
          authentication: 'bearer_token'
        }
      },
      {
        id: 'scheduled-trigger',
        type: 'schedule',
        config: {
          cron: '0 9 * * 1',
          timezone: 'UTC',
          description: 'Every Monday at 9 AM'
        }
      }
    ]
  },
  {
    id: 'sales-lead-qualification',
    name: 'Sales Lead Qualification & Nurturing',
    description: 'Automatically qualify leads, score them, and initiate personalized nurturing sequences',
    category: 'Sales',
    tags: ['sales', 'leads', 'qualification', 'nurturing', 'crm'],
    featured: true,
    difficulty: 'intermediate',
    estimatedTime: '20 minutes',
    useCases: [
      'Automatic lead scoring',
      'Qualification based on criteria',
      'Personalized email sequences',
      'CRM integration and updates'
    ],
    nodes: [
      {
        id: 'lead-capture',
        type: 'trigger',
        position: { x: 100, y: 300 },
        data: {
          title: 'New Lead Captured',
          description: 'Triggers when new lead is captured from forms or landing pages',
          config: {
            type: 'webhook',
            sources: ['website-form', 'landing-page', 'chatbot']
          }
        }
      },
      {
        id: 'enrich-lead',
        type: 'integration',
        position: { x: 300, y: 300 },
        data: {
          title: 'Enrich Lead Data',
          description: 'Gather additional information about the lead',
          integration: 'clearbit',
          config: {
            action: 'enrich_person',
            fallbackToCompany: true
          }
        }
      },
      {
        id: 'score-lead',
        type: 'agent',
        position: { x: 500, y: 300 },
        data: {
          title: 'Score Lead',
          description: 'Calculate lead score based on various factors',
          agent: 'lead-scoring-agent',
          config: {
            model: 'gpt-4',
            criteria: {
              companySize: 25,
              industry: 20,
              role: 30,
              intent: 25
            }
          }
        }
      },
      {
        id: 'qualify-lead',
        type: 'condition',
        position: { x: 700, y: 300 },
        data: {
          title: 'Is Qualified Lead?',
          description: 'Determine if lead meets qualification criteria',
          config: {
            condition: 'leadScore >= 70 && companySize >= 50'
          }
        }
      },
      {
        id: 'create-crm-record',
        type: 'integration',
        position: { x: 900, y: 200 },
        data: {
          title: 'Create CRM Record',
          description: 'Create lead record in CRM system',
          integration: 'salesforce',
          config: {
            action: 'create_lead',
            assignToSalesRep: true
          }
        }
      },
      {
        id: 'notify-sales',
        type: 'integration',
        position: { x: 1100, y: 200 },
        data: {
          title: 'Notify Sales Team',
          description: 'Send notification to assigned sales representative',
          integration: 'slack',
          config: {
            action: 'send_message',
            channel: '#sales-qualified-leads',
            includeLeadDetails: true
          }
        }
      },
      {
        id: 'start-nurturing',
        type: 'integration',
        position: { x: 900, y: 400 },
        data: {
          title: 'Start Nurturing Sequence',
          description: 'Begin automated email nurturing for unqualified leads',
          integration: 'mailchimp',
          config: {
            action: 'add_to_sequence',
            sequence: 'lead-nurturing-basic'
          }
        }
      },
      {
        id: 'personalize-outreach',
        type: 'agent',
        position: { x: 1100, y: 400 },
        data: {
          title: 'Personalize Outreach',
          description: 'Create personalized email content based on lead profile',
          agent: 'email-personalizer',
          config: {
            model: 'gpt-4',
            includeCompanyInfo: true,
            tone: 'professional'
          }
        }
      }
    ],
    connections: [
      { id: 'c1', source: 'lead-capture', target: 'enrich-lead' },
      { id: 'c2', source: 'enrich-lead', target: 'score-lead' },
      { id: 'c3', source: 'score-lead', target: 'qualify-lead' },
      { id: 'c4', source: 'qualify-lead', target: 'create-crm-record', condition: 'true' },
      { id: 'c5', source: 'create-crm-record', target: 'notify-sales' },
      { id: 'c6', source: 'qualify-lead', target: 'start-nurturing', condition: 'false' },
      { id: 'c7', source: 'start-nurturing', target: 'personalize-outreach' }
    ],
    variables: [
      {
        id: 'qualification-threshold',
        name: 'Lead Qualification Threshold',
        type: 'number',
        defaultValue: 70,
        description: 'Minimum score required for lead qualification',
        required: true
      },
      {
        id: 'nurturing-sequence',
        name: 'Nurturing Sequence ID',
        type: 'string',
        defaultValue: 'lead-nurturing-basic',
        description: 'Email sequence for unqualified leads',
        required: true
      }
    ],
    triggers: [
      {
        id: 'form-webhook',
        type: 'webhook',
        config: {
          endpoint: '/webhooks/new-lead',
          method: 'POST',
          authentication: 'hmac'
        }
      }
    ]
  },
  {
    id: 'document-processing-pipeline',
    name: 'Intelligent Document Processing',
    description: 'Extract, classify, and process documents with AI-powered analysis',
    category: 'Document Management',
    tags: ['documents', 'ocr', 'classification', 'extraction', 'automation'],
    featured: false,
    difficulty: 'advanced',
    estimatedTime: '25 minutes',
    useCases: [
      'Invoice processing and data extraction',
      'Contract analysis and key term extraction',
      'Resume screening and candidate matching',
      'Compliance document review'
    ],
    nodes: [
      {
        id: 'document-upload',
        type: 'trigger',
        position: { x: 100, y: 400 },
        data: {
          title: 'Document Uploaded',
          description: 'Triggers when new document is uploaded',
          config: {
            type: 'file_upload',
            acceptedTypes: ['pdf', 'doc', 'docx', 'jpg', 'png'],
            maxSize: '10MB'
          }
        }
      },
      {
        id: 'extract-text',
        type: 'tool',
        position: { x: 300, y: 400 },
        data: {
          title: 'Extract Text Content',
          description: 'Use OCR to extract text from document',
          tool: 'document_processor',
          config: {
            operation: 'extract_text',
            includeMetadata: true
          }
        }
      },
      {
        id: 'classify-document',
        type: 'agent',
        position: { x: 500, y: 400 },
        data: {
          title: 'Classify Document Type',
          description: 'Determine document type and category',
          agent: 'document-classifier',
          config: {
            model: 'gpt-4',
            categories: ['invoice', 'contract', 'resume', 'report', 'form'],
            includeConfidence: true
          }
        }
      },
      {
        id: 'route-by-type',
        type: 'condition',
        position: { x: 700, y: 400 },
        data: {
          title: 'Route by Document Type',
          description: 'Route document to appropriate processing pipeline',
          config: {
            conditions: {
              'invoice': 'classification.type === "invoice"',
              'contract': 'classification.type === "contract"',
              'resume': 'classification.type === "resume"'
            }
          }
        }
      },
      {
        id: 'process-invoice',
        type: 'agent',
        position: { x: 900, y: 300 },
        data: {
          title: 'Process Invoice',
          description: 'Extract invoice data and validate',
          agent: 'invoice-processor',
          config: {
            model: 'gpt-4',
            extractFields: ['vendor', 'amount', 'date', 'items', 'tax']
          }
        }
      },
      {
        id: 'process-contract',
        type: 'agent',
        position: { x: 900, y: 400 },
        data: {
          title: 'Analyze Contract',
          description: 'Extract key terms and analyze contract',
          agent: 'contract-analyzer',
          config: {
            model: 'gpt-4',
            extractKeyTerms: true,
            identifyRisks: true
          }
        }
      },
      {
        id: 'screen-resume',
        type: 'agent',
        position: { x: 900, y: 500 },
        data: {
          title: 'Screen Resume',
          description: 'Extract candidate information and match to requirements',
          agent: 'resume-screener',
          config: {
            model: 'gpt-4',
            jobRequirements: '{{variables.jobRequirements}}',
            scoreCandidate: true
          }
        }
      },
      {
        id: 'update-database',
        type: 'integration',
        position: { x: 1100, y: 400 },
        data: {
          title: 'Update Database',
          description: 'Store processed data in appropriate database',
          integration: 'postgresql',
          config: {
            action: 'insert_record',
            table: '{{classification.type}}_data'
          }
        }
      }
    ],
    connections: [
      { id: 'c1', source: 'document-upload', target: 'extract-text' },
      { id: 'c2', source: 'extract-text', target: 'classify-document' },
      { id: 'c3', source: 'classify-document', target: 'route-by-type' },
      { id: 'c4', source: 'route-by-type', target: 'process-invoice', condition: 'invoice' },
      { id: 'c5', source: 'route-by-type', target: 'process-contract', condition: 'contract' },
      { id: 'c6', source: 'route-by-type', target: 'screen-resume', condition: 'resume' },
      { id: 'c7', source: 'process-invoice', target: 'update-database' },
      { id: 'c8', source: 'process-contract', target: 'update-database' },
      { id: 'c9', source: 'screen-resume', target: 'update-database' }
    ],
    variables: [
      {
        id: 'job-requirements',
        name: 'Job Requirements',
        type: 'object',
        defaultValue: {
          skills: ['JavaScript', 'React', 'Node.js'],
          experience: '3+ years',
          education: 'Bachelor\'s degree'
        },
        description: 'Requirements for resume screening',
        required: false
      }
    ],
    triggers: [
      {
        id: 'file-upload-webhook',
        type: 'webhook',
        config: {
          endpoint: '/webhooks/document-upload',
          method: 'POST',
          authentication: 'api_key'
        }
      }
    ]
  },
  {
    id: 'social-media-monitoring',
    name: 'Social Media Monitoring & Response',
    description: 'Monitor brand mentions across social platforms and respond automatically',
    category: 'Social Media',
    tags: ['social-media', 'monitoring', 'brand', 'response', 'sentiment'],
    featured: false,
    difficulty: 'intermediate',
    estimatedTime: '18 minutes',
    useCases: [
      'Brand mention monitoring',
      'Sentiment analysis',
      'Automated responses to positive mentions',
      'Escalation of negative feedback'
    ],
    nodes: [
      {
        id: 'social-monitoring',
        type: 'trigger',
        position: { x: 100, y: 500 },
        data: {
          title: 'Social Media Mention',
          description: 'Monitors mentions across social platforms',
          config: {
            type: 'social_mention',
            platforms: ['twitter', 'facebook', 'instagram', 'linkedin'],
            keywords: ['{{variables.brandName}}', '@{{variables.brandHandle}}']
          }
        }
      },
      {
        id: 'analyze-sentiment',
        type: 'agent',
        position: { x: 300, y: 500 },
        data: {
          title: 'Analyze Sentiment',
          description: 'Determine sentiment and emotional tone of mention',
          agent: 'sentiment-analyzer',
          config: {
            model: 'gpt-4',
            includeConcerns: true,
            detectSarcasm: true
          }
        }
      },
      {
        id: 'categorize-mention',
        type: 'agent',
        position: { x: 500, y: 500 },
        data: {
          title: 'Categorize Mention',
          description: 'Classify mention type and context',
          agent: 'mention-categorizer',
          config: {
            categories: ['product-feedback', 'customer-service', 'general-mention', 'complaint', 'praise']
          }
        }
      },
      {
        id: 'sentiment-check',
        type: 'condition',
        position: { x: 700, y: 500 },
        data: {
          title: 'Check Sentiment',
          description: 'Route based on sentiment analysis',
          config: {
            conditions: {
              'positive': 'sentiment.score > 0.3',
              'negative': 'sentiment.score < -0.3',
              'neutral': 'sentiment.score >= -0.3 && sentiment.score <= 0.3'
            }
          }
        }
      },
      {
        id: 'thank-positive',
        type: 'agent',
        position: { x: 900, y: 400 },
        data: {
          title: 'Generate Thank You Response',
          description: 'Create personalized thank you message',
          agent: 'response-generator',
          config: {
            model: 'gpt-4',
            tone: 'grateful',
            includeCallToAction: true
          }
        }
      },
      {
        id: 'escalate-negative',
        type: 'integration',
        position: { x: 900, y: 600 },
        data: {
          title: 'Escalate to Support',
          description: 'Create support ticket for negative mentions',
          integration: 'zendesk',
          config: {
            action: 'create_ticket',
            priority: 'high',
            tags: ['social-media', 'escalation']
          }
        }
      },
      {
        id: 'post-response',
        type: 'integration',
        position: { x: 1100, y: 400 },
        data: {
          title: 'Post Response',
          description: 'Reply to positive mentions on social media',
          integration: '{{mention.platform}}',
          config: {
            action: 'reply_to_post',
            tone: 'brand-friendly'
          }
        }
      },
      {
        id: 'notify-team',
        type: 'integration',
        position: { x: 1100, y: 600 },
        data: {
          title: 'Notify Support Team',
          description: 'Alert support team about escalated issue',
          integration: 'slack',
          config: {
            action: 'send_message',
            channel: '#customer-support',
            urgency: 'high'
          }
        }
      }
    ],
    connections: [
      { id: 'c1', source: 'social-monitoring', target: 'analyze-sentiment' },
      { id: 'c2', source: 'analyze-sentiment', target: 'categorize-mention' },
      { id: 'c3', source: 'categorize-mention', target: 'sentiment-check' },
      { id: 'c4', source: 'sentiment-check', target: 'thank-positive', condition: 'positive' },
      { id: 'c5', source: 'sentiment-check', target: 'escalate-negative', condition: 'negative' },
      { id: 'c6', source: 'thank-positive', target: 'post-response' },
      { id: 'c7', source: 'escalate-negative', target: 'notify-team' }
    ],
    variables: [
      {
        id: 'brand-name',
        name: 'Brand Name',
        type: 'string',
        defaultValue: 'Your Company',
        description: 'Brand name to monitor',
        required: true
      },
      {
        id: 'brand-handle',
        name: 'Brand Handle',
        type: 'string',
        defaultValue: 'yourcompany',
        description: 'Social media handle to monitor',
        required: true
      }
    ],
    triggers: [
      {
        id: 'social-webhook',
        type: 'webhook',
        config: {
          endpoint: '/webhooks/social-mention',
          method: 'POST',
          authentication: 'bearer_token'
        }
      },
      {
        id: 'periodic-check',
        type: 'schedule',
        config: {
          cron: '*/15 * * * *',
          description: 'Check every 15 minutes'
        }
      }
    ]
  }
]

export const WORKFLOW_CATEGORIES = [
  'Customer Service',
  'Marketing',
  'Sales',
  'Document Management',
  'Social Media',
  'E-commerce',
  'HR & Recruiting',
  'Finance & Accounting',
  'Project Management',
  'Data Processing'
]

export function getTemplatesByCategory(category: string): WorkflowTemplate[] {
  return WORKFLOW_TEMPLATES.filter(template => template.category === category)
}

export function getFeaturedTemplates(): WorkflowTemplate[] {
  return WORKFLOW_TEMPLATES.filter(template => template.featured)
}

export function getTemplatesByDifficulty(difficulty: string): WorkflowTemplate[] {
  return WORKFLOW_TEMPLATES.filter(template => template.difficulty === difficulty)
}

export function searchTemplates(query: string): WorkflowTemplate[] {
  const lowercaseQuery = query.toLowerCase()
  return WORKFLOW_TEMPLATES.filter(template =>
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
    template.useCases.some(useCase => useCase.toLowerCase().includes(lowercaseQuery))
  )
}