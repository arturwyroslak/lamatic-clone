import { IntegrationHub } from '@/components/integrations/integration-hub'

export default function IntegrationsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground">
          Connect your workflows with 150+ apps and services
        </p>
      </div>
      <IntegrationHub />
    </div>
  )
}