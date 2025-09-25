import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap, Globe, Cpu, Database, Shield, TrendingUp } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Visual Flow Builder',
    description: 'Drag & drop interface for building AI workflows with no-code approach'
  },
  {
    icon: Globe,
    title: 'Edge Deployment',
    description: 'Deploy globally with sub-100ms latency using Cloudflare Workers'
  },
  {
    icon: Cpu,
    title: '300+ AI Models',
    description: 'Connect to OpenAI, Anthropic, Google, and 17+ other providers'
  },
  {
    icon: Database,
    title: 'Vector Database',
    description: 'Built-in Weaviate integration for RAG and semantic search'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SSO, role-based access, and enterprise-grade compliance'
  },
  {
    icon: TrendingUp,
    title: 'Real-time Analytics',
    description: 'Monitor performance, costs, and optimize your AI workflows'
  }
]

export function Features() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Everything you need to build AI agents
          </h2>
          <p className="mx-auto mt-4 max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
            Comprehensive platform with all the tools and integrations you need
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardHeader>
                <feature.icon className="h-10 w-10 text-blue-600" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}