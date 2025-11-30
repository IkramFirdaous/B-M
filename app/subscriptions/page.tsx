import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import SubscriptionsContent from '@/components/SubscriptionsContent'

export default async function SubscriptionsPage() {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return <SubscriptionsContent userId={session.user.id} />
}

