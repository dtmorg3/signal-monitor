'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'
import { Skeleton } from '@/components/ui/skeleton'

export default function OnboardingPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Check if user already has accounts
      const { data: accounts } = await supabase
        .from('accounts')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      if (accounts && accounts.length > 0) {
        // User already has accounts, skip onboarding
        router.push('/dashboard')
        return
      }

      setUserId(user.id)
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  const handleComplete = () => {
    router.push('/dashboard')
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <Skeleton className="h-96 w-full max-w-xl rounded-lg" />
      </div>
    )
  }

  if (!userId) return null

  return <OnboardingWizard userId={userId} onComplete={handleComplete} />
}
