export type SignalSource = 
  | 'hacker_news' 
  | 'web_search' 
  | 'greenhouse' 
  | 'lever' 
  | 'crunchbase' 
  | 'github'

export type SignalType = 
  | 'hiring' 
  | 'funding' 
  | 'product_launch' 
  | 'tech_adoption' 
  | 'expansion' 
  | 'partnership' 
  | 'leadership_change' 
  | 'press_mention' 
  | 'open_source_activity' 
  | 'community_engagement'

export type ScanStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface Account {
  id: string
  user_id: string
  name: string
  domain: string
  industry: string | null
  employee_count: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Scan {
  id: string
  user_id: string
  account_id: string
  status: ScanStatus
  started_at: string
  completed_at: string | null
  error_message: string | null
}

export interface Signal {
  id: string
  user_id: string
  account_id: string
  scan_id: string
  source: SignalSource
  type: SignalType
  title: string
  snippet: string | null
  url: string | null
  score: number
  play_recommendation: string | null
  raw_data: Record<string, unknown> | null
  detected_at: string
}

export interface CachedResult {
  id: string
  source: string
  query_key: string
  response_data: Record<string, unknown>
  cached_at: string
  expires_at: string
}

// UI helper types
export interface AccountWithSignals extends Account {
  signals: Signal[]
  latestScan: Scan | null
  signalCount: number
  topScore: number
}

export const SIGNAL_TYPE_LABELS: Record<SignalType, string> = {
  hiring: 'Hiring',
  funding: 'Funding',
  product_launch: 'Product Launch',
  tech_adoption: 'Tech Adoption',
  expansion: 'Expansion',
  partnership: 'Partnership',
  leadership_change: 'Leadership Change',
  press_mention: 'Press Mention',
  open_source_activity: 'Open Source',
  community_engagement: 'Community'
}

export const SIGNAL_SOURCE_LABELS: Record<SignalSource, string> = {
  hacker_news: 'Hacker News',
  web_search: 'Web Search',
  greenhouse: 'Greenhouse',
  lever: 'Lever',
  crunchbase: 'Crunchbase',
  github: 'GitHub'
}

export const SIGNAL_TYPE_COLORS: Record<SignalType, string> = {
  hiring: 'bg-[oklch(var(--signal-hiring)/0.15)] text-[oklch(var(--signal-hiring))] border-[oklch(var(--signal-hiring)/0.3)]',
  funding: 'bg-[oklch(var(--signal-funding)/0.15)] text-[oklch(var(--signal-funding))] border-[oklch(var(--signal-funding)/0.3)]',
  product_launch: 'bg-[oklch(var(--signal-product)/0.15)] text-[oklch(var(--signal-product))] border-[oklch(var(--signal-product)/0.3)]',
  tech_adoption: 'bg-[oklch(var(--signal-tech)/0.15)] text-[oklch(var(--signal-tech))] border-[oklch(var(--signal-tech)/0.3)]',
  expansion: 'bg-[oklch(var(--signal-expansion)/0.15)] text-[oklch(var(--signal-expansion))] border-[oklch(var(--signal-expansion)/0.3)]',
  partnership: 'bg-[oklch(var(--signal-partnership)/0.15)] text-[oklch(var(--signal-partnership))] border-[oklch(var(--signal-partnership)/0.3)]',
  leadership_change: 'bg-[oklch(var(--signal-leadership)/0.15)] text-[oklch(var(--signal-leadership))] border-[oklch(var(--signal-leadership)/0.3)]',
  press_mention: 'bg-[oklch(var(--signal-press)/0.15)] text-[oklch(var(--signal-press))] border-[oklch(var(--signal-press)/0.3)]',
  open_source_activity: 'bg-[oklch(var(--signal-opensource)/0.15)] text-[oklch(var(--signal-opensource))] border-[oklch(var(--signal-opensource)/0.3)]',
  community_engagement: 'bg-[oklch(var(--signal-community)/0.15)] text-[oklch(var(--signal-community))] border-[oklch(var(--signal-community)/0.3)]'
}
