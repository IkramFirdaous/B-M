'use client'

import { useEffect, useState, useCallback } from 'react'
import { format } from 'date-fns'
import PerformanceScore from './PerformanceScore'
import { getRandomCopy } from '@/lib/copywriting'

interface MonthlyWrapData {
  month: number
  year: number
  totalIncome: number
  totalExpenses: number
  netSavings: number
  subscriptionTotal: number
  topCategory: { id: string; name: string; amount: number } | null
  lowestCategory: { id: string; name: string; amount: number } | null
  performanceScore: number
  transactionCount: number
}

export default function MonthlyWrap() {
  const [data, setData] = useState<MonthlyWrapData | null>(null)
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())

  const loadWrap = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/wraps/monthly?month=${month}&year=${year}`)
      const result = await response.json()
      if (result.error) throw new Error(result.error)
      setData(result)
    } catch (error) {
      console.error('Error loading monthly wrap:', error)
    } finally {
      setLoading(false)
    }
  }, [month, year])

  useEffect(() => {
    loadWrap()
  }, [loadWrap])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Generating your monthly wrap...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">No data available for this month</p>
      </div>
    )
  }

  const monthName = format(new Date(year, month - 1), 'MMMM yyyy')
  const tier = data.performanceScore >= 80 ? 'excellent' 
    : data.performanceScore >= 60 ? 'stable'
    : data.performanceScore >= 40 ? 'riskZone'
    : 'critical'

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary-700 mb-2">Monthly Wrap</h1>
            <p className="text-xl text-gray-600">{monthName}</p>
            <p className="text-sm text-gray-500 mt-2 italic">
              {getRandomCopy('monthlyWrap', 'greetings')}
            </p>
          </div>

          {/* Performance Score */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center">
              <PerformanceScore
                score={data.performanceScore}
                tier={tier}
                size={200}
              />
            </div>
            <p className="text-center text-gray-600 mt-4">
              {getRandomCopy('performanceScore', tier)}
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                ${data.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                ${data.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className={`rounded-lg p-4 ${data.netSavings >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className="text-sm text-gray-600">Net Savings</p>
              <p className={`text-2xl font-bold mt-1 ${data.netSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${data.netSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-primary-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Subscriptions</p>
              <p className="text-2xl font-bold text-primary-600 mt-1">
                ${data.subscriptionTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Highlights */}
          <div className="space-y-4 mb-6">
            {data.topCategory && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <p className="font-semibold text-gray-900">Top Spending Category</p>
                <p className="text-gray-700 mt-1">
                  {data.topCategory.name}: ${data.topCategory.amount.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 mt-2 italic">
                  &quot;You really went all out on {data.topCategory.name.toLowerCase()}. We&apos;re not judging. Much.&quot;
                </p>
              </div>
            )}

            {data.lowestCategory && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                <p className="font-semibold text-gray-900">Lowest Spending Category</p>
                <p className="text-gray-700 mt-1">
                  {data.lowestCategory.name}: ${data.lowestCategory.amount.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 mt-2 italic">
                  &quot;You barely touched {data.lowestCategory.name.toLowerCase()}. Impressive restraint.&quot;
                </p>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <ul className="space-y-2 text-gray-700">
              <li>• {data.transactionCount} transactions this month</li>
              <li>• Performance Score: {data.performanceScore}/100</li>
              <li>• {data.netSavings >= 0 ? 'Saved' : 'Overspent'} ${Math.abs(data.netSavings).toFixed(2)}</li>
            </ul>
          </div>

          {/* Month Selector */}
          <div className="mt-6 flex gap-4 justify-center">
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{format(new Date(2000, m - 1), 'MMMM')}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

