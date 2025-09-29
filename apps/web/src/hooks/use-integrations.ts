import { useState, useEffect } from 'react'
import { IntegrationConfig, ModelProvider, IntegrationType, IntegrationCategory, TriggerType, ModelType, ModelFeature } from '@/types/integrations'

export function useIntegrations() {
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([])
  const [modelProviders, setModelProviders] = useState<ModelProvider[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadIntegrations()
  }, [])

  const loadIntegrations = async () => {
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query GetAvailableIntegrations {
              availableIntegrations {
                id
                name
                slug
                description
                icon
                type
                category
                provider
                version
                status
                features
                configSchema
                credentialsSchema
              }
            }
          `
        })
      })
      
      const data = await response.json()
      if (data.errors) throw new Error(data.errors[0].message)
      
      // Mock data for development
      const mockIntegrations: IntegrationConfig[] = [
        {
          id: 'slack',
          name: 'Slack',
          slug: 'slack',
          description: 'Connect with Slack workspaces for messaging and notifications',
          icon: '/icons/slack.svg',
          type: IntegrationType.APP,
          category: IntegrationCategory.COMMUNICATION,
          provider: 'slack',
          version: '1.0.0',
          status: 'active' as const,
          features: ['Event Triggers', 'Message Sending', 'Channel Management'],
          triggers: [TriggerType.EVENT, TriggerType.ACTION],
          actions: ['send_message', 'create_channel'],
          configSchema: {} as any,
          credentialsSchema: {} as any,
          setupInstructions: [],
          documentation: 'https://docs.lamatic.ai/integrations/slack',
          examples: []
        },
        {
          id: 'google-drive',
          name: 'Google Drive',
          slug: 'google-drive',
          description: 'Access and sync files from Google Drive for RAG workflows',
          icon: '/icons/google-drive.svg',
          type: IntegrationType.DATA_SOURCE,
          category: IntegrationCategory.STORAGE,
          provider: 'google',
          version: '1.0.0',
          status: 'active' as const,
          features: ['File Sync', 'Document Processing', 'RAG Integration'],
          triggers: [TriggerType.SYNC, TriggerType.EVENT],
          actions: ['upload_file', 'create_folder'],
          configSchema: {} as any,
          credentialsSchema: {} as any,
          setupInstructions: [],
          documentation: 'https://docs.lamatic.ai/integrations/google-drive',
          examples: []
        }
        // Add more mock integrations...
      ]
      
      const mockModelProviders: ModelProvider[] = [
        {
          id: 'openai',
          name: 'OpenAI',
          slug: 'openai',
          description: 'Access GPT-4, DALL-E, and Whisper models',
          icon: '/icons/openai.svg',
          website: 'https://openai.com',
          apiKeyRequired: true,
          setupInstructions: [],
          features: ['Text Generation', 'Image Generation', 'Audio Transcription'],
          pricing: { type: 'paid', plans: [] },
          models: [
            {
              id: 'gpt-4',
              name: 'GPT-4',
              type: ModelType.CHAT,
              contextLength: 8192,
              maxTokens: 4096,
              inputPricing: 0.03,
              outputPricing: 0.06,
              features: [ModelFeature.FUNCTION_CALLING],
              capabilities: ['reasoning', 'coding']
            }
          ]
        }
      ]
      
      setIntegrations(mockIntegrations)
      setModelProviders(mockModelProviders)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load integrations')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    integrations,
    modelProviders,
    isLoading,
    error,
    reload: loadIntegrations
  }
}