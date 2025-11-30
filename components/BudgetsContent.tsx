'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Database } from '@/lib/types/database'
import { ArrowLeft, Plus, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

type Budget = Database['public']['Tables']['budgets']['Row']
type Category = Database['public']['Tables']['categories']['Row']
type Transaction = Database['public']['Tables']['transactions']['Row']

export default function BudgetsContent({ userId }: { userId: string }) {
  const [budgets, setBudgets] = useState<(Budget & { category?: Category; spent?: number })[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadBudgets()
  }, [userId, month, year])

  const loadBudgets = async () => {
    try {
      // Load budgets
      const { data: budgetsData } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .eq('month', month)
        .eq('year', year)

      // Load categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)

      // Load transactions for spending calculation
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]

      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'expense')
        .gte('date', startDate)
        .lte('date', endDate)

      if (budgetsData && categoriesData) {
        const categoryMap = new Map(categoriesData.map(c => [c.id, c]))
        const spendingByCategory: Record<string, number> = {}

        transactions?.forEach(t => {
          spendingByCategory[t.category_id] = (spendingByCategory[t.category_id] || 0) + Number(t.amount)
        })

        const budgetsWithDetails = budgetsData.map(budget => ({
          ...budget,
          category: categoryMap.get(budget.category_id),
          spent: spendingByCategory[budget.category_id] || 0,
        }))

        setBudgets(budgetsWithDetails)
        setCategories(categoriesData)
      }
    } catch (error) {
      console.error('Error loading budgets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Error deleting budget: ' + error.message)
      return
    }

    loadBudgets()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading budgets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
              <p className="text-gray-600 mt-1">Manage your monthly budgets</p>
            </div>
            <div className="flex gap-4">
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{format(new Date(2000, m - 1), 'MMMM')}</option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {budgets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No budgets set for this month</p>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                <Plus className="w-5 h-5" />
                Create Budget
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {budgets.map((budget) => {
                const percentage = (budget.spent! / Number(budget.amount)) * 100
                const isOver = percentage > 100
                const isWarning = percentage > 90

                return (
                  <div key={budget.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {budget.category?.name || 'Unknown Category'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          ${budget.spent!.toFixed(2)} / ${Number(budget.amount).toFixed(2)}
                        </p>
                      </div>
                      {(isOver || isWarning) && (
                        <AlertTriangle className={`w-5 h-5 ${isOver ? 'text-red-500' : 'text-yellow-500'}`} />
                      )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isOver ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={isOver ? 'text-red-600 font-semibold' : ''}>
                        {percentage.toFixed(1)}% used
                      </span>
                      <button
                        onClick={() => handleDelete(budget.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

