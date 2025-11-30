'use client'

import { useEffect, useState, useCallback } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Database } from '@/lib/types/database'
import { Plus, AlertTriangle, TrendingUp, Target, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import AppLayout from './AppLayout'
import FloatingActionButton from './FloatingActionButton'
import BudgetDonutChart from './BudgetDonutChart'

type Budget = Database['public']['Tables']['budgets']['Row']
type Category = Database['public']['Tables']['categories']['Row']

interface BudgetWithDetails extends Budget {
  category?: Category
  spent: number
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // orange
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange-alt
]

export default function BudgetsContent({ userId }: { userId: string }) {
  const [budgets, setBudgets] = useState<BudgetWithDetails[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    budget_month: new Date().getMonth() + 1,
    budget_year: new Date().getFullYear(),
  })
  const supabase = createSupabaseClient()

  const loadBudgets = useCallback(async () => {
    try {
      const { data: budgetsData } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .eq('month', month)
        .eq('year', year)

      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)

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
  }, [userId, month, year, supabase])

  useEffect(() => {
    loadBudgets()
  }, [loadBudgets])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this budget?')) return

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

  const goToPreviousMonth = () => {
    if (month === 1) {
      setMonth(12)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }

  const goToNextMonth = () => {
    if (month === 12) {
      setMonth(1)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Check if budget already exists for this category/month/year
      const existingBudget = budgets.find(
        b => b.category_id === formData.category_id &&
             b.month === formData.budget_month &&
             b.year === formData.budget_year
      )

      if (existingBudget) {
        alert('A budget already exists for this category in the selected month.')
        setLoading(false)
        return
      }

      const { error } = await supabase
        .from('budgets')
        .insert({
          user_id: userId,
          category_id: formData.category_id,
          amount: parseFloat(formData.amount),
          month: formData.budget_month,
          year: formData.budget_year,
        })

      if (error) throw error

      setShowAddModal(false)
      setFormData({
        category_id: '',
        amount: '',
        budget_month: month,
        budget_year: year,
      })

      // Reload budgets if the created budget is for the current view
      if (formData.budget_month === month && formData.budget_year === year) {
        loadBudgets()
      }
    } catch (error: any) {
      alert('Error creating budget: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

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
            <p className="mt-4 text-gray-600">Loading your budget reality check...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
  const overBudgetCount = budgets.filter(b => (b.spent / Number(b.amount)) > 1).length
  const budgetCategories = budgets.map((b, i) => ({
    name: b.category?.name || 'Unknown',
    amount: Number(b.amount),
    spent: b.spent,
    color: COLORS[i % COLORS.length],
  }))

  return (
    <AppLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 to-success-400 bg-clip-text text-transparent">
          Budgets
        </h1>
        <p className="text-gray-600 mt-2">
          {budgets.length > 0 ? "You&apos;re burning through your budget like..." : "No budgets yet. Let&apos;s fix that."}
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* Month Selector */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-between bg-white rounded-2xl shadow-soft p-4"
        >
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {format(new Date(year, month - 1), 'MMMM yyyy')}
            </h2>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </motion.div>

        {budgets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-soft p-12 text-center"
          >
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No budgets for this month
              </h3>
              <p className="text-gray-500 mb-6">
                Set some spending limits to avoid financial chaos.
              </p>
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Create Your First Budget
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-2xl shadow-soft p-6 border border-primary-200"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary-700">Total Budget</p>
                    <p className="text-4xl font-bold text-primary-600 mt-2">
                      ${totalBudget.toFixed(2)}
                    </p>
                    <p className="text-xs text-primary-600 mt-1">This month</p>
                  </div>
                  <div className="p-3 bg-primary-200/50 rounded-xl">
                    <Target className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -4 }}
                className={`bg-gradient-to-br rounded-2xl shadow-soft p-6 border ${
                  totalSpent > totalBudget
                    ? 'from-danger-50 to-danger-100/50 border-danger-200'
                    : 'from-success-50 to-success-100/50 border-success-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-sm font-medium ${totalSpent > totalBudget ? 'text-danger-700' : 'text-success-700'}`}>
                      Total Spent
                    </p>
                    <p className={`text-4xl font-bold mt-2 ${totalSpent > totalBudget ? 'text-danger-600' : 'text-success-600'}`}>
                      ${totalSpent.toFixed(2)}
                    </p>
                    <p className={`text-xs mt-1 ${totalSpent > totalBudget ? 'text-danger-600' : 'text-success-600'}`}>
                      {((totalSpent / totalBudget) * 100).toFixed(0)}% of budget
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${totalSpent > totalBudget ? 'bg-danger-200/50' : 'bg-success-200/50'}`}>
                    <TrendingUp className={`w-6 h-6 ${totalSpent > totalBudget ? 'text-danger-600' : 'text-success-600'}`} />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -4 }}
                className="bg-gradient-to-br from-warning-50 to-warning-100/50 rounded-2xl shadow-soft p-6 border border-warning-200"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-warning-700">Over Budget</p>
                    <p className="text-4xl font-bold text-warning-600 mt-2">
                      {overBudgetCount}
                    </p>
                    <p className="text-xs text-warning-600 mt-1">
                      {overBudgetCount === 1 ? 'category' : 'categories'}
                    </p>
                  </div>
                  <div className="p-3 bg-warning-200/50 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-warning-600" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Donut Chart */}
            {budgetCategories.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-soft p-8"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6">Budget Overview</h3>
                <BudgetDonutChart categories={budgetCategories} size={280} />
              </motion.div>
            )}

            {/* Add Budget Button */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Your Budgets</h2>
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Budget
              </motion.button>
            </div>

            {/* Budget List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgets.map((budget, index) => {
                const percentage = (budget.spent / Number(budget.amount)) * 100
                const isOver = percentage > 100
                const isWarning = percentage > 80

                return (
                  <motion.div
                    key={budget.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className={`bg-white rounded-2xl shadow-soft p-6 border-2 ${
                      isOver ? 'border-danger-300 bg-danger-50/20' : isWarning ? 'border-warning-300 bg-warning-50/20' : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">
                          {budget.category?.name || 'Unknown Category'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          ${budget.spent.toFixed(2)} of ${Number(budget.amount).toFixed(2)}
                        </p>
                      </div>
                      {(isOver || isWarning) && (
                        <motion.div
                          animate={{ rotate: [0, -10, 10, -10, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                        >
                          <AlertTriangle className={`w-5 h-5 ${isOver ? 'text-danger-500' : 'text-warning-500'}`} />
                        </motion.div>
                      )}
                    </div>

                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(percentage, 100)}%` }}
                          transition={{ duration: 1, delay: 0.6 + index * 0.05 }}
                          className={`h-full rounded-full ${
                            isOver ? 'bg-gradient-to-r from-danger-500 to-danger-600' :
                            isWarning ? 'bg-gradient-to-r from-warning-500 to-warning-600' :
                            'bg-gradient-to-r from-success-500 to-success-600'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold ${
                        isOver ? 'text-danger-600' : isWarning ? 'text-warning-600' : 'text-success-600'
                      }`}>
                        {percentage.toFixed(1)}% used
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDelete(budget.id)}
                        className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>

                    {isOver && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-danger-600 italic mt-2"
                      >
                        You&apos;ve exceeded this budget. Hope it was worth it!
                      </motion.p>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Add Budget Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative w-full max-w-md bg-white rounded-3xl shadow-soft-xl max-h-[90vh] overflow-y-auto"
                >
              <div className="p-8">
                <div className="relative mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 text-center">New Budget</h2>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="absolute top-0 right-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    id="category_id"
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories
                      .filter(cat => {
                        // Filter out categories that already have budgets for the selected month/year
                        const hasBudget = budgets.some(
                          b => b.category_id === cat.id &&
                               b.month === formData.budget_month &&
                               b.year === formData.budget_year
                        )
                        return !hasBudget
                      })
                      .map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                  {categories.filter(cat => !budgets.some(
                    b => b.category_id === cat.id &&
                         b.month === formData.budget_month &&
                         b.year === formData.budget_year
                  )).length === 0 && (
                    <p className="text-sm text-warning-600 mt-2">
                      All categories have budgets for this month. Try another month or delete an existing budget.
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                    <input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-lg font-semibold"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="budget_month" className="block text-sm font-medium text-gray-700 mb-2">
                      Month
                    </label>
                    <select
                      id="budget_month"
                      value={formData.budget_month}
                      onChange={(e) => setFormData({ ...formData, budget_month: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                          {format(new Date(2000, m - 1), 'MMMM')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="budget_year" className="block text-sm font-medium text-gray-700 mb-2">
                      Year
                    </label>
                    <select
                      id="budget_year"
                      value={formData.budget_year}
                      onChange={(e) => setFormData({ ...formData, budget_year: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    >
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 1 + i).map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-4">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3 px-6 rounded-xl hover:shadow-glow disabled:opacity-50 transition-all font-medium"
                  >
                    {loading ? 'Creating...' : 'Create Budget'}
                  </motion.button>
                </div>
              </form>
            </div>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>

      <FloatingActionButton />
    </AppLayout>
  )
}
