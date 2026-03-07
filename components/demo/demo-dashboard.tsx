'use client'

import { useState } from 'react'
import type { Account, Signal } from '@/lib/types'
import { DashboardHeader } from '../dashboard/header'
import { AccountCard } from '../dashboard/account-card'
import { SignalCard } from '../dashboard/signal-card'
import { StatsOverview } from '../dashboard/stats-overview'
import { AccountDetailSheet } from '../dashboard/account-detail-sheet'
import { AddAccountDialog } from '../dashboard/add-account-dialog'
import { toast } from 'sonner'

// Mock data for demo mode
const MOCK_ACCOUNTS: Account[] = [
  {
    id: '1',
    user_id: 'demo',
    name: 'Acme Corp',
    domain: 'acme.com',
    industry: 'Technology',
    employee_count: '500-1000',
    notes: 'Enterprise prospect - Q2 pipeline',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'demo',
    name: 'TechStart Inc',
    domain: 'techstart.io',
    industry: 'SaaS',
    employee_count: '50-200',
    notes: 'Series B company, fast growing',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: 'demo',
    name: 'DataFlow Systems',
    domain: 'dataflow.dev',
    industry: 'Data & Analytics',
    employee_count: '200-500',
    notes: 'Expanding to EU market',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const MOCK_SIGNALS: Signal[] = [
  {
    id: '1',
    user_id: 'demo',
    account_id: '1',
    scan_id: 's1',
    source: 'hacker_news',
    type: 'product_launch',
    title: 'Acme launches new AI-powered analytics suite',
    snippet: 'Acme Corp today announced the release of their next-generation analytics platform featuring built-in AI capabilities...',
    url: 'https://news.ycombinator.com/item?id=123456',
    score: 92,
    play_recommendation: 'Reach out to congratulate on launch. Position your solution as complementary to their new analytics capabilities. Reference their AI focus in messaging.',
    detected_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    user_id: 'demo',
    account_id: '1',
    scan_id: 's1',
    source: 'greenhouse',
    type: 'hiring',
    title: 'Hiring: VP of Engineering',
    snippet: 'Senior leadership role to scale engineering organization from 50 to 200 engineers over next 18 months.',
    url: 'https://boards.greenhouse.io/acme/jobs/123',
    score: 85,
    play_recommendation: 'New engineering leadership signals growth investment. Reach out with case study on how you helped similar scale-ups. Timing is good - new VP will want to make infrastructure decisions.',
    detected_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    user_id: 'demo',
    account_id: '2',
    scan_id: 's2',
    source: 'crunchbase',
    type: 'funding',
    title: 'TechStart raises $45M Series B',
    snippet: 'TechStart announced a $45M Series B led by Sequoia Capital. The company plans to use the funding to expand their engineering team and enter new markets.',
    url: 'https://crunchbase.com/funding_round/techstart-series-b',
    score: 95,
    play_recommendation: 'Hot lead! Fresh funding means budget and urgency. Reference their expansion plans in outreach. Offer to help them scale infrastructure to match growth ambitions.',
    detected_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    user_id: 'demo',
    account_id: '2',
    scan_id: 's2',
    source: 'github',
    type: 'tech_adoption',
    title: 'New Kubernetes migration project started',
    snippet: 'Public repository shows active development on kubernetes migration tooling. 15 commits this week.',
    url: 'https://github.com/techstart/k8s-migration',
    score: 78,
    play_recommendation: 'Infrastructure modernization in progress. Position your solution as part of their cloud-native journey. Mention relevant case studies from similar migrations.',
    detected_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    user_id: 'demo',
    account_id: '3',
    scan_id: 's3',
    source: 'lever',
    type: 'expansion',
    title: 'Opening London office - 12 new roles',
    snippet: 'DataFlow is hiring for their new London headquarters including Sales Director, Solutions Architect, and Customer Success Manager.',
    url: 'https://jobs.lever.co/dataflow',
    score: 88,
    play_recommendation: 'EU expansion = new budget center and decision makers. Connect with the new London team before they vendor-lock. Offer GDPR compliance expertise as value-add.',
    detected_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    user_id: 'demo',
    account_id: '3',
    scan_id: 's3',
    source: 'hacker_news',
    type: 'press_mention',
    title: 'DataFlow featured in "Top 50 Data Companies to Watch"',
    snippet: 'Annual industry report highlights DataFlow as a rising star in the data infrastructure space, citing their innovative approach to real-time analytics.',
    url: 'https://news.ycombinator.com/item?id=789012',
    score: 65,
    play_recommendation: 'Use this recognition as a conversation starter. Congratulate them and ask how they plan to capitalize on the momentum.',
    detected_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
]

// Add signals to accounts
const accountsWithSignals = MOCK_ACCOUNTS.map(account => ({
  ...account,
  signals: MOCK_SIGNALS.filter(s => s.account_id === account.id),
  last_scan: {
    id: `scan-${account.id}`,
    user_id: 'demo',
    account_id: account.id,
    status: 'completed' as const,
    started_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
}))

export function DemoDashboard() {
  const [accounts, setAccounts] = useState(accountsWithSignals)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [scanningAccounts, setScanningAccounts] = useState<Set<string>>(new Set())

  const handleScanAccount = async (accountId: string) => {
    setScanningAccounts(prev => new Set(prev).add(accountId))
    toast.info('Scanning account...', { description: 'Demo mode: simulating scan' })
    
    // Simulate scan delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setScanningAccounts(prev => {
      const next = new Set(prev)
      next.delete(accountId)
      return next
    })
    
    toast.success('Scan complete', { description: 'Found 2 new signals (demo)' })
  }

  const handleDeleteAccount = (accountId: string) => {
    setAccounts(prev => prev.filter(a => a.id !== accountId))
    toast.success('Account removed')
  }

  const handleAddAccount = (data: { name: string; domain: string; industry?: string; employee_count?: string; notes?: string }) => {
    const newAccount: Account & { signals: Signal[]; last_scan?: any } = {
      id: `demo-${Date.now()}`,
      user_id: 'demo',
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      signals: [],
    }
    setAccounts(prev => [...prev, newAccount])
    toast.success('Account added', { description: 'Run a scan to find signals' })
  }

  // Get all signals sorted by score
  const allSignals = accounts
    .flatMap(a => (a.signals || []).map(s => ({ ...s, accountName: a.name })))
    .sort((a, b) => b.score - a.score)

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        onAddAccount={() => {}}
        userEmail="demo@example.com"
        isDemo
      />
      
      <main className="container mx-auto max-w-7xl px-4 py-6">
        {/* Demo Banner */}
        <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm text-primary">
            <span className="font-semibold">Demo Mode</span> — Exploring with sample data. 
            <a href="/auth/sign-up" className="ml-2 underline underline-offset-2 hover:text-primary/80">
              Create an account
            </a>
            {' '}to connect your real book of business.
          </p>
        </div>

        <div className="space-y-6">
          <StatsOverview accounts={accounts} />

          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl italic text-foreground">Your Accounts</h2>
            <AddAccountDialog onAdd={handleAddAccount} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onSelect={setSelectedAccount}
                onScan={handleScanAccount}
                onDelete={handleDeleteAccount}
                isScanning={scanningAccounts.has(account.id)}
              />
            ))}
          </div>

          {/* Top Signals Section */}
          <div className="space-y-4">
            <h2 className="font-serif text-xl italic text-foreground">Top Signals</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {allSignals.slice(0, 4).map((signal) => (
                <SignalCard 
                  key={signal.id} 
                  signal={signal} 
                  showAccount
                  accountName={signal.accountName}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      <AccountDetailSheet
        account={selectedAccount}
        onClose={() => setSelectedAccount(null)}
        onScan={handleScanAccount}
        isScanning={selectedAccount ? scanningAccounts.has(selectedAccount.id) : false}
      />
    </div>
  )
}
