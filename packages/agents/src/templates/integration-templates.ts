export interface IntegrationTemplate {
  id: string
  name: string
  description: string
  category: string
  integrations: string[]
  workflow: any // Would be a full workflow definition
  setupSteps: string[]
}

export const integrationTemplates: IntegrationTemplate[] = [
  {
    id: 'slack-notification',
    name: 'Slack Notification System',
    description: 'Send automated notifications to Slack channels',
    category: 'communication',
    integrations: ['slack', 'webhook'],
    workflow: {
      // Simplified workflow definition
      nodes: [],
      connections: []
    },
    setupSteps: [
      'Connect your Slack workspace',
      'Configure webhook endpoints',
      'Set up notification triggers'
    ]
  },
  {
    id: 'crm-sync',
    name: 'CRM Data Synchronization',
    description: 'Sync customer data between CRM systems',
    category: 'data-processing',
    integrations: ['salesforce', 'hubspot', 'airtable'],
    workflow: {
      nodes: [],
      connections: []
    },
    setupSteps: [
      'Connect CRM systems',
      'Map data fields',
      'Configure sync schedule',
      'Test data flow'
    ]
  }
]