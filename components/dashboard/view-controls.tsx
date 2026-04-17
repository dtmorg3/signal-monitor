'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LayoutGrid, List, ArrowUpDown } from 'lucide-react'

export type ViewMode = 'grid' | 'list'
export type SortOption = 'score' | 'name' | 'recent' | 'signals'

interface ViewControlsProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  accountCount: number
}

export function ViewControls({
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  accountCount,
}: ViewControlsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-medium">
          Accounts
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({accountCount})
          </span>
        </h2>
      </div>

      <div className="flex items-center gap-2">
        {/* Sort dropdown */}
        <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
          <SelectTrigger className="h-9 w-[160px]">
            <ArrowUpDown className="mr-2 h-3.5 w-3.5" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="score">Top Signal Score</SelectItem>
            <SelectItem value="signals">Most Signals</SelectItem>
            <SelectItem value="recent">Recently Scanned</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
          </SelectContent>
        </Select>

        {/* View toggle */}
        <div className="flex rounded-md border">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-9 rounded-r-none px-3"
            onClick={() => onViewModeChange('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-9 rounded-l-none px-3"
            onClick={() => onViewModeChange('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
