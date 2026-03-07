'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SIGNAL_TYPE_LABELS, type SignalType } from '@/lib/types'
import { X } from 'lucide-react'

interface SignalFiltersProps {
  activeFilters: SignalType[]
  onFilterChange: (filters: SignalType[]) => void
  signalCounts: Record<SignalType, number>
}

export function SignalFilters({ 
  activeFilters, 
  onFilterChange,
  signalCounts 
}: SignalFiltersProps) {
  const allTypes = Object.keys(SIGNAL_TYPE_LABELS) as SignalType[]
  const availableTypes = allTypes.filter(type => signalCounts[type] > 0)

  const toggleFilter = (type: SignalType) => {
    if (activeFilters.includes(type)) {
      onFilterChange(activeFilters.filter(f => f !== type))
    } else {
      onFilterChange([...activeFilters, type])
    }
  }

  const clearFilters = () => {
    onFilterChange([])
  }

  if (availableTypes.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground">Filter:</span>
      {availableTypes.map((type) => (
        <Badge
          key={type}
          variant={activeFilters.includes(type) ? 'default' : 'outline'}
          className="cursor-pointer transition-colors"
          onClick={() => toggleFilter(type)}
        >
          {SIGNAL_TYPE_LABELS[type]}
          <span className="ml-1 opacity-60">({signalCounts[type]})</span>
        </Badge>
      ))}
      {activeFilters.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-6 px-2 text-xs"
        >
          <X className="mr-1 h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  )
}
