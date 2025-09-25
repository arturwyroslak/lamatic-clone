import { Badge } from '@/components/ui/badge'

const integrations = [
  { name: 'OpenAI', category: 'AI Models' },
  { name: 'Anthropic', category: 'AI Models' },
  { name: 'Google AI', category: 'AI Models' },
  { name: 'AWS S3', category: 'Storage' },
  { name: 'Google Drive', category: 'Storage' },
  { name: 'PostgreSQL', category: 'Database' },
  { name: 'MongoDB', category: 'Database' },
  { name: 'Slack', category: 'Communication' },
  { name: 'Discord', category: 'Communication' },
  { name: 'GitHub', category: 'Developer Tools' },
  { name: 'Zapier', category: 'Automation' },
  { name: 'Weaviate', category: 'Vector DB' },
  { name: 'Pinecone', category: 'Vector DB' },
  { name: 'Stripe', category: 'Payments' },
  { name: 'Shopify', category: 'E-commerce' },
  { name: 'HubSpot', category: 'CRM' }
]

export function Integrations() {
  return (
    <section className="py-20">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            150+ Integrations
          </h2>
          <p className="mx-auto mt-4 max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
            Connect your favorite tools and services with drag-and-drop simplicity
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {integrations.map((integration, index) => (
            <div key={index} className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {integration.name}
              </Badge>
              <span className="text-xs text-gray-500">{integration.category}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}