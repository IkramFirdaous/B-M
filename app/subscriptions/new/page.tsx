import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import SubscriptionForm from '@/components/SubscriptionForm'

export default async function NewSubscriptionPage() {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return <SubscriptionForm userId={session.user.id} />
}


