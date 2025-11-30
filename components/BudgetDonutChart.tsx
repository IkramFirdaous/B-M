'use client'

import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface BudgetCategory {
  name: string
  amount: number
  spent: number
  color: string
}

interface BudgetDonutChartProps {
  categories: BudgetCategory[]
  size?: number
}

export default function BudgetDonutChart({ categories, size = 200 }: BudgetDonutChartProps) {
  const total = useMemo(
    () => categories.reduce((sum, cat) => sum + cat.amount, 0),
    [categories]
  )

  const totalSpent = useMemo(
    () => categories.reduce((sum, cat) => sum + cat.spent, 0),
    [categories]
  )

  // Calculate segments for the donut chart
  const segments = useMemo(() => {
    let currentAngle = 0
    return categories.map((cat) => {
      const percentage = (cat.amount / total) * 100
      const angle = (percentage / 100) * 360
      const segment = {
        ...cat,
        percentage,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
      }
      currentAngle += angle
      return segment
    })
  }, [categories, total])

  const radius = (size - 40) / 2
  const strokeWidth = 30
  const innerRadius = radius - strokeWidth
  const center = size / 2

  // Calculate path for each segment
  const getSegmentPath = (startAngle: number, endAngle: number) => {
    const start = {
      x: center + radius * Math.cos((startAngle - 90) * (Math.PI / 180)),
      y: center + radius * Math.sin((startAngle - 90) * (Math.PI / 180)),
    }
    const end = {
      x: center + radius * Math.cos((endAngle - 90) * (Math.PI / 180)),
      y: center + radius * Math.sin((endAngle - 90) * (Math.PI / 180)),
    }
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0

    return `
      M ${start.x} ${start.y}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}
    `
  }

  const budgetUsagePercentage = total > 0 ? (totalSpent / total) * 100 : 0

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth={strokeWidth}
        />

        {/* Segments */}
        {segments.map((segment, index) => {
          const spentPercentage = (segment.spent / segment.amount) * 100
          const isOverBudget = spentPercentage > 100

          return (
            <g key={segment.name}>
              {/* Budget segment */}
              <motion.path
                d={getSegmentPath(segment.startAngle, segment.endAngle)}
                fill="none"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />

              {/* Spent overlay - with glow if over budget */}
              {segment.spent > 0 && (
                <motion.path
                  d={getSegmentPath(
                    segment.startAngle,
                    segment.startAngle + (segment.endAngle - segment.startAngle) * Math.min(spentPercentage / 100, 1)
                  )}
                  fill="none"
                  stroke={isOverBudget ? '#ef4444' : segment.color}
                  strokeWidth={strokeWidth - 6}
                  strokeLinecap="round"
                  opacity={0.7}
                  initial={{ pathLength: 0 }}
                  animate={{
                    pathLength: 1,
                    filter: isOverBudget
                      ? [
                          'drop-shadow(0 0 2px rgba(239, 68, 68, 0.5))',
                          'drop-shadow(0 0 6px rgba(239, 68, 68, 0.8))',
                          'drop-shadow(0 0 2px rgba(239, 68, 68, 0.5))',
                        ]
                      : 'none',
                  }}
                  transition={{
                    pathLength: { duration: 1, delay: 0.5 + index * 0.1 },
                    filter: { duration: 2, repeat: Infinity },
                  }}
                />
              )}
            </g>
          )
        })}
      </svg>

      {/* Center label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ width: size, height: size }}>
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8, type: 'spring', bounce: 0.5 }}
            className="text-3xl font-bold text-gray-900"
          >
            {budgetUsagePercentage.toFixed(0)}%
          </motion.div>
          <div className="text-xs text-gray-500 mt-1">Budget Used</div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 space-y-2 w-full max-w-xs">
        {segments.map((segment, index) => {
          const spentPercentage = (segment.spent / segment.amount) * 100
          return (
            <motion.div
              key={segment.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 + index * 0.1 }}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-gray-700 font-medium">{segment.name}</span>
              </div>
              <div className="text-right">
                <span className="text-gray-900 font-semibold">
                  ${segment.spent.toFixed(0)}
                </span>
                <span className="text-gray-500"> / ${segment.amount.toFixed(0)}</span>
                <span
                  className={`ml-2 text-xs ${
                    spentPercentage > 100
                      ? 'text-red-600 font-bold'
                      : spentPercentage > 80
                      ? 'text-orange-600'
                      : 'text-green-600'
                  }`}
                >
                  {spentPercentage.toFixed(0)}%
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
