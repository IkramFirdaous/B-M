'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Wallet } from 'lucide-react'

interface AccountModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const ACCOUNT_TYPES = [
  { value: 'Checking Account', icon: '🏦' },
  { value: 'Savings Account', icon: '💰' },
  { value: 'Cash', icon: '💵' },
  { value: 'Credit Card', icon: '💳' },
  { value: 'Investment', icon: '📈' },
  { value: 'Other', icon: '🔖' },
]

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: '$', name: 'Australian Dollar' },
]

export default function AccountModal({ isOpen, onClose, onSuccess }: AccountModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    currency: 'USD',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create account')
      }

      // Reset form
      setFormData({ name: '', currency: 'USD' })

      // Call success callback
      if (onSuccess) {
        onSuccess()
      }

      // Close modal
      onClose()
    } catch (error: any) {
      alert('Error creating account: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickSelect = (type: string) => {
    setFormData({ ...formData, name: type })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-3xl shadow-soft-xl max-h-[90vh] overflow-y-auto"
              >
            <div className="p-8">
              <div className="relative mb-8">
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-primary-100 rounded-xl">
                    <Wallet className="w-8 h-8 text-primary-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 text-center">New Account</h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute top-0 right-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Quick Select Account Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quick Select
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ACCOUNT_TYPES.map((type) => (
                    <motion.button
                      key={type.value}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleQuickSelect(type.value)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        formData.name === type.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{type.icon}</div>
                      <div className={`text-xs font-medium ${
                        formData.name === type.value ? 'text-primary-700' : 'text-gray-700'
                      }`}>
                        {type.value}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Account Name */}
              <div>
                <label htmlFor="account_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Account Name
                </label>
                <input
                  id="account_name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="e.g., Chase Checking, Emergency Fund"
                  required
                />
              </div>

              {/* Currency */}
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                >
                  {CURRENCIES.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.name} ({currency.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-2">
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="flex-1 bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3 px-6 rounded-xl hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
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
  )
}
