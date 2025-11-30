import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('vendor_name', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      account_id,
      category_id,
      amount,
      frequency,
      next_occurrence,
      auto_generate,
      is_subscription,
      billing_cycle,
      vendor_name,
      logo_url,
    } = body

    const { data, error } = await supabase
      .from('recurring_transactions')
      .insert({
        user_id: session.user.id,
        account_id,
        category_id,
        amount,
        frequency,
        next_occurrence,
        auto_generate: auto_generate ?? true,
        is_subscription: is_subscription ?? false,
        billing_cycle,
        vendor_name,
        logo_url,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


