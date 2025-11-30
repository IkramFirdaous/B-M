'use client'

import { useEffect, useState, useCallback } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import SubscriptionCard from './SubscriptionCard'
import { Database } from '@/lib/types/database'
import { Plus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subscriptions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
              <p className="text-gray-600 mt-1">All your recurring expenses in one place</p>
            </div>
            <Link
              href="/subscriptions/new"
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Subscription
            </Link>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{subscriptions.length}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Monthly Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${totalMonthly.toFixed(2)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Annual Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${totalAnnual.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Subscription Cards */}
          {subscriptions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No subscriptions yet</p>
              <Link
                href="/subscriptions/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Your First Subscription
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subscriptions.map((subscription) => (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

