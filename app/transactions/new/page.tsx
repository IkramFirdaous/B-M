import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import TransactionForm from '@/components/TransactionForm'

export default async function NewTransactionPage() {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return <TransactionForm userId={session.user.id} />
}

