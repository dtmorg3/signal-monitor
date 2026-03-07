import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Dashboard } from '@/components/dashboard'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/login')
  }

  // Check if user has any accounts - if not, redirect to onboarding
  const { data: accounts } = await supabase
    .from('accounts')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)

  if (!accounts || accounts.length === 0) {
    redirect('/onboarding')
  }

  return <Dashboard userId={user.id} userEmail={user.email} />
}
