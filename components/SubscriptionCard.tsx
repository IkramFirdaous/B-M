'use client'

import { Database } from '@/lib/types/database'
import { format, parseISO } from 'date-fns'
import Image from 'next/image'

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
  const monthlyAmount = subscription.billing_cycle === 'monthly' 
    ? Number(subscription.amount)
    : Number(subscription.amount) / 12
  
  const annualAmount = subscription.billing_cycle === 'yearly'
    ? Number(subscription.amount)
    : Number(subscription.amount) * 12

  const nextBillingDate = parseISO(subscription.next_occurrence)

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          {subscription.logo_url ? (
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <Image
                src={subscription.logo_url}
                alt={subscription.vendor_name || 'Subscription'}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
              <span className="text-primary-600 font-bold text-lg">
                {subscription.vendor_name?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 truncate">
              {subscription.vendor_name || 'Unnamed Subscription'}
            </h3>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">Monthly:</span>
                <span className="text-gray-900">${monthlyAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">Annual:</span>
                <span className="text-gray-900">${annualAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">Next billing:</span>
                <span className="text-gray-900">{format(nextBillingDate, 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>
        </div>

        {(onEdit || onDelete) && (
          <div className="flex gap-2 ml-4">
            {onEdit && (
              <button
                onClick={() => onEdit(subscription.id)}
                className="px-3 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded transition-colors"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(subscription.id)}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

