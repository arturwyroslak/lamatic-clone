import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function CTA() {
  return (
    <section className="py-20 bg-blue-600 text-white">
      <div className="container px-4 md:px-6">
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Ready to Build Your AI Agent?
          </h2>
          <p className="mx-auto max-w-[700px] text-blue-100 md:text-xl">
            Join thousands of developers building the future with Lamatic. Get started in under 60 seconds.
          </p>
          <div className="space-x-4">
            <Link href="/studio">
              <Button size="lg" variant="secondary">
                Start Building Free
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}