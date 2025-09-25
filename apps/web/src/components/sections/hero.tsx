import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative py-20 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              Build, Connect & Deploy
              <span className="text-blue-600"> AI Agents</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              Collaborative Agentic AI Development Platform. Create, monitor and optimize GenAI applications with our visual flow builder and edge deployment.
            </p>
          </div>
          <div className="space-x-4">
            <Link href="/studio">
              <Button size="lg">
                Start Building
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" size="lg">
                View Docs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}