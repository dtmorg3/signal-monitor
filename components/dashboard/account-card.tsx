'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
  TrendingUp,
  Flame
} from 'lucide-react'
import type { AccountWithSignals, Signal } from '@/lib/types'
import { SIGNAL_TYPE_LABELS } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface AccountCardProps {
  account: AccountWithSignals
  onSelect: (account: AccountWithSignals) => void
  onScan: (accountId: string) => void
  onDelete: (accountId: string) => void
  isScanning: boolean
}

export function AccountCard({ 
  account, 
  onSelect, 
  onScan, 
  onDelete,
  isScanning 
}: AccountCardProps) {
  const topSignals = account.signals
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  const getScoreStyles = (score: number) => {
    if (score >= 90) return { color: 'text-green-600 dark:text-green-400', isHot: true, label: 'Reach out!' }
    if (score >= 75) return { color: 'text-green-600 dark:text-green-400', isHot: false, label: 'Strong signal' }
    if (score >= 60) return { color: 'text-yellow-600 dark:text-yellow-400', isHot: false, label: 'Worth watching' }
    if (score >= 40) return { color: 'text-orange-600 dark:text-orange-400', isHot: false, label: 'Low priority' }
    return { color: 'text-muted-foreground', isHot: false, label: 'Weak signal' }
  }

  const scoreStyles = getScoreStyles(account.topScore)

  return (
    <Card 
      className="group cursor-pointer transition-all hover:border-primary/50 hover:bg-accent/30"
      onClick={() => onSelect(account)}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
            <Building2 className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-medium leading-none tracking-tight">
              {account.name}
            </h3>
            <a 
              href={`https://${account.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              {account.domain}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
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
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Score indicator */}
        {account.topScore > 0 && (
          <div className="flex items-center gap-2">
            {scoreStyles.isHot ? (
              <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
            ) : (
              <TrendingUp className={`h-4 w-4 ${scoreStyles.color}`} />
            )}
            <span className={`text-sm font-bold ${scoreStyles.color}`}>
              {account.topScore}
            </span>
            <span className={`text-xs ${scoreStyles.isHot ? scoreStyles.color + ' font-medium' : 'text-muted-foreground'}`}>
              {scoreStyles.label}
            </span>
          </div>
        )}

        {/* Top signals preview */}
        {topSignals.length > 0 ? (
          <div className="space-y-2">
            {topSignals.map((signal) => (
              <SignalPreview key={signal.id} signal={signal} />
            ))}
            {account.signalCount > 3 && (
              <p className="text-xs text-muted-foreground">
                +{account.signalCount - 3} more signals
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No signals detected yet
          </p>
        )}

        {/* Last scan info */}
        {account.latestScan && (
          <p className="text-xs text-muted-foreground">
            Last scan {formatDistanceToNow(new Date(account.latestScan.started_at), { addSuffix: true })}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function SignalPreview({ signal }: { signal: Signal }) {
  return (
    <div className="flex items-start gap-2 rounded-md bg-muted/50 p-2">
      <Badge variant="outline" className="shrink-0 text-xs">
        {SIGNAL_TYPE_LABELS[signal.type]}
      </Badge>
      <p className="line-clamp-1 text-xs text-muted-foreground">
        {signal.title}
      </p>
    </div>
  )
}
