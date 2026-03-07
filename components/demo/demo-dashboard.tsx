'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { AccountWithSignals, Signal } from '@/lib/types'
import { DashboardHeader } from '../dashboard/header'
import { AccountCard } from '../dashboard/account-card'
import { SignalCard } from '../dashboard/signal-card'
import { StatsOverview } from '../dashboard/stats-overview'
import { AccountDetailSheet } from '../dashboard/account-detail-sheet'
import { AddAccountDialog } from '../dashboard/add-account-dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Sparkles } from 'lucide-react'

// Mock data for demo mode
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
  {
    id: '7',
    user_id: 'demo',
    account_id: '1',
    scan_id: 's1',
    source: 'techcrunch',
    type: 'funding',
    title: 'Acme Corp closes $80M Series C to accelerate enterprise AI',
    snippet: 'TechCrunch reports Acme Corp has raised $80M from Andreessen Horowitz to expand their AI-powered analytics platform to enterprise customers.',
    url: 'https://techcrunch.com/2024/01/acme-series-c',
    score: 94,
    play_recommendation: 'Major funding event! New budget unlocked. Reach out to congratulate and position as a strategic partner for their enterprise expansion. Ask about new initiatives.',
    detected_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '8',
    user_id: 'demo',
    account_id: '2',
    scan_id: 's2',
    source: 'google_news',
    type: 'partnership',
    title: 'TechStart announces strategic partnership with AWS',
    snippet: 'TechStart Inc. announced a new strategic partnership with Amazon Web Services to integrate their platform with AWS marketplace.',
    url: 'https://news.google.com/articles/techstart-aws',
    score: 82,
    play_recommendation: 'AWS partnership signals cloud commitment and growth. Reference AWS integration capabilities in your outreach. Time to get on their approved vendor list.',
    detected_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '9',
    user_id: 'demo',
    account_id: '3',
    scan_id: 's3',
    source: 'pr_newswire',
    type: 'product_launch',
    title: 'DataFlow Launches Real-Time Analytics 2.0',
    snippet: 'PR Newswire: DataFlow Systems today announced the general availability of their Real-Time Analytics 2.0 platform with 10x performance improvements.',
    url: 'https://prnewswire.com/dataflow-rta-2',
    score: 76,
    play_recommendation: 'Product launch means active development and marketing push. Perfect time to discuss how your solution integrates with their new capabilities.',
    detected_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '10',
    user_id: 'demo',
    account_id: '1',
    scan_id: 's1',
    source: 'company_blog',
    type: 'tech_adoption',
    title: 'How We Migrated to Microservices Architecture',
    snippet: 'Engineering blog post detailing Acme\'s 18-month journey migrating from monolith to microservices, with lessons learned and tooling decisions.',
    url: 'https://blog.acme.com/microservices-migration',
    score: 71,
    play_recommendation: 'Active infrastructure modernization. Reference their specific tech choices in outreach. Offer to share similar customer stories about microservices adoption.',
    detected_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  },
]

function createMockAccounts(): AccountWithSignals[] {
  const baseAccounts = [
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

  return baseAccounts.map(account => {
    const accountSignals = MOCK_SIGNALS.filter(s => s.account_id === account.id)
    return {
      ...account,
      signals: accountSignals,
      latestScan: {
        id: `scan-${account.id}`,
        user_id: 'demo',
        account_id: account.id,
        status: 'completed' as const,
        started_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      },
      signalCount: accountSignals.length,
      topScore: accountSignals.length > 0 
        ? Math.max(...accountSignals.map(s => s.score)) 
        : 0
    }
  })
}

export function DemoDashboard() {
  const [accounts, setAccounts] = useState<AccountWithSignals[]>(createMockAccounts)
  const [selectedAccount, setSelectedAccount] = useState<AccountWithSignals | null>(null)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [scanningAccounts, setScanningAccounts] = useState<Set<string>>(new Set())

  const handleSelectAccount = (account: AccountWithSignals) => {
    setSelectedAccount(account)
    setDetailSheetOpen(true)
  }

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

  const handleScanAll = async () => {
    const accountIds = accounts.map(a => a.id)
    setScanningAccounts(new Set(accountIds))
    toast.info('Scanning all accounts...', { description: 'Demo mode: simulating scan' })
    
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    setScanningAccounts(new Set())
    toast.success('All scans complete', { description: 'Found 6 new signals (demo)' })
  }

  const handleDeleteAccount = (accountId: string) => {
    setAccounts(prev => prev.filter(a => a.id !== accountId))
    if (selectedAccount?.id === accountId) {
      setDetailSheetOpen(false)
      setSelectedAccount(null)
    }
    toast.success('Account removed')
  }

  const handleAddAccount = async (data: { 
    name: string
    domain: string
    industry?: string
    employee_count?: string
    notes?: string 
  }) => {
    const newAccount: AccountWithSignals = {
      id: `demo-${Date.now()}`,
      user_id: 'demo',
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      signals: [],
      latestScan: null,
      signalCount: 0,
      topScore: 0
    }
    setAccounts(prev => [newAccount, ...prev])
    toast.success('Account added', { description: 'Run a scan to find signals' })
  }

  // Get all signals sorted by score for top signals section
  const allSignals = accounts
    .flatMap(a => (a.signals || []).map(s => ({ ...s, accountName: a.name })))
    .sort((a, b) => b.score - a.score)

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        onAddAccount={() => setAddDialogOpen(true)}
        onScanAll={handleScanAll}
        isScanning={scanningAccounts.size > 0}
        userEmail="demo@example.com"
        isDemo
      />
      
      <main className="container mx-auto max-w-7xl px-4 py-6">
        {/* Demo Banner */}
        <div className="mb-6 flex flex-col gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-medium text-foreground">Demo Mode</p>
              <p className="text-sm text-muted-foreground">
                Exploring with sample data. Create an account to connect your real book of business.
              </p>
            </div>
          </div>
          <Button asChild size="sm" className="shrink-0">
            <Link href="/auth/sign-up">Get Started</Link>
          </Button>
        </div>

        <div className="space-y-6">
          <StatsOverview accounts={accounts} />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onSelect={handleSelectAccount}
                onScan={handleScanAccount}
                onDelete={handleDeleteAccount}
                isScanning={scanningAccounts.has(account.id)}
              />
            ))}
          </div>

          {/* Top Signals Section */}
          {allSignals.length > 0 && (
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
          )}
        </div>
      </main>

      <AddAccountDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleAddAccount}
      />

      <AccountDetailSheet
        account={selectedAccount}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        onScan={handleScanAccount}
        isScanning={selectedAccount ? scanningAccounts.has(selectedAccount.id) : false}
      />
    </div>
  )
}
