'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Plus, Radar, LogOut, Map } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface HeaderProps {
  onAddAccount?: () => void
  onScanAll?: () => void
  isScanning?: boolean
  userEmail?: string
  isDemo?: boolean
}

export function DashboardHeader({ onAddAccount, onScanAll, isScanning, userEmail, isDemo }: HeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    if (isDemo) {
      router.push('/auth/login')
      return
    }
    await supabase.auth.signOut()
    toast.success('Logged out successfully')
    router.push('/auth/login')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <Radar className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-medium tracking-tight">Echolok8</h1>
            <p className="text-xs text-muted-foreground">Research Intelligence</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {userEmail && (
            <span className="hidden text-xs text-muted-foreground md:block">
              {userEmail}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-9"
          >
            <Link href="/roadmap">
              <Map className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Roadmap</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onScanAll}
            disabled={isScanning}
            className="h-9"
          >
            <Radar className={`mr-2 h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isScanning ? 'Scanning...' : 'Scan All'}</span>
          </Button>
          <Button
            size="sm"
            onClick={onAddAccount}
            className="h-9"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Add Account</span>
          </Button>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="h-9 w-9 p-0"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
