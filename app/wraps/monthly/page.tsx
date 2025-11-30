import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import MonthlyWrap from '@/components/MonthlyWrap'
export const dynamic = 'force-dynamic';

export default async function MonthlyWrapPage() {
  const supabase = createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return <MonthlyWrap />
}


