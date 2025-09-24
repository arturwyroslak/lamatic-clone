import { DeploymentDashboard } from '@/components/deployments/deployment-dashboard'

export default function DeploymentsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Deployments</h1>
        <p className="text-muted-foreground">
          Manage your edge deployments and monitor performance
        </p>
      </div>
      <DeploymentDashboard />
    </div>
  )
}