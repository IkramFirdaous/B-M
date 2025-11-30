'use client'

import { Database } from '@/lib/types/database'
import { format, parseISO, differenceInDays } from 'date-fns'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Calendar, DollarSign, Trash2, AlertCircle } from 'lucide-react'
import { useState } from 'react'

type RecurringTransaction = Database['public']['Tables']['recurring_transactions']['Row']

interface SubscriptionCardProps {
  subscription: RecurringTransaction
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export default function SubscriptionCard({
  subscription,
  onEdit,
  onDelete,
}: SubscriptionCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const monthlyAmount = subscription.billing_cycle === 'monthly'
    ? Number(subscription.amount)
    : Number(subscription.amount) / 12

  const annualAmount = subscription.billing_cycle === 'yearly'
    ? Number(subscription.amount)
    : Number(subscription.amount) * 12

  const nextBillingDate = parseISO(subscription.next_occurrence)
  const daysUntilBilling = differenceInDays(nextBillingDate, new Date())
  const isRenewingSoon = daysUntilBilling <= 7 && daysUntilBilling >= 0

  // Fun messages based on price
  const getFunMessage = () => {
    if (annualAmount > 500) return "Ouch. That&apos;s a spicy one."
    if (annualAmount > 200) return "Maybe ask yourself... do you even use it?"
    if (annualAmount > 100) return "Not terrible, but adds up."
    return "At least it&apos;s not breaking the bank."
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-white rounded-2xl shadow-soft p-6 border-2 transition-all ${
        isRenewingSoon
          ? 'border-warning-300 bg-warning-50/30'
          : 'border-transparent hover:border-primary-200'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          <motion.div
            whileHover={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 0.5 }}
          >
            {subscription.logo_url ? (
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm">
                <Image
                  src={subscription.logo_url}
                  alt={subscription.vendor_name || 'Subscription'}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-white font-bold text-xl">
                  {subscription.vendor_name?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
            )}
          </motion.div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xl text-gray-900 truncate">
              {subscription.vendor_name || 'Unnamed Subscription'}
            </h3>
            {isHovered && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-gray-500 italic mt-1"
              >
                {getFunMessage()}
              </motion.p>
            )}
          </div>
        </div>

        {isRenewingSoon && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-1 px-2 py-1 bg-warning-100 text-warning-700 rounded-full text-xs font-medium"
            title="Renews soon"
          >
            <AlertCircle className="w-3 h-3" />
            Soon
          </motion.div>
        )}
      </div>

      {/* Pricing Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
            <DollarSign className="w-3 h-3" />
            <span>Monthly</span>
          </div>
          <p className="text-xl font-bold text-gray-900">
            ${monthlyAmount.toFixed(2)}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
            <DollarSign className="w-3 h-3" />
            <span>Annual</span>
          </div>
          <p className="text-xl font-bold text-gray-900">
            ${annualAmount.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Next Billing */}
      <div className="flex items-center justify-between p-3 bg-primary-50 rounded-xl mb-4">
        <div className="flex items-center gap-2 text-sm text-primary-700">
          <Calendar className="w-4 h-4" />
          <span className="font-medium">Next billing</span>
        </div>
        <span className="text-sm font-semibold text-primary-900">
          {format(nextBillingDate, 'MMM d, yyyy')}
        </span>
      </div>

      {/* Actions */}
      {onDelete && (
        <motion.button
          type="button"
          onClick={() => onDelete(subscription.id)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Cancel Subscription
        </motion.button>
      )}
    </motion.div>
  )
}


