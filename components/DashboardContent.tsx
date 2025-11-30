'use client'

import { useEffect, useState, useCallback } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import PerformanceScore from './PerformanceScore'
import { calculatePerformanceScoreFromData } from '@/lib/utils/performance-score'
import { Database } from '@/lib/types/database'
import { getRandomCopy } from '@/lib/copywriting'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import Link from 'next/link'
import { LogOut, Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

type Transaction = Database['public']['Tables']['transactions']['Row']
type Budget = Database['public']['Tables']['budgets']['Row']
type SavingsGoal = Database['public']['Tables']['savings_goals']['Row']
type RecurringTransaction = Database['public']['Tables']['recurring_transactions']['Row']

export default function DashboardContent({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true)
  const [performanceScore, setPerformanceScore] = useState<{
    score: number
    tier: 'excellent' | 'stable' | 'riskZone' | 'critical'
    insights: string[]
  } | null>(null)
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netSavings: 0,
    subscriptionCount: 0,
    subscriptionMonthly: 0,
  })
  const supabase = createSupabaseClient()

  const loadDashboardData = useCallback(async () => {
    try {
      const now = new Date()
      const currentMonth = now.getMonth() + 1
      const currentYear = now.getFullYear()
      const startOfCurrentMonth = startOfMonth(now)
      const endOfCurrentMonth = endOfMonth(now)
      const startOfPreviousMonth = startOfMonth(subMonths(now, 1))
      const endOfPreviousMonth = endOfMonth(subMonths(now, 1))

      // Fetch current month transactions
      const { data: currentTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('date', format(startOfCurrentMonth, 'yyyy-MM-dd'))
        .lte('date', format(endOfCurrentMonth, 'yyyy-MM-dd'))

      // Fetch previous month transactions
      const { data: previousTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('date', format(startOfPreviousMonth, 'yyyy-MM-dd'))
        .lte('date', format(endOfPreviousMonth, 'yyyy-MM-dd'))

      // Fetch budgets
      const { data: budgets } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .eq('month', currentMonth)
        .eq('year', currentYear)

      // Fetch savings goals
      const { data: savingsGoals } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', userId)

      // Fetch recurring transactions
      const { data: recurringTransactions } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', userId)

      if (currentTransactions && budgets && savingsGoals && recurringTransactions) {
        // Calculate stats
        const income = currentTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0)
        const expenses = currentTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0)

        const subscriptions = recurringTransactions.filter(rt => rt.is_subscription)
        const subscriptionMonthly = subscriptions
          .filter(rt => rt.billing_cycle === 'monthly')
          .reduce((sum, rt) => sum + Number(rt.amount), 0)

        setStats({
          totalIncome: income,
          totalExpenses: expenses,
          netSavings: income - expenses,
          subscriptionCount: subscriptions.length,
          subscriptionMonthly,
        })

        // Calculate performance score
        const scoreResult = await calculatePerformanceScoreFromData(
          userId,
          currentMonth,
          currentYear,
          currentTransactions,
          budgets,
          savingsGoals,
          recurringTransactions,
          previousTransactions || []
        )

        setPerformanceScore(scoreResult)
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your financial reality...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary-700">Biff&Moi</h1>
              <p className="text-sm text-gray-600 mt-1">
                {getRandomCopy('dashboard', 'welcome')}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Performance Score Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Performance Score</h2>
          {performanceScore ? (
            <div className="flex items-center justify-between">
              <PerformanceScore
                score={performanceScore.score}
                tier={performanceScore.tier}
                size={180}
              />
              <div className="flex-1 ml-8">
                <div className="text-sm text-gray-600 mb-2">
                  {getRandomCopy('performanceScore', performanceScore.tier)}
                </div>
                {performanceScore.insights.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Insights:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {performanceScore.insights.map((insight, i) => (
                        <li key={i}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Add transactions and budgets to see your performance score</p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  ${stats.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  ${stats.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Net Savings</p>
                <p className={`text-2xl font-bold mt-1 ${
                  stats.netSavings >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${stats.netSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className={`w-8 h-8 ${
                stats.netSavings >= 0 ? 'text-green-500' : 'text-red-500'
              }`} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Subscriptions</p>
                <p className="text-2xl font-bold text-primary-600 mt-1">
                  {stats.subscriptionCount}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  ${stats.subscriptionMonthly.toFixed(2)}/mo
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-primary-500" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/transactions/new"
              className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <Plus className="w-5 h-5 text-primary-600" />
              <span className="font-medium">Add Transaction</span>
            </Link>
            <Link
              href="/budgets"
              className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <Plus className="w-5 h-5 text-primary-600" />
              <span className="font-medium">Manage Budgets</span>
            </Link>
            <Link
              href="/subscriptions"
              className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <Plus className="w-5 h-5 text-primary-600" />
              <span className="font-medium">View Subscriptions</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

