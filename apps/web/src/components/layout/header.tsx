'use client'

import React from 'react'
import Link from 'next/link'

export function Header() {
  return (
    <header className="border-b">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-6 w-6 bg-blue-600 rounded" />
          <span className="font-semibold">Lamatic</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/studio" className="hover:text-blue-600">Studio</Link>
          <Link href="/integrations" className="hover:text-blue-600">Integrations</Link>
          <Link href="/deployments" className="hover:text-blue-600">Deployments</Link>
          <Link href="/analytics" className="hover:text-blue-600">Analytics</Link>
        </nav>
      </div>
    </header>
  )
}
