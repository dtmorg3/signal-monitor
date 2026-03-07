'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Brain,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Database,
  GitBranch,
  LineChart,
  MessageSquare,
  Radar,
  Sparkles,
  Target,
  Zap
} from 'lucide-react'

interface RoadmapItem {
  title: string
  description: string
  status: 'done' | 'in-progress' | 'planned'
  icon: React.ReactNode
  features: string[]
}

const ROADMAP_PHASES: { title: string; timeframe: string; items: RoadmapItem[] }[] = [
  {
    title: 'Phase 1: Foundation',
    timeframe: 'Days 1-30',
    items: [
      {
        title: 'Core Signal Detection',
        description: 'Build the fundamental signal detection engine with public data sources',
        status: 'done',
        icon: <Radar className="h-5 w-5" />,
        features: [
          'Hacker News mention tracking',
          'GitHub activity monitoring',
          'Job board scanning (Greenhouse, Lever)',
          'Basic web search integration'
        ]
      },
      {
        title: 'Account Management',
        description: 'Full CRUD for AE book of business',
        status: 'done',
        icon: <Database className="h-5 w-5" />,
        features: [
          'Add/edit/delete accounts',
          'Account metadata (industry, size)',
          'Notes and context storage',
          'Bulk account import'
        ]
      },
      {
        title: 'Signal Cards & Scoring',
        description: 'Visual signal presentation with prioritization',
        status: 'done',
        icon: <Target className="h-5 w-5" />,
        features: [
          'Signal type categorization',
          'Relevance scoring (0-100)',
          'Source attribution',
          'AI play recommendations'
        ]
      }
    ]
  },
  {
    title: 'Phase 2: Intelligence',
    timeframe: 'Days 31-60',
    items: [
      {
        title: 'AI-Powered Analysis',
        description: 'Enhanced signal interpretation using LLMs',
        status: 'in-progress',
        icon: <Brain className="h-5 w-5" />,
        features: [
          'GPT-4 signal summarization',
          'Contextual play generation',
          'Cross-signal pattern detection',
          'Account health scoring'
        ]
      },
      {
        title: 'Real-time Alerts',
        description: 'Push notifications for high-priority signals',
        status: 'planned',
        icon: <Zap className="h-5 w-5" />,
        features: [
          'Email digest (daily/weekly)',
          'Slack integration',
          'Custom alert thresholds',
          'Priority inbox'
        ]
      },
      {
        title: 'CRM Integration',
        description: 'Sync signals with your existing tools',
        status: 'planned',
        icon: <GitBranch className="h-5 w-5" />,
        features: [
          'Salesforce connector',
          'HubSpot integration',
          'Signal-to-activity mapping',
          'Bi-directional sync'
        ]
      }
    ]
  },
  {
    title: 'Phase 3: Scale',
    timeframe: 'Days 61-90',
    items: [
      {
        title: 'Team Collaboration',
        description: 'Multi-user workspace features',
        status: 'planned',
        icon: <MessageSquare className="h-5 w-5" />,
        features: [
          'Shared account views',
          'Signal commenting',
          'Play assignment',
          'Activity feed'
        ]
      },
      {
        title: 'Analytics Dashboard',
        description: 'Track signal effectiveness and ROI',
        status: 'planned',
        icon: <LineChart className="h-5 w-5" />,
        features: [
          'Signal-to-meeting conversion',
          'Play success rates',
          'Account engagement trends',
          'Custom reports'
        ]
      },
      {
        title: 'Advanced Sources',
        description: 'Expand signal coverage',
        status: 'planned',
        icon: <Sparkles className="h-5 w-5" />,
        features: [
          'LinkedIn activity tracking',
          'Crunchbase funding alerts',
          'Patent filings',
          'SEC filings (public companies)'
        ]
      }
    ]
  }
]

export function RoadmapView() {
  const getStatusIcon = (status: RoadmapItem['status']) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'in-progress':
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />
      case 'planned':
        return <Circle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: RoadmapItem['status']) => {
    switch (status) {
      case 'done':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Complete</Badge>
      case 'in-progress':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">In Progress</Badge>
      case 'planned':
        return <Badge variant="outline">Planned</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-4 md:px-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8 md:px-6">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-serif text-3xl tracking-tight">90-Day Roadmap</h1>
          <p className="mt-2 text-muted-foreground">
            Our vision for building the ultimate expansion intelligence platform
          </p>
        </div>

        <div className="space-y-12">
          {ROADMAP_PHASES.map((phase, phaseIndex) => (
            <div key={phase.title}>
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-mono text-sm font-medium text-primary">
                  {phaseIndex + 1}
                </div>
                <div>
                  <h2 className="text-xl font-medium">{phase.title}</h2>
                  <p className="text-sm text-muted-foreground">{phase.timeframe}</p>
                </div>
              </div>

              <div className="ml-5 border-l-2 border-border pl-8 space-y-4">
                {phase.items.map((item) => (
                  <Card key={item.title} className={item.status === 'done' ? 'border-green-500/30' : ''}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                            {item.icon}
                          </div>
                          <div>
                            <CardTitle className="flex items-center gap-2 text-base">
                              {getStatusIcon(item.status)}
                              {item.title}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {item.description}
                            </CardDescription>
                          </div>
                        </div>
                        {getStatusBadge(item.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                        {item.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-lg border border-primary/20 bg-primary/5 p-6 text-center">
          <Sparkles className="mx-auto mb-4 h-8 w-8 text-primary" />
          <h3 className="text-lg font-medium">Have Feature Ideas?</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {"We're building this for AEs like you. Your feedback shapes our roadmap."}
          </p>
          <Button className="mt-4" variant="outline" asChild>
            <Link href="mailto:feedback@signalmonitor.app">Share Your Ideas</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
