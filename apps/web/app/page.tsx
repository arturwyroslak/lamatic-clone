import { Hero } from '@/components/sections/hero'
import { Features } from '@/components/sections/features'
import { Integrations } from '@/components/sections/integrations'
import { Testimonials } from '@/components/sections/testimonials'
import { Pricing } from '@/components/sections/pricing'
import { CTA } from '@/components/sections/cta'

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <Features />
      <Integrations />
      <Testimonials />
      <Pricing />
      <CTA />
    </div>
  )
}