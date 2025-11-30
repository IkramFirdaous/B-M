import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import BudgetsContent from '@/components/BudgetsContent'

export default async function BudgetsPage() {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return <BudgetsContent userId={session.user.id} />
}

