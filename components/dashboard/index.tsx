'use client'

import { useState, useCallback } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Account, Signal, Scan, AccountWithSignals } from '@/lib/types'
import { Header } from './header'
import { AccountCard } from './account-card'
import { AddAccountDialog } from './add-account-dialog'
import { AccountDetailSheet } from './account-detail-sheet'
import { EmptyState } from './empty-state'
import { StatsOverview } from './stats-overview'
import { Skeleton } from '@/components/ui/skeleton'

interface DashboardProps {
  userId: string
  userEmail?: string
}

async function fetchAccounts(userId: string): Promise<AccountWithSignals[]> {
  const supabase = createClient()
  
  // Fetch accounts
  const { data: accounts, error: accountsError } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (accountsError) throw accountsError
  if (!accounts || accounts.length === 0) return []

  // Fetch signals for all accounts
  const { data: signals, error: signalsError } = await supabase
    .from('signals')
    .select('*')
    .eq('user_id', userId)
    .order('score', { ascending: false })

  if (signalsError) throw signalsError

  // Fetch latest scans for all accounts
  const { data: scans, error: scansError } = await supabase
    .from('scans')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })

  if (scansError) throw scansError

  // Combine data
  return accounts.map((account: Account) => {
    const accountSignals = (signals || []).filter((s: Signal) => s.account_id === account.id)
    const accountScans = (scans || []).filter((s: Scan) => s.account_id === account.id)
    const latestScan = accountScans.length > 0 ? accountScans[0] : null

    return {
      ...account,
      signals: accountSignals,
      latestScan,
      signalCount: accountSignals.length,
      topScore: accountSignals.length > 0 
        ? Math.max(...accountSignals.map((s: Signal) => s.score)) 
        : 0
    }
  })
}

export function Dashboard({ userId, userEmail }: DashboardProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<AccountWithSignals | null>(null)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  const [scanningAccounts, setScanningAccounts] = useState<Set<string>>(new Set())
  const [isScanningSingle, setIsScanningSingle] = useState(false)

  const { data: accounts, error, isLoading, mutate } = useSWR(
    ['accounts', userId],
    () => fetchAccounts(userId),
    { revalidateOnFocus: false }
  )

  const supabase = createClient()

  const handleAddAccount = useCallback(async (data: {
    name: string
    domain: string
    industry?: string
    employee_count?: string
    notes?: string
  }) => {
    const { error } = await supabase
      .from('accounts')
      .insert({
        user_id: userId,
        ...data
      })

    if (error) {
      toast.error('Failed to add account')
      throw error
    }

    toast.success('Account added successfully')
    mutate()
  }, [supabase, userId, mutate])

  const handleDeleteAccount = useCallback(async (accountId: string) => {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', accountId)
      .eq('user_id', userId)

    if (error) {
      toast.error('Failed to delete account')
      return
    }

    toast.success('Account deleted')
    if (selectedAccount?.id === accountId) {
      setDetailSheetOpen(false)
      setSelectedAccount(null)
    }
    mutate()
  }, [supabase, userId, selectedAccount, mutate])

  const handleScanAccount = useCallback(async (accountId: string) => {
    setScanningAccounts(prev => new Set(prev).add(accountId))
    setIsScanningSingle(true)

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId })
      })

      if (!response.ok) {
        throw new Error('Scan failed')
      }

      toast.success('Scan completed')
      mutate()

      // Update selected account if it was scanned
      if (selectedAccount?.id === accountId) {
        const updatedAccounts = await fetchAccounts(userId)
        const updated = updatedAccounts.find(a => a.id === accountId)
        if (updated) setSelectedAccount(updated)
      }
    } catch {
      toast.error('Failed to scan account')
    } finally {
      setScanningAccounts(prev => {
        const next = new Set(prev)
        next.delete(accountId)
        return next
      })
      setIsScanningSingle(false)
    }
  }, [mutate, selectedAccount, userId])

  const handleScanAll = useCallback(async () => {
    if (!accounts || accounts.length === 0) return

    const accountIds = accounts.map(a => a.id)
    setScanningAccounts(new Set(accountIds))

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountIds })
      })

      if (!response.ok) {
        throw new Error('Scan failed')
      }

      toast.success('All accounts scanned')
      mutate()
    } catch {
      toast.error('Failed to scan accounts')
    } finally {
      setScanningAccounts(new Set())
    }
  }, [accounts, mutate])

  const handleSelectAccount = useCallback((account: AccountWithSignals) => {
    setSelectedAccount(account)
    setDetailSheetOpen(true)
  }, [])

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p className="text-destructive">Failed to load accounts</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onAddAccount={() => setAddDialogOpen(true)}
        onScanAll={handleScanAll}
        isScanning={scanningAccounts.size > 0 && !isScanningSingle}
        userEmail={userEmail}
      />

      <main className="container mx-auto px-4 py-6 md:px-6">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        ) : accounts && accounts.length > 0 ? (
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
          </div>
        ) : (
          <EmptyState onAddAccount={() => setAddDialogOpen(true)} />
        )}
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
