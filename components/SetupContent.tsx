'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const defaultCategories = [
  'Food & Dining',
  'Shopping',
  'Transportation',
  'Bills & Utilities',
  'Entertainment',
  'Healthcare',
  'Education',
  'Travel',
  'Personal Care',
  'Income',
]

export default function SetupContent({ userId }: { userId: string }) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [accountName, setAccountName] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handleCreateAccount = async () => {
    if (!accountName.trim()) {
      alert('Please enter an account name')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: accountName }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error)

      setStep(2)
    } catch (error: any) {
      alert('Error creating account: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategories = async () => {
    if (selectedCategories.length === 0) {
      alert('Please select at least one category')
      return
    }

    setLoading(true)
    try {
      const promises = selectedCategories.map(category =>
        fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: category }),
        })
      )

      await Promise.all(promises)
      router.push('/dashboard')
    } catch (error: any) {
      alert('Error creating categories: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-700 mb-2">Welcome to Biff&amp;Moi!</h1>
          <p className="text-gray-600">Let&apos;s set up your account</p>
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Step 1: Create Your First Account</h2>
            <p className="text-gray-600 mb-4">
              Create an account to track your transactions (e.g., &quot;Checking Account&quot;, &quot;Savings&quot;, &quot;Cash&quot;)
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name
                </label>
                <input
                  id="accountName"
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Checking Account"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateAccount()}
                />
              </div>
              <button
                onClick={handleCreateAccount}
                disabled={loading}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating...' : 'Create Account & Continue'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Step 2: Select Categories</h2>
            <p className="text-gray-600 mb-4">
              Select the categories you want to use for tracking your expenses and income
            </p>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {defaultCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    selectedCategories.includes(category)
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <button
              onClick={handleCreateCategories}
              disabled={loading || selectedCategories.length === 0}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : `Create ${selectedCategories.length} Categories & Finish`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

