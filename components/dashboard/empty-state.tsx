'use client'

import { Button } from '@/components/ui/button'
import { Plus, Radar } from 'lucide-react'

interface EmptyStateProps {
  onAddAccount: () => void
}

export function EmptyState({ onAddAccount }: EmptyStateProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Radar className="h-8 w-8 text-primary" />
      </div>
      <h2 className="mt-6 text-2xl font-semibold tracking-tight">
        Welcome to Echolok8
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Add accounts from your book of business to discover expansion signals 
        from public data sources like Hacker News, job boards, and GitHub.
      </p>
      <Button onClick={onAddAccount} className="mt-6">
        <Plus className="mr-2 h-4 w-4" />
        Add Your First Account
      </Button>
      
      <div className="mt-12 grid max-w-2xl gap-4 text-left md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs font-medium text-primary">Step 1</div>
          <div className="mt-1 text-sm font-medium">Add Accounts</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Import your book of business by adding company names and domains.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs font-medium text-primary">Step 2</div>
          <div className="mt-1 text-sm font-medium">Scan for Signals</div>
          <p className="mt-1 text-xs text-muted-foreground">
            We analyze public data sources to find expansion opportunities.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-xs font-medium text-primary">Step 3</div>
          <div className="mt-1 text-sm font-medium">Take Action</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Review AI-generated play recommendations for each signal.
          </p>
        </div>
      </div>
    </div>
  )
}
