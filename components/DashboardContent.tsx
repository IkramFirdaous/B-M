'use client'

import { useEffect, useState, useCallback } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import PerformanceScore from './PerformanceScore'
import { calculatePerformanceScoreFromData } from '@/lib/utils/performance-score'
import { Database } from '@/lib/types/database'
import { getRandomCopy } from '@/lib/copywriting'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import Link from 'next/link'
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from 'lucide-react'
import { motion } from 'framer-motion'
import AppLayout from './AppLayout'
import FloatingActionButton from './FloatingActionButton'

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

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mx-auto"
            />
            <p className="mt-4 text-gray-600">Loading your financial reality...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
          Welcome Back
        </h1>
        <p className="text-gray-600 mt-2">
          {getRandomCopy('dashboard', 'welcome')}
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* Performance Score Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-soft p-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Your Financial Health</h2>
          {performanceScore ? (
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
              <PerformanceScore
                score={performanceScore.score}
                tier={performanceScore.tier}
                insights={performanceScore.insights}
                size={200}
              />
              <div className="flex-1 space-y-4">
                <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl">
                  <p className="text-sm font-medium text-gray-700 mb-2">Quick Take:</p>
                  <p className="text-gray-600">
                    {getRandomCopy('performanceScore', performanceScore.tier)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Add transactions and budgets to see your performance score</p>
              <p className="text-sm text-gray-400 mt-2">No pressure, we all start somewhere.</p>
            </div>
          )}
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-success-50 to-success-100/50 rounded-2xl shadow-soft p-6 border border-success-200/50"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-success-700">Total Income</p>
                <p className="text-3xl font-bold text-success-600 mt-2">
                  ${stats.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-success-600 mt-1">This month</p>
              </div>
              <div className="p-3 bg-success-200/50 rounded-xl">
                <TrendingUp className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-danger-50 to-danger-100/50 rounded-2xl shadow-soft p-6 border border-danger-200/50"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-danger-700">Total Expenses</p>
                <p className="text-3xl font-bold text-danger-600 mt-2">
                  ${stats.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-danger-600 mt-1">This month</p>
              </div>
              <div className="p-3 bg-danger-200/50 rounded-xl">
                <TrendingDown className="w-6 h-6 text-danger-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -4 }}
            className={`bg-gradient-to-br rounded-2xl shadow-soft p-6 border ${
              stats.netSavings >= 0
                ? 'from-success-50 to-success-100/50 border-success-200/50'
                : 'from-danger-50 to-danger-100/50 border-danger-200/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-sm font-medium ${stats.netSavings >= 0 ? 'text-success-700' : 'text-danger-700'}`}>
                  Net Savings
                </p>
                <p className={`text-3xl font-bold mt-2 ${
                  stats.netSavings >= 0 ? 'text-success-600' : 'text-danger-600'
                }`}>
                  ${stats.netSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className={`text-xs mt-1 ${stats.netSavings >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                  {stats.netSavings >= 0 ? 'Looking good' : 'Uh oh'}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stats.netSavings >= 0 ? 'bg-success-200/50' : 'bg-danger-200/50'}`}>
                <DollarSign className={`w-6 h-6 ${
                  stats.netSavings >= 0 ? 'text-success-600' : 'text-danger-600'
                }`} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-2xl shadow-soft p-6 border border-primary-200/50"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-primary-700">Subscriptions</p>
                <p className="text-3xl font-bold text-primary-600 mt-2">
                  {stats.subscriptionCount}
                </p>
                <p className="text-xs text-primary-600 mt-1">
                  ${stats.subscriptionMonthly.toFixed(2)}/month
                </p>
              </div>
              <div className="p-3 bg-primary-200/50 rounded-xl">
                <CreditCard className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </motion.div>
        </div>

      </div>

      <FloatingActionButton />
    </AppLayout>
  )
}

