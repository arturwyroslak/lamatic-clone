// Advanced workflow templates showcasing the enhanced integration capabilities
import { WorkflowTemplate, WorkflowNode, WorkflowConnection, WorkflowVariable, WorkflowTrigger } from './workflow-templates'

export const ADVANCED_WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'ai-powered-ecommerce-support',
    name: 'AI-Powered E-commerce Customer Support',
    description: 'Automated customer support workflow using multiple AI models and integrations',
    category: 'E-commerce',
    tags: ['ai', 'customer-support', 'shopify', 'slack', 'notion'],
    featured: true,
    difficulty: 'advanced',
    estimatedTime: '30 minutes',
    useCases: [
      'Automated customer inquiry classification',
      'AI-powered response generation',
      'Order status checking via Shopify',
      'Knowledge base lookup from Notion',
      'Team notifications via Slack',
      'Follow-up task creation in Linear'
    ],
    nodes: [
      {
        id: 'email-trigger',
        type: 'trigger',
        position: { x: 100, y: 200 },
        data: {
          title: 'Customer Email Received',
          description: 'Trigger when customer support email is received',
          config: {
            type: 'webhook',
            endpoint: '/webhooks/customer-email',
            validation: 'email_support'
          }
        }
      },
      {
        id: 'classify-inquiry',
        type: 'integration',
        position: { x: 350, y: 100 },
        data: {
          title: 'Classify Customer Inquiry',
          description: 'Use Cohere to classify the type of inquiry',
          integration: 'cohere',
          config: {
            operation: 'classify',
            model: 'command',
            examples: [
              { text: 'Where is my order?', label: 'order_status' },
              { text: 'I want to return this item', label: 'return_request' },
              { text: 'How do I use this product?', label: 'product_support' },
              { text: 'I need to change my address', label: 'account_update' }
            ]
          }
        }
      },
      {
        id: 'check-order-status',
        type: 'integration',
        position: { x: 600, y: 50 },
        data: {
          title: 'Check Order in Shopify',
          description: 'Retrieve order information from Shopify',
          integration: 'shopify',
          config: {
            operation: 'getOrder',
            conditional: 'classification.label === "order_status"'
          }
        }
      },
      {
        id: 'search-knowledge-base',
        type: 'integration',
        position: { x: 600, y: 150 },
        data: {
          title: 'Search Knowledge Base',
          description: 'Search Notion knowledge base for relevant information',
          integration: 'notion',
          config: {
            operation: 'search',
            query: '{{customer_inquiry}}',
            filter: {
              property: 'Category',
              select: { equals: 'Customer Support' }
            }
          }
        }
      },
      {
        id: 'generate-response',
        type: 'integration',
        position: { x: 850, y: 100 },
        data: {
          title: 'Generate AI Response',
          description: 'Use GPT-4 to generate personalized response',
          integration: 'openai',
          config: {
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: 'You are a helpful customer support agent. Use the provided information to craft a helpful, empathetic response.'
              },
              {
                role: 'user',
                content: 'Customer inquiry: {{customer_inquiry}}\nOrder info: {{order_info}}\nKnowledge base: {{kb_results}}'
              }
            ],
            temperature: 0.7,
            max_tokens: 500
          }
        }
      },
      {
        id: 'send-response',
        type: 'integration',
        position: { x: 1100, y: 100 },
        data: {
          title: 'Send Email Response',
          description: 'Send the generated response back to customer',
          integration: 'email',
          config: {
            to: '{{customer_email}}',
            subject: 'Re: {{original_subject}}',
            body: '{{ai_response}}',
            from: 'support@company.com'
          }
        }
      },
      {
        id: 'notify-team',
        type: 'integration',
        position: { x: 850, y: 250 },
        data: {
          title: 'Notify Support Team',
          description: 'Send notification to Slack if escalation needed',
          integration: 'slack',
          config: {
            channel: '#customer-support',
            message: '🚨 Customer inquiry may need escalation:\n**Customer:** {{customer_email}}\n**Type:** {{classification.label}}\n**Confidence:** {{classification.confidence}}',
            conditional: 'classification.confidence < 0.8'
          }
        }
      },
      {
        id: 'create-followup-task',
        type: 'integration',
        position: { x: 1100, y: 250 },
        data: {
          title: 'Create Follow-up Task',
          description: 'Create task in Linear for complex issues',
          integration: 'linear',
          config: {
            operation: 'graphql',
            query: `
              mutation CreateIssue($input: IssueCreateInput!) {
                issueCreate(input: $input) {
                  success
                  issue { id identifier title }
                }
              }
            `,
            variables: {
              input: {
                title: 'Follow up: {{classification.label}} - {{customer_email}}',
                description: 'Customer inquiry: {{customer_inquiry}}\n\nAI Response: {{ai_response}}',
                teamId: '{{support_team_id}}',
                priority: 2
              }
            },
            conditional: 'classification.label === "complex_issue" || classification.confidence < 0.7'
          }
        }
      },
      {
        id: 'update-customer-record',
        type: 'integration',
        position: { x: 600, y: 350 },
        data: {
          title: 'Update Customer Record',
          description: 'Log interaction in Airtable CRM',
          integration: 'airtable',
          config: {
            operation: 'createRecords',
            tableName: 'Customer Interactions',
            records: [
              {
                fields: {
                  'Customer Email': '{{customer_email}}',
                  'Inquiry Type': '{{classification.label}}',
                  'AI Response': '{{ai_response}}',
                  'Timestamp': '{{timestamp}}',
                  'Confidence': '{{classification.confidence}}',
                  'Status': 'Completed'
                }
              }
            ]
          }
        }
      },
      {
        id: 'sentiment-analysis',
        type: 'integration',
        position: { x: 350, y: 300 },
        data: {
          title: 'Analyze Customer Sentiment',
          description: 'Use Mistral AI to analyze customer sentiment',
          integration: 'mistral',
          config: {
            operation: 'chat',
            model: 'mistral-small',
            messages: [
              {
                role: 'system',
                content: 'Analyze the sentiment of the customer message. Respond with just: positive, negative, or neutral'
              },
              {
                role: 'user',
                content: '{{customer_inquiry}}'
              }
            ],
            temperature: 0.1
          }
        }
      }
    ],
    connections: [
      { id: 'c1', source: 'email-trigger', target: 'classify-inquiry' },
      { id: 'c2', source: 'email-trigger', target: 'sentiment-analysis' },
      { id: 'c3', source: 'classify-inquiry', target: 'check-order-status' },
      { id: 'c4', source: 'classify-inquiry', target: 'search-knowledge-base' },
      { id: 'c5', source: 'check-order-status', target: 'generate-response' },
      { id: 'c6', source: 'search-knowledge-base', target: 'generate-response' },
      { id: 'c7', source: 'generate-response', target: 'send-response' },
      { id: 'c8', source: 'classify-inquiry', target: 'notify-team' },
      { id: 'c9', source: 'notify-team', target: 'create-followup-task' },
      { id: 'c10', source: 'sentiment-analysis', target: 'update-customer-record' },
      { id: 'c11', source: 'generate-response', target: 'update-customer-record' }
    ],
    variables: [
      {
        id: 'support-team-id',
        name: 'Support Team ID',
        type: 'string',
        defaultValue: 'team_123456',
        description: 'Linear team ID for support tasks',
        required: true
      },
      {
        id: 'escalation-threshold',
        name: 'Escalation Confidence Threshold',
        type: 'number',
        defaultValue: 0.8,
        description: 'Minimum confidence score before escalation',
        required: true
      },
      {
        id: 'shopify-store-domain',
        name: 'Shopify Store Domain',
        type: 'string',
        defaultValue: 'your-store.myshopify.com',
        description: 'Your Shopify store domain',
        required: true
      }
    ],
    triggers: [
      {
        id: 'email-webhook',
        name: 'Customer Email Webhook',
        type: 'webhook',
        config: {
          method: 'POST',
          path: '/webhooks/customer-email',
          authentication: 'api_key'
        }
      }
    ]
  },
  {
    id: 'multi-ai-content-generation',
    name: 'Multi-AI Content Generation Pipeline',
    description: 'Compare and combine multiple AI models for optimal content generation',
    category: 'Content Creation',
    tags: ['ai', 'content', 'comparison', 'optimization'],
    featured: true,
    difficulty: 'advanced',
    estimatedTime: '20 minutes',
    useCases: [
      'Generate content with multiple AI models',
      'Compare output quality and style',
      'Combine best elements from different models',
      'Optimize content for different platforms',
      'Store results in Google Sheets for analysis'
    ],
    nodes: [
      {
        id: 'content-brief-trigger',
        type: 'trigger',
        position: { x: 100, y: 200 },
        data: {
          title: 'Content Brief Input',
          description: 'Receive content brief and requirements',
          config: {
            type: 'form',
            fields: ['topic', 'tone', 'length', 'target_audience', 'platform']
          }
        }
      },
      {
        id: 'gpt4-generation',
        type: 'integration',
        position: { x: 350, y: 100 },
        data: {
          title: 'GPT-4 Content Generation',
          description: 'Generate content using OpenAI GPT-4',
          integration: 'openai',
          config: {
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: 'You are a professional content writer. Create engaging content based on the brief.'
              },
              {
                role: 'user',
                content: 'Topic: {{topic}}\nTone: {{tone}}\nLength: {{length}}\nAudience: {{target_audience}}\nPlatform: {{platform}}'
              }
            ],
            temperature: 0.7
          }
        }
      },
      {
        id: 'claude-generation',
        type: 'integration',
        position: { x: 350, y: 200 },
        data: {
          title: 'Claude Content Generation',
          description: 'Generate content using Anthropic Claude',
          integration: 'anthropic',
          config: {
            model: 'claude-3-sonnet-20240229',
            messages: [
              {
                role: 'user',
                content: 'Create content for: {{topic}}\nTone: {{tone}}\nLength: {{length}}\nAudience: {{target_audience}}\nPlatform: {{platform}}'
              }
            ],
            max_tokens: 2000
          }
        }
      },
      {
        id: 'mistral-generation',
        type: 'integration',
        position: { x: 350, y: 300 },
        data: {
          title: 'Mistral Content Generation',
          description: 'Generate content using Mistral AI',
          integration: 'mistral',
          config: {
            operation: 'chat',
            model: 'mistral-large-latest',
            messages: [
              {
                role: 'user',
                content: 'Write content about {{topic}} with a {{tone}} tone for {{target_audience}} on {{platform}}. Length: {{length}}'
              }
            ]
          }
        }
      },
      {
        id: 'cohere-generation',
        type: 'integration',
        position: { x: 350, y: 400 },
        data: {
          title: 'Cohere Content Generation',
          description: 'Generate content using Cohere',
          integration: 'cohere',
          config: {
            operation: 'generate',
            model: 'command-r-plus',
            prompt: 'Write {{length}} content about {{topic}} with a {{tone}} tone for {{target_audience}} on {{platform}}:',
            temperature: 0.6
          }
        }
      },
      {
        id: 'content-comparison',
        type: 'integration',
        position: { x: 600, y: 250 },
        data: {
          title: 'Compare Content Quality',
          description: 'Use Groq for fast content comparison and scoring',
          integration: 'groq',
          config: {
            model: 'llama3-70b-8192',
            messages: [
              {
                role: 'system',
                content: 'Compare and score these content pieces on creativity, clarity, engagement, and relevance. Provide scores 1-10 and brief reasoning.'
              },
              {
                role: 'user',
                content: 'GPT-4: {{gpt4_content}}\n\nClaude: {{claude_content}}\n\nMistral: {{mistral_content}}\n\nCohere: {{cohere_content}}'
              }
            ]
          }
        }
      },
      {
        id: 'synthesize-best',
        type: 'integration',
        position: { x: 850, y: 250 },
        data: {
          title: 'Synthesize Best Version',
          description: 'Create optimal content combining best elements',
          integration: 'together-ai',
          config: {
            operation: 'chat',
            model: 'meta-llama/Llama-2-70b-chat-hf',
            messages: [
              {
                role: 'system',
                content: 'You are an expert editor. Combine the best elements from multiple content versions to create the optimal final version.'
              },
              {
                role: 'user',
                content: 'Original brief: {{topic}}, {{tone}}, {{length}}\n\nContent versions:\n{{gpt4_content}}\n{{claude_content}}\n{{mistral_content}}\n{{cohere_content}}\n\nComparison analysis: {{comparison_results}}'
              }
            ]
          }
        }
      },
      {
        id: 'save-to-sheets',
        type: 'integration',
        position: { x: 1100, y: 200 },
        data: {
          title: 'Save Results to Google Sheets',
          description: 'Store content analysis and results',
          integration: 'google-sheets',
          config: {
            operation: 'appendValues',
            spreadsheetId: '{{analysis_sheet_id}}',
            range: 'Content Analysis!A:J',
            values: [
              [
                '{{timestamp}}',
                '{{topic}}',
                '{{tone}}',
                '{{platform}}',
                '{{gpt4_score}}',
                '{{claude_score}}',
                '{{mistral_score}}',
                '{{cohere_score}}',
                '{{final_content}}',
                '{{total_cost}}'
              ]
            ]
          }
        }
      },
      {
        id: 'publish-to-notion',
        type: 'integration',
        position: { x: 1100, y: 300 },
        data: {
          title: 'Save to Content Library',
          description: 'Store final content in Notion content library',
          integration: 'notion',
          config: {
            operation: 'createPage',
            parent: { database_id: '{{content_library_db_id}}' },
            properties: {
              'Title': { title: [{ text: { content: '{{topic}} - {{platform}}' } }] },
              'Platform': { select: { name: '{{platform}}' } },
              'Tone': { select: { name: '{{tone}}' } },
              'Status': { select: { name: 'Ready' } },
              'Created': { date: { start: '{{timestamp}}' } }
            },
            children: [
              {
                object: 'block',
                type: 'paragraph',
                paragraph: {
                  rich_text: [{ type: 'text', text: { content: '{{final_content}}' } }]
                }
              }
            ]
          }
        }
      }
    ],
    connections: [
      { id: 'c1', source: 'content-brief-trigger', target: 'gpt4-generation' },
      { id: 'c2', source: 'content-brief-trigger', target: 'claude-generation' },
      { id: 'c3', source: 'content-brief-trigger', target: 'mistral-generation' },
      { id: 'c4', source: 'content-brief-trigger', target: 'cohere-generation' },
      { id: 'c5', source: 'gpt4-generation', target: 'content-comparison' },
      { id: 'c6', source: 'claude-generation', target: 'content-comparison' },
      { id: 'c7', source: 'mistral-generation', target: 'content-comparison' },
      { id: 'c8', source: 'cohere-generation', target: 'content-comparison' },
      { id: 'c9', source: 'content-comparison', target: 'synthesize-best' },
      { id: 'c10', source: 'synthesize-best', target: 'save-to-sheets' },
      { id: 'c11', source: 'synthesize-best', target: 'publish-to-notion' }
    ],
    variables: [
      {
        id: 'analysis-sheet-id',
        name: 'Google Sheets Analysis ID',
        type: 'string',
        defaultValue: '',
        description: 'Google Sheets ID for content analysis tracking',
        required: true
      },
      {
        id: 'content-library-db-id',
        name: 'Notion Content Library Database ID', 
        type: 'string',
        defaultValue: '',
        description: 'Notion database ID for content library',
        required: true
      }
    ],
    triggers: [
      {
        id: 'content-form',
        name: 'Content Brief Form',
        type: 'form',
        config: {
          fields: [
            { name: 'topic', type: 'text', required: true },
            { name: 'tone', type: 'select', options: ['professional', 'casual', 'humorous', 'authoritative'] },
            { name: 'length', type: 'select', options: ['short', 'medium', 'long'] },
            { name: 'target_audience', type: 'text', required: true },
            { name: 'platform', type: 'select', options: ['blog', 'social', 'email', 'landing_page'] }
          ]
        }
      }
    ]
  }
]