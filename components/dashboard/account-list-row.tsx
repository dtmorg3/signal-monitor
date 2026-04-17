'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Building2, 
  ExternalLink, 
  MoreVertical, 
  Radar, 
  Trash2,
  ChevronRight
} from 'lucide-react'
import type { AccountWithSignals } from '@/lib/types'
import { SIGNAL_TYPE_LABELS } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface AccountListRowProps {
  account: AccountWithSignals
  onSelect: (account: AccountWithSignals) => void
  onScan: (accountId: string) => void
  onDelete: (accountId: string) => void
  isScanning: boolean
}

export function AccountListRow({ 
  account, 
  onSelect, 
  onScan, 
  onDelete,
  isScanning 
}: AccountListRowProps) {
  const topSignal = account.signals.sort((a, b) => b.score - a.score)[0]

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default'
    if (score >= 60) return 'secondary'
    return 'outline'
  }

  return (
    <div 
      className="group flex cursor-pointer items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
      onClick={() => onSelect(account)}
    >
      {/* Score badge */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
        {account.topScore > 0 ? (
          <span className="text-lg font-semibold">{account.topScore}</span>
        ) : (
          <Building2 className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      {/* Account info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-medium">{account.name}</h3>
          <a 
            href={`https://${account.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <p className="truncate text-sm text-muted-foreground">
          {topSignal ? topSignal.title : 'No signals detected'}
        </p>
      </div>

      {/* Signal badges */}
      <div className="hidden items-center gap-2 md:flex">
        {account.signalCount > 0 && (
          <Badge variant="secondary" className="shrink-0">
            {account.signalCount} signal{account.signalCount !== 1 ? 's' : ''}
          </Badge>
        )}
        {topSignal && (
          <Badge variant={getScoreBadgeVariant(topSignal.score)} className="shrink-0">
            {SIGNAL_TYPE_LABELS[topSignal.type]}
          </Badge>
        )}
      </div>

      {/* Last scan */}
      <div className="hidden text-right text-sm text-muted-foreground lg:block">
        {account.latestScan ? (
          <span>
            {formatDistanceToNow(new Date(account.latestScan.started_at), { addSuffix: true })}
          </span>
        ) : (
          <span>Never scanned</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation()
                onScan(account.id)
              }}
              disabled={isScanning}
            >
              <Radar className="mr-2 h-4 w-4" />
              Scan Now
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation()
                onDelete(account.id)
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  )
}
