'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Activity,
  BarChart3,
  Bot,
  Database,
  GitBranch,
  Layers,
  Play,
  Plus,
  Settings,
  Workflow,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const mainNavigation = [
  {
    title: 'Build',
    items: [
      { title: 'Studio', href: '/studio', icon: Workflow },
      { title: 'Workflows', href: '/workflows', icon: GitBranch },
      { title: 'Templates', href: '/templates', icon: Layers },
    ],
  },
  {
    title: 'Connect',
    items: [
      { title: 'Integrations', href: '/integrations', icon: Database },
      { title: 'Models', href: '/models', icon: Bot },
      { title: 'APIs', href: '/apis', icon: Activity },
    ],
  },
  {
    title: 'Deploy',
    items: [
      { title: 'Deployments', href: '/deployments', icon: Play },
      { title: 'Analytics', href: '/analytics', icon: BarChart3 },
      { title: 'Settings', href: '/settings', icon: Settings },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="pb-12 w-64 border-r">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Button className="w-full justify-start gap-2" size="sm">
              <Plus className="h-4 w-4" />
              New Workflow
            </Button>
          </div>
        </div>
        <Separator />
        <ScrollArea className="px-3">
          <div className="space-y-4">
            {mainNavigation.map((group) => (
              <div key={group.title} className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {group.title}
                </h4>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant={pathname === item.href ? 'secondary' : 'ghost'}
                          className="w-full justify-start gap-2"
                          size="sm"
                        >
                          <Icon className="h-4 w-4" />
                          {item.title}
                        </Button>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}