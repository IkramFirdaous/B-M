'use client'

import { useEffect, useState, useCallback } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Database } from '@/lib/types/database'
import { motion, AnimatePresence } from 'framer-motion'
import { PiggyBank, Plus, Target, Trophy, X, Calendar } from 'lucide-react'
import AppLayout from './AppLayout'
import FloatingActionButton from './FloatingActionButton'
import { format, differenceInDays } from 'date-fns'

type SavingsGoal = Database['public']['Tables']['savings_goals']['Row']

export default function SavingsContent({ userId }: { userId: string }) {
  const [goals, setGoals] = useState<(SavingsGoal & { progress: number; savedAmount: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    target_date: '',
  })
  const supabase = createSupabaseClient()

  const loadGoals = useCallback(async () => {
    try {
      const { data: goalsData } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      // Calculate progress for each goal
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'transfer')

      if (goalsData) {
        const goalsWithProgress = goalsData.map(goal => {
          // For now, we'll calculate based on all savings transactions
          // In a real app, you'd link transactions to specific goals
          const savedAmount = transactions
            ?.filter(t => t.notes?.toLowerCase().includes('sav'))
            .reduce((sum, t) => sum + Number(t.amount), 0) || 0

          const progress = (savedAmount / Number(goal.target_amount)) * 100

          return {
            ...goal,
            savedAmount,
            progress: Math.min(progress, 100),
          }
        })

        setGoals(goalsWithProgress)
      }
    } catch (error) {
      console.error('Error loading goals:', error)
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  useEffect(() => {
    loadGoals()
  }, [loadGoals])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('savings_goals')
        .insert({
          user_id: userId,
          name: formData.name,
          target_amount: parseFloat(formData.target_amount),
          target_date: formData.target_date,
        })

      if (error) throw error

      setShowAddModal(false)
      setFormData({ name: '', target_amount: '', target_date: '' })
      loadGoals()
    } catch (error: any) {
      alert('Error creating goal: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this savings goal?')) return

    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Error deleting goal: ' + error.message)
      return
    }

    loadGoals()
  }

  if (loading && goals.length === 0) {
    return (
      <AppLayout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mx-auto"
            />
            <p className="mt-4 text-gray-600">Loading your dreams...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  const totalSaved = goals.reduce((sum, g) => sum + g.savedAmount, 0)
  const totalTarget = goals.reduce((sum, g) => sum + Number(g.target_amount), 0)
  const completedGoals = goals.filter(g => g.progress >= 100).length

  return (
    <AppLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-success-600 to-primary-400 bg-clip-text text-transparent">
          Savings Goals
        </h1>
        <p className="text-gray-600 mt-2">
          Every dollar saved is one less dollar about to betray you.
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-success-50 to-success-100/50 rounded-2xl shadow-soft p-6 border border-success-200"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-success-700">Total Saved</p>
                <p className="text-4xl font-bold text-success-600 mt-2">
                  ${totalSaved.toFixed(2)}
                </p>
                <p className="text-xs text-success-600 mt-1">Keep it up!</p>
              </div>
              <div className="p-3 bg-success-200/50 rounded-xl">
                <PiggyBank className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-2xl shadow-soft p-6 border border-primary-200"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-primary-700">Total Target</p>
                <p className="text-4xl font-bold text-primary-600 mt-2">
                  ${totalTarget.toFixed(2)}
                </p>
                <p className="text-xs text-primary-600 mt-1">
                  {((totalSaved / totalTarget) * 100).toFixed(0)}% there
                </p>
              </div>
              <div className="p-3 bg-primary-200/50 rounded-xl">
                <Target className="w-6 h-6 text-primary-600" />
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
                <p className="text-sm font-medium text-warning-700">Completed Goals</p>
                <p className="text-4xl font-bold text-warning-600 mt-2">
                  {completedGoals}
                </p>
                <p className="text-xs text-warning-600 mt-1">
                  out of {goals.length}
                </p>
              </div>
              <div className="p-3 bg-warning-200/50 rounded-xl">
                <Trophy className="w-6 h-6 text-warning-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Goals List */}
        {goals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-soft p-12 text-center"
          >
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <PiggyBank className="w-10 h-10 text-success-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No savings goals yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start saving for something special. Your future self will thank you!
              </p>
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-success-600 text-white rounded-xl hover:bg-success-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Create Your First Goal
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Your Goals</h2>
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-success-600 text-white rounded-xl hover:bg-success-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Goal
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((goal, index) => {
                const daysLeft = differenceInDays(new Date(goal.target_date), new Date())
                const isCompleted = goal.progress >= 100

                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-white rounded-2xl shadow-soft p-6 border-2 ${
                      isCompleted ? 'border-success-300 bg-success-50/30' : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{goal.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>Target: {format(new Date(goal.target_date), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                      {isCompleted && (
                        <div className="p-2 bg-success-100 rounded-full">
                          <Trophy className="w-5 h-5 text-success-600" />
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-medium text-gray-700">
                          ${goal.savedAmount.toFixed(2)} / ${Number(goal.target_amount).toFixed(2)}
                        </span>
                        <span className={`font-bold ${isCompleted ? 'text-success-600' : 'text-gray-900'}`}>
                          {goal.progress.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${goal.progress}%` }}
                          transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                          className={`h-full rounded-full ${
                            isCompleted ? 'bg-gradient-to-r from-success-500 to-success-600' : 'bg-gradient-to-r from-primary-500 to-primary-600'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? 'Today!' : 'Overdue'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDelete(goal.id)}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
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

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-white rounded-3xl shadow-soft-xl z-50 overflow-y-auto max-h-[90vh]"
            >
              <div className="p-8">
                <div className="relative mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 text-center">New Savings Goal</h2>
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
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Goal Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-success-500 focus:border-success-500 transition-all"
                    placeholder="e.g., Emergency Fund, Vacation, New Car"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="target_amount" className="block text-sm font-medium text-gray-700 mb-2">
                    Target Amount
                  </label>
                  <input
                    id="target_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.target_amount}
                    onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-success-500 focus:border-success-500 transition-all"
                    placeholder="e.g., 5000"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="target_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Target Date
                  </label>
                  <input
                    id="target_date"
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-success-500 focus:border-success-500 transition-all"
                    required
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-success-600 to-success-500 text-white py-3 px-6 rounded-xl hover:shadow-glow-success disabled:opacity-50 transition-all font-medium"
                >
                  {loading ? 'Creating...' : 'Create Goal'}
                </motion.button>
              </form>
            </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <FloatingActionButton />
    </AppLayout>
  )
}
