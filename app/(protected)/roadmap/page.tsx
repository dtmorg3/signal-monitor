import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RoadmapView } from '@/components/roadmap/roadmap-view'

export default async function RoadmapPage() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/login')
  }

  return <RoadmapView />
}
