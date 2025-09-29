import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create default user
  const user = await prisma.user.upsert({
    where: { email: 'admin@lamatic.ai' },
    update: {},
    create: {
      email: 'admin@lamatic.ai',
      name: 'Admin User',
      role: 'ADMIN',
    },
  })

  console.log('✅ Created user:', user.email)

  // Create default workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      name: 'Default Workspace',
      slug: 'default',
      description: 'Default workspace for development',
      plan: 'PRO',
      owner: {
        connect: { id: user.id }
      }
    },
  })

  console.log('✅ Created workspace:', workspace.name)

  // Add user to workspace
  await prisma.workspaceMember.upsert({
    where: {
      id: `${user.id}_${workspace.id}`
    },
    update: {},
    create: {
      userId: user.id,
      workspaceId: workspace.id,
      role: 'OWNER',
    },
  })

  // Create sample workflow
  const workflow = await prisma.workflow.create({
    data: {
      name: 'Sample Chat Workflow',
      description: 'A sample workflow that processes Slack messages with AI',
      version: 1,
      status: 'DRAFT',
      definition: {
        nodes: [
          {
            id: 'trigger-1',
            type: 'slack-trigger',
            position: { x: 100, y: 100 },
            data: {
              type: 'trigger',
              title: 'Slack Message',
              description: 'Triggered when a new message is posted in Slack',
              config: {
                channel: '#general',
                triggerOn: 'mention'
              }
            }
          },
          {
            id: 'llm-1',
            type: 'gpt-4',
            position: { x: 400, y: 100 },
            data: {
              type: 'llm',
              title: 'GPT-4',
              description: 'Generate response using GPT-4',
              config: {
                model: 'gpt-4',
                temperature: 0.7,
                maxTokens: 1000
              }
            }
          },
          {
            id: 'action-1',
            type: 'slack-action',
            position: { x: 700, y: 100 },
            data: {
              type: 'action',
              title: 'Send Response',
              description: 'Send response back to Slack',
              config: {
                channel: 'same',
                responseType: 'thread'
              }
            }
          }
        ],
        connections: [
          {
            id: 'e1-2',
            source: 'trigger-1',
            target: 'llm-1'
          },
          {
            id: 'e2-3',
            source: 'llm-1',
            target: 'action-1'
          }
        ]
      },
      tags: ['ai', 'chat', 'slack'],
      author: {
        connect: { id: user.id }
      },
      workspace: {
        connect: { id: workspace.id }
      },
    },
  })

  console.log('✅ Created workflow:', workflow.name)

  // Sample integrations data structure (for future implementation)
  // Note: Integration model not found in schema, skipping integration creation
  console.log('⚠️ Integration model not found, skipping integration seeding')

  // Create sample templates
  const templates = [
    {
      name: 'AI Customer Support',
      description: 'Automated customer support with AI responses',
      category: 'Customer Service',
      tags: ['ai', 'support', 'automation'],
      featured: true,
      public: true,
      definition: {
        nodes: [
          { id: 'webhook-trigger', type: 'webhook', data: { title: 'Support Request' } },
          { id: 'sentiment-analysis', type: 'ai-processor', data: { title: 'Analyze Sentiment' } },
          { id: 'ai-response', type: 'gpt-4', data: { title: 'Generate Response' } },
          { id: 'send-email', type: 'email-action', data: { title: 'Send Email' } }
        ]
      },
      workspaceId: workspace.id,
    },
    {
      name: 'Document Processing Pipeline',
      description: 'Process and analyze documents with AI',
      category: 'Document Processing',
      tags: ['documents', 'ai', 'processing'],
      featured: true,
      public: true,
      definition: {
        nodes: [
          { id: 'file-upload', type: 'webhook', data: { title: 'File Upload' } },
          { id: 'extract-text', type: 'text-processor', data: { title: 'Extract Text' } },
          { id: 'summarize', type: 'gpt-4', data: { title: 'Summarize Content' } },
          { id: 'save-summary', type: 'database-action', data: { title: 'Save Summary' } }
        ]
      },
      workspaceId: workspace.id,
    },
    {
      name: 'Social Media Monitor',
      description: 'Monitor social media mentions and respond automatically',
      category: 'Social Media',
      tags: ['social', 'monitoring', 'automation'],
      featured: false,
      public: true,
      definition: {
        nodes: [
          { id: 'social-trigger', type: 'webhook', data: { title: 'Social Mention' } },
          { id: 'analyze-sentiment', type: 'ai-processor', data: { title: 'Sentiment Analysis' } },
          { id: 'generate-response', type: 'gpt-4', data: { title: 'Generate Response' } },
          { id: 'post-reply', type: 'social-action', data: { title: 'Post Reply' } }
        ]
      },
      workspaceId: workspace.id,
    }
  ]

  for (const template of templates) {
    await prisma.template.create({ data: template })
    console.log('✅ Created template:', template.name)
  }

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })