import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import SetupContent from '@/components/SetupContent'

export default async function SetupPage() {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  // Check if user already has accounts
  const { data: accounts } = await supabase
    .from('accounts')
    .select('id')
    .eq('user_id', session.user.id)
    .limit(1)

  if (accounts && accounts.length > 0) {
    redirect('/dashboard')
  }

  return <SetupContent userId={session.user.id} />
}

