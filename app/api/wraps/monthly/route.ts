import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { startOfMonth, endOfMonth, format } from 'date-fns'

export async function GET(request: Request) {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1))
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))

    const startDate = format(startOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd')
    const endDate = format(endOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd')

    // Fetch transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', session.user.id)
      .gte('date', startDate)
      .lte('date', endDate)

    // Fetch subscriptions
    const { data: subscriptions } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('is_subscription', true)

    // Calculate metrics
    const totalIncome = transactions
      ?.filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0

    const totalExpenses = transactions
      ?.filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0

    const netSavings = totalIncome - totalExpenses

    // Category spending
    const categorySpending: Record<string, number> = {}
    transactions
      ?.filter(t => t.type === 'expense')
      .forEach(t => {
        categorySpending[t.category_id] = (categorySpending[t.category_id] || 0) + Number(t.amount)
      })

    const topCategory = Object.entries(categorySpending)
      .sort(([, a], [, b]) => b - a)[0]?.[0]

    const lowestCategory = Object.entries(categorySpending)
      .sort(([, a], [, b]) => a - b)[0]?.[0]

    // Subscription total
    const subscriptionTotal = subscriptions
      ?.filter(s => s.billing_cycle === 'monthly')
      .reduce((sum, s) => sum + Number(s.amount), 0) || 0

    // Get category names
    const categoryIds = [...new Set(Object.keys(categorySpending))]
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name')
      .in('id', categoryIds)

    const categoryMap = new Map(categories?.map(c => [c.id, c.name]) || [])

    // Calculate performance score (simplified)
    const { data: budgets } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('month', month)
      .eq('year', year)

    const { data: savingsGoals } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', session.user.id)

    // Simplified performance score calculation
    let performanceScore = 50 // Default
    if (budgets && budgets.length > 0) {
      const budgetAdherence = budgets.reduce((sum, budget) => {
        const spent = categorySpending[budget.category_id] || 0
        const adherence = Math.max(0, 1 - (spent / Number(budget.amount)))
        return sum + adherence
      }, 0) / budgets.length
      performanceScore = Math.round(budgetAdherence * 100)
    }

    return NextResponse.json({
      month,
      year,
      totalIncome,
      totalExpenses,
      netSavings,
      subscriptionTotal,
      topCategory: topCategory ? {
        id: topCategory,
        name: categoryMap.get(topCategory),
        amount: categorySpending[topCategory],
      } : null,
      lowestCategory: lowestCategory ? {
        id: lowestCategory,
        name: categoryMap.get(lowestCategory),
        amount: categorySpending[lowestCategory],
      } : null,
      performanceScore,
      transactionCount: transactions?.length || 0,
    })
  } catch (error) {
    console.error('Error generating monthly wrap:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

