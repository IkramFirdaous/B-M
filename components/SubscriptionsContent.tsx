'use client'

import { useEffect, useState, useCallback } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import SubscriptionCard from './SubscriptionCard'
import { Database } from '@/lib/types/database'
import { Plus, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import AppLayout from './AppLayout'
import FloatingActionButton from './FloatingActionButton'

type RecurringTransaction = Database['public']['Tables']['recurring_transactions']['Row']

export default function SubscriptionsContent({ userId }: { userId: string }) {
  const [subscriptions, setSubscriptions] = useState<RecurringTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [totalMonthly, setTotalMonthly] = useState(0)
  const [totalAnnual, setTotalAnnual] = useState(0)
  const supabase = createSupabaseClient()

  const loadSubscriptions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_subscription', true)
        .order('vendor_name', { ascending: true })

      if (error) throw error

      if (data) {
        setSubscriptions(data)
        
        // Calculate totals
        let monthly = 0
        let annual = 0
        
        data.forEach(sub => {
          if (sub.billing_cycle === 'monthly') {
            monthly += Number(sub.amount)
            annual += Number(sub.amount) * 12
          } else if (sub.billing_cycle === 'yearly') {
            annual += Number(sub.amount)
            monthly += Number(sub.amount) / 12
          }
        })
        
        setTotalMonthly(monthly)
        setTotalAnnual(annual)
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  useEffect(() => {
    loadSubscriptions()
  }, [loadSubscriptions])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscription?')) {
      return
    }

    const { error } = await supabase
      .from('recurring_transactions')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Error deleting subscription: ' + error.message)
      return
    }

    loadSubscriptions()
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
            <p className="mt-4 text-gray-600">Loading your financial commitments...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  // Fun header message based on subscription count
  const getHeaderMessage = () => {
    if (subscriptions.length === 0) return "No subscriptions yet. That&apos;s... actually impressive."
    if (subscriptions.length > 10) return "These are the monthly payments slowly draining your soul."
    if (subscriptions.length > 5) return "Quite a collection you&apos;ve got here."
    return "Managing your recurring expenses, one at a time."
  }

  return (
    <AppLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-danger-600 to-warning-500 bg-clip-text text-transparent">
          Subscriptions
        </h1>
        <p className="text-gray-600 mt-2 italic">
          {getHeaderMessage()}
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
            className="bg-white rounded-2xl shadow-soft p-6 border border-gray-200"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {subscriptions.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {subscriptions.length === 1 ? 'commitment' : 'commitments'}
                </p>
              </div>
              <div className="p-3 bg-primary-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-warning-50 to-warning-100/50 rounded-2xl shadow-soft p-6 border border-warning-200"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-warning-700">Monthly Drain</p>
                <p className="text-4xl font-bold text-warning-600 mt-2">
                  ${totalMonthly.toFixed(2)}
                </p>
                <p className="text-xs text-warning-600 mt-1">per month</p>
              </div>
              <div className="p-3 bg-warning-200/50 rounded-xl">
                <TrendingDown className="w-6 h-6 text-warning-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-danger-50 to-danger-100/50 rounded-2xl shadow-soft p-6 border border-danger-200"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-danger-700">Annual Impact</p>
                <p className="text-4xl font-bold text-danger-600 mt-2">
                  ${totalAnnual.toFixed(2)}
                </p>
                <p className="text-xs text-danger-600 mt-1">That&apos;s a used car!</p>
              </div>
              <div className="p-3 bg-danger-200/50 rounded-xl">
                <DollarSign className="w-6 h-6 text-danger-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Subscription Cards */}
        {subscriptions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-soft p-12 text-center"
          >
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No subscriptions yet
              </h3>
              <p className="text-gray-500 mb-6">
                That&apos;s... actually impressive. Either you&apos;re very disciplined or you forgot to add them.
              </p>
              <Link href="/subscriptions/new">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Subscription
                </motion.button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Add Subscription Button */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Your Subscriptions</h2>
              <Link href="/subscriptions/new">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Subscription
                </motion.button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subscriptions.map((subscription, index) => (
                <motion.div
                  key={subscription.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <SubscriptionCard
                    subscription={subscription}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      <FloatingActionButton />
    </AppLayout>
  )
}

