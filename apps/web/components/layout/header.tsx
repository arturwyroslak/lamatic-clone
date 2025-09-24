'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserNav } from '@/components/user-nav'
import { Logo } from '@/components/logo'

const navigation = [
  { name: 'Studio', href: '/studio' },
  { name: 'Workflows', href: '/workflows' },
  { name: 'Integrations', href: '/integrations' },
  { name: 'Deployments', href: '/deployments' },
  { name: 'Analytics', href: '/analytics' },
]

export function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Logo />
          <span className="font-bold text-xl">Lamatic</span>
        </Link>
        
        <nav className="mx-6 flex items-center space-x-4 lg:space-x-6">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === item.href
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            Documentation
          </Button>
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  )
}