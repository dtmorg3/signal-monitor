'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Building2, 
  ExternalLink, 
  Radar, 
  Users,
  Briefcase
} from 'lucide-react'
import type { AccountWithSignals, SignalType } from '@/lib/types'
import { SIGNAL_TYPE_LABELS } from '@/lib/types'
import { SignalCard } from './signal-card'
import { formatDistanceToNow } from 'date-fns'

interface AccountDetailSheetProps {
  account: AccountWithSignals | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onScan: (accountId: string) => void
  isScanning: boolean
}

export function AccountDetailSheet({ 
  account, 
  open, 
  onOpenChange,
  onScan,
  isScanning
}: AccountDetailSheetProps) {
  if (!account) return null

  // Group signals by type
  const signalsByType = account.signals.reduce((acc, signal) => {
    if (!acc[signal.type]) {
      acc[signal.type] = []
    }
    acc[signal.type].push(signal)
    return acc
  }, {} as Record<SignalType, typeof account.signals>)

  const signalTypes = Object.keys(signalsByType) as SignalType[]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader className="space-y-3 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted">
                <Building2 className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <SheetTitle className="text-left">{account.name}</SheetTitle>
                <SheetDescription asChild>
                  <a 
                    href={`https://${account.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    {account.domain}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </SheetDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onScan(account.id)}
              disabled={isScanning}
            >
              <Radar className={`mr-2 h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Scanning...' : 'Scan'}
            </Button>
          </div>
          
          {/* Account metadata */}
          <div className="flex flex-wrap gap-2">
            {account.industry && (
              <Badge variant="secondary" className="gap-1">
                <Briefcase className="h-3 w-3" />
                {account.industry}
              </Badge>
            )}
            {account.employee_count && (
              <Badge variant="secondary" className="gap-1">
                <Users className="h-3 w-3" />
                {account.employee_count} employees
              </Badge>
            )}
          </div>

          {account.notes && (
            <p className="text-sm text-muted-foreground">{account.notes}</p>
          )}

          {account.latestScan && (
            <p className="text-xs text-muted-foreground">
              Last scanned {formatDistanceToNow(new Date(account.latestScan.started_at), { addSuffix: true })}
            </p>
          )}
        </SheetHeader>

        <Tabs defaultValue="all" className="flex h-[calc(100vh-16rem)] flex-col">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="all" className="text-xs">
              All ({account.signals.length})
            </TabsTrigger>
            {signalTypes.slice(0, 3).map((type) => (
              <TabsTrigger key={type} value={type} className="text-xs">
                {SIGNAL_TYPE_LABELS[type]} ({signalsByType[type].length})
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="all" className="mt-4 flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              {account.signals.length > 0 ? (
                <div className="space-y-3 pb-4">
                  {account.signals
                    .sort((a, b) => b.score - a.score)
                    .map((signal) => (
                      <SignalCard key={signal.id} signal={signal} />
                    ))}
                </div>
              ) : (
                <div className="flex h-32 flex-col items-center justify-center text-center">
                  <Radar className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No signals detected yet
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Run a scan to discover expansion opportunities
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          {signalTypes.map((type) => (
            <TabsContent key={type} value={type} className="mt-4 flex-1 overflow-hidden">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-3 pb-4">
                  {signalsByType[type]
                    .sort((a, b) => b.score - a.score)
                    .map((signal) => (
                      <SignalCard key={signal.id} signal={signal} />
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
