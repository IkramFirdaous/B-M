'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, Tag, CheckCircle, Sparkles } from 'lucide-react'

const defaultCategories = [
  { name: 'Food & Dining', icon: '🍔' },
  { name: 'Shopping', icon: '🛍️' },
  { name: 'Transportation', icon: '🚗' },
  { name: 'Bills & Utilities', icon: '💡' },
  { name: 'Entertainment', icon: '🎬' },
  { name: 'Healthcare', icon: '⚕️' },
  { name: 'Education', icon: '📚' },
  { name: 'Travel', icon: '✈️' },
  { name: 'Personal Care', icon: '💅' },
  { name: 'Income', icon: '💰' },
  { name: 'Savings', icon: '🏦' },
  { name: 'Investments', icon: '📈' },
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
      setStep(3)
      setTimeout(() => router.push('/dashboard'), 2000)
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-success-50/30 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl w-full bg-white rounded-3xl shadow-soft-xl p-8 md:p-12"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-2"
          >
            Welcome to Biff&Moi!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600"
          >
            Let&apos;s get you set up in just 2 steps
          </motion.p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s <= step ? 'w-20 bg-primary-600' : 'w-12 bg-gray-200'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Create Account */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary-100 rounded-xl">
                  <Wallet className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Create Your First Account</h2>
                  <p className="text-sm text-gray-500">Where do you keep your money?</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Create an account to track your transactions. You can add more later!
              </p>
              <div className="space-y-4">
                <div>
                  <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-2">
                    Account Name
                  </label>
                  <input
                    id="accountName"
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    placeholder="e.g., Checking Account, Cash, Savings"
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateAccount()}
                  />
                </div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateAccount}
                  disabled={loading || !accountName.trim()}
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3 px-6 rounded-xl hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                >
                  {loading ? 'Creating...' : 'Create Account & Continue →'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Select Categories */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-success-100 rounded-xl">
                  <Tag className="w-6 h-6 text-success-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Choose Your Categories</h2>
                  <p className="text-sm text-gray-500">Select at least one to get started</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Pick categories for organizing your transactions. Don&apos;t worry, you can always add more!
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {defaultCategories.map((category, index) => (
                  <motion.button
                    key={category.name}
                    type="button"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleCategory(category.name)}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      selectedCategories.includes(category.name)
                        ? 'border-primary-500 bg-primary-50 shadow-soft'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{category.icon}</div>
                    <div className={`text-sm font-medium ${
                      selectedCategories.includes(category.name) ? 'text-primary-700' : 'text-gray-700'
                    }`}>
                      {category.name}
                    </div>
                  </motion.button>
                ))}
              </div>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateCategories}
                disabled={loading || selectedCategories.length === 0}
                className="w-full bg-gradient-to-r from-success-600 to-success-500 text-white py-3 px-6 rounded-xl hover:shadow-glow-success disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                {loading ? 'Creating...' : `Create ${selectedCategories.length} ${selectedCategories.length === 1 ? 'Category' : 'Categories'} & Finish 🎉`}
              </motion.button>
            </motion.div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="w-24 h-24 bg-gradient-to-br from-success-500 to-success-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">All Set!</h2>
              <p className="text-gray-600 mb-4">
                Your account is ready. Redirecting to your dashboard...
              </p>
              <div className="flex items-center justify-center gap-1">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 bg-primary-600 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 bg-primary-600 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  className="w-2 h-2 bg-primary-600 rounded-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

