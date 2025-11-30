'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { TrendingUp, TrendingDown, RefreshCw, Receipt, Calendar, FileText, Wallet, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import AppLayout from './AppLayout'
import AccountModal from './AccountModal'

interface Account {
  id: string
  name: string
}

interface Category {
  id: string
  name: string
}

export default function TransactionForm({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = createSupabaseClient()
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [formData, setFormData] = useState({
    account_id: '',
    type: 'expense' as 'income' | 'expense' | 'transfer',
    category_id: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  useEffect(() => {
    loadAccountsAndCategories()
  }, [])

  const loadAccountsAndCategories = async () => {
    try {
      const [accountsRes, categoriesRes] = await Promise.all([
        fetch('/api/accounts'),
        fetch('/api/categories'),
      ])

      const accountsData = await accountsRes.json()
      const categoriesData = await categoriesRes.json()

      if (accountsData.data) setAccounts(accountsData.data)
      if (categoriesData.data) setCategories(categoriesData.data)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleAccountCreated = async () => {
    // Reload accounts
    const accountsRes = await fetch('/api/accounts')
    const accountsData = await accountsRes.json()

    if (accountsData.data) {
      setAccounts(accountsData.data)
      // Auto-select the newly created account (last one)
      if (accountsData.data.length > 0) {
        const newAccount = accountsData.data[accountsData.data.length - 1]
        setFormData({ ...formData, account_id: newAccount.id })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create transaction')
      }

      router.push('/dashboard')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const transactionTypes = [
    { value: 'income', label: 'Income', icon: TrendingUp, color: 'success' },
    { value: 'expense', label: 'Expense', icon: TrendingDown, color: 'danger' },
    { value: 'transfer', label: 'Transfer', icon: RefreshCw, color: 'primary' },
  ]

  const selectedType = transactionTypes.find(t => t.type === formData.type)

  // Check if user has accounts and categories
  const hasNoAccounts = accounts.length === 0
  const hasNoCategories = categories.length === 0

  if (hasNoAccounts || hasNoCategories) {
    return (
      <AppLayout>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-soft p-8 text-center">
            <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-warning-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Setup Required</h2>
            <p className="text-gray-600 mb-6">
              {hasNoAccounts && "You need to create an account first."}
              {hasNoCategories && " You also need to create at least one category."}
            </p>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/setup')}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
            >
              Go to Setup
            </motion.button>
          </div>
        </motion.div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
            Add Transaction
          </h1>
          <p className="text-gray-600 mt-2">
            Track your financial activity
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-soft p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Transaction Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {transactionTypes.map((type) => {
                  const Icon = type.icon
                  const isSelected = formData.type === type.value

                  return (
                    <motion.button
                      key={type.value}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData({ ...formData, type: type.value as any })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? `border-${type.color}-500 bg-${type.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${
                        isSelected ? `text-${type.color}-600` : 'text-gray-400'
                      }`} />
                      <div className={`text-sm font-medium ${
                        isSelected ? `text-${type.color}-700` : 'text-gray-700'
                      }`}>
                        {type.label}
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Amount
                </div>
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

            {/* Account */}
            <div>
              <label htmlFor="account_id" className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Account
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAccountModal(true)}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Account
                  </button>
                </div>
              </label>
              <select
                id="account_id"
                value={formData.account_id}
                onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                required
              >
                <option value="">Select an account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
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
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date
                </div>
              </label>
              <input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                required
              />
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
                placeholder="Add any additional details..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3 px-6 rounded-xl hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                {loading ? 'Creating...' : 'Create Transaction'}
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>

      {/* Account Creation Modal */}
      <AccountModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        onSuccess={handleAccountCreated}
      />
    </AppLayout>
  )
}
