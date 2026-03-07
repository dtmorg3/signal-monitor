'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Building2, Radar, TrendingUp, Zap } from 'lucide-react'
import type { AccountWithSignals } from '@/lib/types'

interface StatsOverviewProps {
  accounts: AccountWithSignals[]
}

export function StatsOverview({ accounts }: StatsOverviewProps) {
  const totalAccounts = accounts.length
  const totalSignals = accounts.reduce((sum, acc) => sum + acc.signalCount, 0)
  const highScoreSignals = accounts.reduce((sum, acc) => 
    sum + acc.signals.filter(s => s.score >= 70).length, 0
  )
  const avgScore = totalSignals > 0
    ? Math.round(
        accounts.reduce((sum, acc) => 
          sum + acc.signals.reduce((s, sig) => s + sig.score, 0), 0
        ) / totalSignals
      )
    : 0

  const stats = [
    {
      label: 'Accounts',
      value: totalAccounts,
      icon: Building2,
      description: 'in your book'
    },
    {
      label: 'Signals',
      value: totalSignals,
      icon: Radar,
      description: 'detected'
    },
    {
      label: 'High Priority',
      value: highScoreSignals,
      icon: Zap,
      description: 'score 70+'
    },
    {
      label: 'Avg Score',
      value: avgScore,
      icon: TrendingUp,
      description: 'signal quality'
    }
  ]

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <stat.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-semibold tracking-tight">
                {stat.value}
              </span>
              <span className="ml-2 text-xs text-muted-foreground">
                {stat.description}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
