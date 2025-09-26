// Complete integrations system based on Lamatic.ai documentation

export * from './types'
export * from './registry'
export * from './connectors'
export * from './models'
export * from './providers'
export * from './validators'
export * from './utils'

// Main integration manager
export { IntegrationManager } from './manager'

// Connector categories
export * from './connectors/apps-data-sources'
export * from './connectors/models'
export * from './connectors/interfaces'
export * from './connectors/developer-tools'

// AI Model connectors
export * from './connectors/ai-models/openai'
export * from './connectors/ai-models/anthropic'
export * from './connectors/ai-models/cohere'
export * from './connectors/ai-models/mistral'
export * from './connectors/ai-models/groq'
export * from './connectors/ai-models/together-ai'
export * from './connectors/ai-models/replicate'
export * from './connectors/ai-models/perplexity'
export * from './connectors/ai-models/xai'
export * from './connectors/ai-models/huggingface'
export * from './connectors/ai-models/google-palm'

// Legacy model providers (deprecated - use ai-models connectors instead)
export * from './models/openai'
export * from './models/anthropic'
export * from './models/cohere'
export * from './models/huggingface'
export * from './models/together-ai'
export * from './models/fireworks-ai'
export * from './models/bedrock'
export * from './models/azure-openai'
export * from './models/google-ai'
export * from './models/xai'
export * from './models/deepinfra'
export * from './models/replicate'
export * from './models/perplexity'
export * from './models/mistral'
export * from './models/groq'

// Google Workspace connectors
export * from './connectors/google-workspace/google-sheets'
export * from './connectors/google-workspace/google-drive'
export * from './connectors/google-workspace/google-calendar'

// Project management connectors
export * from './connectors/project-management/linear'
export * from './connectors/project-management/jira'
export * from './connectors/project-management/asana'
export * from './connectors/project-management/trello'

// E-commerce connectors  
export * from './connectors/e-commerce/shopify'
export * from './connectors/e-commerce/woocommerce'

// Communication connectors
export * from './connectors/communication/slack'
export * from './connectors/communication/discord'
export * from './connectors/communication/teams'
export * from './connectors/communication/telegram'
export * from './connectors/communication/whatsapp'

// Productivity tool connectors
export * from './connectors/productivity-tools/notion'
export * from './connectors/productivity-tools/airtable'

// Developer tool connectors
export * from './connectors/developer-tools/github'
export * from './connectors/developer-tools/gitlab'
export * from './connectors/developer-tools/bitbucket'

// Marketing connectors
export * from './connectors/marketing/mailchimp'
export * from './connectors/marketing/hubspot'
export * from './connectors/marketing/convertkit'

// Analytics connectors
export * from './connectors/analytics/google-analytics'
export * from './connectors/analytics/mixpanel'

// Scheduling connectors
export * from './connectors/scheduling/calendly'

// CRM connectors
export * from './connectors/crm/salesforce'
export * from './connectors/crm/zendesk'

// Cloud services connectors
export * from './connectors/cloud-services/aws-lambda'
export * from './connectors/cloud-services/aws-s3'

// Finance connectors
export * from './connectors/finance/quickbooks'
export * from './connectors/finance/xero'

// Social media connectors
export * from './connectors/social-media/twitter'
export * from './connectors/social-media/linkedin'

// Video conferencing connectors
export * from './connectors/video-conferencing/zoom'
export * from './connectors/video-conferencing/microsoft-teams'

// Business service connectors
export * from './connectors/business-services/stripe'

// CRM connectors
export * from './connectors/crm/salesforce'

// Database connectors
export * from './connectors/databases/postgresql'
export * from './connectors/databases/mongodb'
export * from './connectors/databases/redis'
export * from './connectors/databases/elasticsearch'
export * from './connectors/databases/weaviate'
export * from './connectors/databases/weaviate-enhanced'

// Storage connectors
export * from './connectors/storage/aws-s3'

// Legacy app connectors (many not yet implemented)
export * from './connectors/google-drive'
export * from './connectors/google-sheets'
export * from './connectors/microsoft-teams'
export * from './connectors/onedrive'
export * from './connectors/sharepoint'
export * from './connectors/gitlab'
export * from './connectors/linear'
export * from './connectors/jira'
export * from './connectors/asana'
export * from './connectors/trello'
export * from './connectors/whatsapp'
export * from './connectors/email'
export * from './connectors/calendly'
export * from './connectors/hubspot'
export * from './connectors/zendesk'
export * from './connectors/intercom'
export * from './connectors/shopify'
export * from './connectors/woocommerce'
export * from './connectors/zapier'
export * from './connectors/n8n'
export * from './connectors/firecrawl'
export * from './connectors/web-search'