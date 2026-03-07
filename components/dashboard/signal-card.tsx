'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, Lightbulb } from 'lucide-react'
import type { Signal } from '@/lib/types'
import { SIGNAL_TYPE_LABELS, SIGNAL_SOURCE_LABELS } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface SignalCardProps {
  signal: Signal
  showAccount?: boolean
  accountName?: string
}

export function SignalCard({ signal, showAccount, accountName }: SignalCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 text-green-400 border-green-500/30'
    if (score >= 60) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    if (score >= 40) return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    return 'bg-muted text-muted-foreground border-border'
  }

  const getSignalTypeColor = (type: Signal['type']) => {
    const colors: Record<Signal['type'], string> = {
      hiring: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      funding: 'bg-green-500/20 text-green-400 border-green-500/30',
      product_launch: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      tech_adoption: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      expansion: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      partnership: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      leadership_change: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
      press_mention: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
      open_source_activity: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      community_engagement: 'bg-pink-500/20 text-pink-400 border-pink-500/30'
    }
    return colors[type]
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge 
            variant="outline" 
            className={getSignalTypeColor(signal.type)}
          >
            {SIGNAL_TYPE_LABELS[signal.type]}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {SIGNAL_SOURCE_LABELS[signal.source]}
          </Badge>
        </div>
        <Badge 
          variant="outline" 
          className={`font-mono ${getScoreColor(signal.score)}`}
        >
          {signal.score}
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div>
          {showAccount && accountName && (
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              {accountName}
            </p>
          )}
          <h4 className="font-medium leading-tight tracking-tight">
            {signal.title}
          </h4>
          {signal.snippet && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {signal.snippet}
            </p>
          )}
        </div>

        {signal.play_recommendation && (
          <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
            <div className="flex items-start gap-2">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-xs font-medium text-primary">Recommended Play</p>
                <p className="mt-0.5 text-sm text-foreground">
                  {signal.play_recommendation}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(signal.detected_at), { addSuffix: true })}
          </span>
          {signal.url && (
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className="h-7 text-xs"
            >
              <a 
                href={signal.url} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                View Source
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
