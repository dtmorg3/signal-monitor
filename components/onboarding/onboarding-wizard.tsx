'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import { 
  ArrowRight, 
  Building2, 
  Check, 
  Plus, 
  Radar, 
  Trash2,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface OnboardingWizardProps {
  userId: string
  onComplete: () => void
}

interface AccountInput {
  id: string
  name: string
  domain: string
}

export function OnboardingWizard({ userId, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1)
  const [accounts, setAccounts] = useState<AccountInput[]>([
    { id: '1', name: '', domain: '' }
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scannedCount, setScannedCount] = useState(0)

  const supabase = createClient()

  const addAccountRow = () => {
    setAccounts(prev => [
      ...prev,
      { id: Date.now().toString(), name: '', domain: '' }
    ])
  }

  const removeAccountRow = (id: string) => {
    if (accounts.length === 1) return
    setAccounts(prev => prev.filter(a => a.id !== id))
  }

  const updateAccount = (id: string, field: 'name' | 'domain', value: string) => {
    setAccounts(prev => prev.map(a => 
      a.id === id ? { ...a, [field]: value } : a
    ))
  }

  const validAccounts = accounts.filter(a => a.name.trim() && a.domain.trim())

  const handleSubmitAccounts = async () => {
    if (validAccounts.length === 0) {
      toast.error('Please add at least one account')
      return
    }

    setIsSubmitting(true)

    try {
      const accountsToInsert = validAccounts.map(a => ({
        user_id: userId,
        name: a.name.trim(),
        domain: a.domain.trim().replace(/^https?:\/\//, '').replace(/\/$/, '')
      }))

      const { error } = await supabase
        .from('accounts')
        .insert(accountsToInsert)

      if (error) throw error

      toast.success(`Added ${validAccounts.length} account${validAccounts.length > 1 ? 's' : ''}`)
      setStep(2)
    } catch {
      toast.error('Failed to add accounts')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRunScans = async () => {
    setIsScanning(true)
    setScannedCount(0)

    try {
      // Fetch the accounts we just created
      const { data: createdAccounts, error: fetchError } = await supabase
        .from('accounts')
        .select('id')
        .eq('user_id', userId)

      if (fetchError || !createdAccounts) throw fetchError

      // Scan each account
      for (let i = 0; i < createdAccounts.length; i++) {
        const account = createdAccounts[i]
        
        try {
          await fetch('/api/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accountId: account.id })
          })
        } catch {
          // Continue with other accounts even if one fails
        }

        setScannedCount(i + 1)
      }

      toast.success('Initial scan complete!')
      setStep(3)
    } catch {
      toast.error('Some scans failed, but you can retry from the dashboard')
      setStep(3)
    } finally {
      setIsScanning(false)
    }
  }

  const progressPercentage = (step / 3) * 100

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary">
            <Radar className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="font-serif text-2xl tracking-tight">Signal Monitor</h1>
          <p className="mt-1 text-sm text-muted-foreground">Expansion Intelligence for AEs</p>
        </div>

        <Progress value={progressPercentage} className="mb-6" />

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Add Your Accounts
              </CardTitle>
              <CardDescription>
                Add companies from your book of business to start monitoring for expansion signals.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {accounts.map((account, index) => (
                <div key={account.id} className="flex items-end gap-2">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`name-${account.id}`}>Company Name</Label>
                    <Input
                      id={`name-${account.id}`}
                      placeholder="Acme Corp"
                      value={account.name}
                      onChange={(e) => updateAccount(account.id, 'name', e.target.value)}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`domain-${account.id}`}>Domain</Label>
                    <Input
                      id={`domain-${account.id}`}
                      placeholder="acme.com"
                      value={account.domain}
                      onChange={(e) => updateAccount(account.id, 'domain', e.target.value)}
                    />
                  </div>
                  {accounts.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAccountRow(account.id)}
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addAccountRow}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Another Account
              </Button>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSubmitAccounts} 
                disabled={isSubmitting || validAccounts.length === 0}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Adding accounts...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Run Initial Scan
              </CardTitle>
              <CardDescription>
                {"We'll scan public data sources to find expansion signals for your accounts."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isScanning ? (
                <div className="space-y-4 py-4 text-center">
                  <Radar className="mx-auto h-12 w-12 animate-pulse text-primary" />
                  <div>
                    <p className="text-sm font-medium">Scanning your accounts...</p>
                    <p className="text-xs text-muted-foreground">
                      {scannedCount} of {validAccounts.length} complete
                    </p>
                  </div>
                  <Progress value={(scannedCount / validAccounts.length) * 100} />
                </div>
              ) : (
                <div className="space-y-4 py-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    {"We'll check Hacker News, GitHub, job boards, and more to find actionable signals."}
                  </p>
                  <ul className="mx-auto max-w-xs space-y-2 text-left text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Hacker News mentions
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      GitHub activity
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Job board postings
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Web search signals
                    </li>
                  </ul>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setStep(3)}
                disabled={isScanning}
                className="flex-1"
              >
                Skip for now
              </Button>
              <Button 
                onClick={handleRunScans}
                disabled={isScanning}
                className="flex-1"
              >
                {isScanning ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Radar className="mr-2 h-4 w-4" />
                    Start Scan
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                {"You're all set!"}
              </CardTitle>
              <CardDescription>
                Your Signal Monitor is ready. Start discovering expansion opportunities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 py-4">
                <div className="rounded-lg border border-border bg-muted/50 p-4">
                  <h4 className="text-sm font-medium">What happens next?</h4>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>Review detected signals for each account</li>
                    <li>Use AI-generated play recommendations</li>
                    <li>Run scans anytime to discover new signals</li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={onComplete} className="w-full">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
