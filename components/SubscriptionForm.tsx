'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Account {
  id: string
  name: string
}

interface Category {
  id: string
  name: string
}

export default function SubscriptionForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    account_id: '',
    category_id: '',
    amount: '',
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom',
    billing_cycle: 'monthly' as 'monthly' | 'yearly' | 'custom',
    next_occurrence: new Date().toISOString().split('T')[0],
    vendor_name: '',
    logo_url: '',
    auto_generate: true,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/recurring-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          is_subscription: true,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create subscription')
      }

      router.push('/subscriptions')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/subscriptions"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Subscriptions
        </Link>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Subscription</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="vendor_name" className="block text-sm font-medium text-gray-700 mb-1">
                Vendor Name
              </label>
              <input
                id="vendor_name"
                type="text"
                value={formData.vendor_name}
                onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                placeholder="e.g., Netflix, Spotify"
              />
            </div>

            <div>
              <label htmlFor="account_id" className="block text-sm font-medium text-gray-700 mb-1">
                Account
              </label>
              <select
                id="account_id"
                value={formData.account_id}
                onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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

            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category_id"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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

            <div>
              <label htmlFor="billing_cycle" className="block text-sm font-medium text-gray-700 mb-1">
                Billing Cycle
              </label>
              <select
                id="billing_cycle"
                value={formData.billing_cycle}
                onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount ({formData.billing_cycle === 'monthly' ? 'per month' : 'per year'})
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="next_occurrence" className="block text-sm font-medium text-gray-700 mb-1">
                Next Billing Date
              </label>
              <input
                id="next_occurrence"
                type="date"
                value={formData.next_occurrence}
                onChange={(e) => setFormData({ ...formData, next_occurrence: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700 mb-1">
                Logo URL (optional)
              </label>
              <input
                id="logo_url"
                type="url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="flex items-center">
              <input
                id="auto_generate"
                type="checkbox"
                checked={formData.auto_generate}
                onChange={(e) => setFormData({ ...formData, auto_generate: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="auto_generate" className="ml-2 text-sm text-gray-700">
                Automatically generate transactions
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating...' : 'Create Subscription'}
              </button>
              <Link
                href="/subscriptions"
                className="flex-1 text-center border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

