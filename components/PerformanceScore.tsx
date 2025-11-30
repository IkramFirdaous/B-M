'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { X, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react'

interface PerformanceScoreProps {
  score: number // 0-100
  tier: 'excellent' | 'stable' | 'riskZone' | 'critical'
  insights?: string[]
  size?: number
  strokeWidth?: number
  showLabel?: boolean
  expandable?: boolean
}

export default function PerformanceScore({
  score,
  tier,
  insights = [],
  size = 200,
  strokeWidth = 12,
  showLabel = true,
  expandable = true,
}: PerformanceScoreProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const tierColors = {
    excellent: {
      gradient: ['#10b981', '#059669'], // green
      bg: '#d1fae5',
      shadow: 'shadow-glow-success',
      icon: CheckCircle,
    },
    stable: {
      gradient: ['#3b82f6', '#2563eb'], // blue
      bg: '#dbeafe',
      shadow: 'shadow-glow',
      icon: TrendingUp,
    },
    riskZone: {
      gradient: ['#f59e0b', '#d97706'], // orange
      bg: '#fef3c7',
      shadow: 'shadow-glow-warning',
      icon: AlertCircle,
    },
    critical: {
      gradient: ['#ef4444', '#dc2626'], // red
      bg: '#fee2e2',
      shadow: 'shadow-glow-danger',
      icon: TrendingDown,
    },
  }

  const colors = tierColors[tier]
  const TierIcon = colors.icon

  return (
    <>
      <motion.div
        className="flex flex-col items-center cursor-pointer"
        onClick={() => expandable && setIsExpanded(true)}
        whileHover={expandable ? { scale: 1.05 } : {}}
        whileTap={expandable ? { scale: 0.98 } : {}}
      >
        <div className="relative" style={{ width: size, height: size }}>
          {/* Pulse animation ring */}
          <motion.div
            className={`absolute inset-0 rounded-full ${colors.shadow}`}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <svg
            width={size}
            height={size}
            className="transform -rotate-90 relative z-10"
          >
            <defs>
              <linearGradient id={`gradient-${tier}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colors.gradient[0]} />
                <stop offset="100%" stopColor={colors.gradient[1]} />
              </linearGradient>
            </defs>

            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={colors.bg}
              strokeWidth={strokeWidth}
              fill="none"
            />

            {/* Progress circle */}
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={`url(#gradient-${tier})`}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>

          {/* Score text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <motion.div
                className="text-4xl font-bold"
                style={{ color: colors.gradient[0] }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", bounce: 0.5 }}
              >
                {score}
              </motion.div>
              {showLabel && (
                <div className="text-xs text-gray-500 mt-1">Score</div>
              )}
            </div>
          </div>
        </div>

        {/* Tier label */}
        {showLabel && (
          <motion.div
            className="mt-4 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div
              className={cn(
                'text-sm font-semibold capitalize px-3 py-1 rounded-full inline-flex items-center gap-1',
                tier === 'excellent' && 'bg-green-100 text-green-700',
                tier === 'stable' && 'bg-blue-100 text-blue-700',
                tier === 'riskZone' && 'bg-orange-100 text-orange-700',
                tier === 'critical' && 'bg-red-100 text-red-700'
              )}
            >
              <TierIcon className="w-3 h-3" />
              {tier === 'riskZone' ? 'Risk Zone' : tier}
            </div>
          </motion.div>
        )}

        {expandable && (
          <p className="text-xs text-gray-400 mt-2">Tap to see details</p>
        )}
      </motion.div>

      {/* Expanded Modal */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white rounded-3xl shadow-soft-xl z-50 p-6 overflow-y-auto max-h-[90vh]"
            >
              {/* Close button */}
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                aria-label="Close details"
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* Content */}
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Performance Breakdown
                </h2>

                {/* Score Ring */}
                <div className="relative mb-6" style={{ width: 180, height: 180 }}>
                  <svg
                    width={180}
                    height={180}
                    className="transform -rotate-90"
                  >
                    <circle
                      cx={90}
                      cy={90}
                      r={80}
                      stroke={colors.bg}
                      strokeWidth={12}
                      fill="none"
                    />
                    <circle
                      cx={90}
                      cy={90}
                      r={80}
                      stroke={`url(#gradient-${tier})`}
                      strokeWidth={12}
                      fill="none"
                      strokeDasharray={2 * Math.PI * 80}
                      strokeDashoffset={2 * Math.PI * 80 - (score / 100) * 2 * Math.PI * 80}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl font-bold" style={{ color: colors.gradient[0] }}>
                        {score}
                      </div>
                      <div className="text-sm text-gray-500">Score</div>
                    </div>
                  </div>
                </div>

                {/* Tier Badge */}
                <div
                  className={cn(
                    'text-lg font-semibold capitalize px-4 py-2 rounded-full inline-flex items-center gap-2 mb-6',
                    tier === 'excellent' && 'bg-green-100 text-green-700',
                    tier === 'stable' && 'bg-blue-100 text-blue-700',
                    tier === 'riskZone' && 'bg-orange-100 text-orange-700',
                    tier === 'critical' && 'bg-red-100 text-red-700'
                  )}
                >
                  <TierIcon className="w-5 h-5" />
                  {tier === 'riskZone' ? 'Risk Zone' : tier}
                </div>

                {/* Insights */}
                {insights.length > 0 && (
                  <div className="w-full">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Key Insights
                    </h3>
                    <ul className="space-y-3">
                      {insights.map((insight, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl"
                        >
                          <div className="w-2 h-2 bg-primary-500 rounded-full mt-2" />
                          <p className="text-sm text-gray-700 flex-1">{insight}</p>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}


