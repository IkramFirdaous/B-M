'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils/cn'

interface PerformanceScoreProps {
  score: number // 0-100
  tier: 'excellent' | 'stable' | 'riskZone' | 'critical'
  size?: number
  strokeWidth?: number
  showLabel?: boolean
}

export default function PerformanceScore({
  score,
  tier,
  size = 200,
  strokeWidth = 12,
  showLabel = true,
}: PerformanceScoreProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const tierColors = {
    excellent: {
      gradient: ['#10b981', '#059669'], // green
      bg: '#d1fae5',
    },
    stable: {
      gradient: ['#3b82f6', '#2563eb'], // blue
      bg: '#dbeafe',
    },
    riskZone: {
      gradient: ['#f59e0b', '#d97706'], // orange
      bg: '#fef3c7',
    },
    critical: {
      gradient: ['#ef4444', '#dc2626'], // red
      bg: '#fee2e2',
    },
  }

  const colors = tierColors[tier]

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          ref={svgRef}
          width={size}
          height={size}
          className="transform -rotate-90"
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
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#gradient-${tier})`}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Score text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-bold" style={{ color: colors.gradient[0] }}>
              {score}
            </div>
            {showLabel && (
              <div className="text-xs text-gray-500 mt-1">Score</div>
            )}
          </div>
        </div>
      </div>
      
      {/* Tier label */}
      {showLabel && (
        <div className="mt-4 text-center">
          <div
            className={cn(
              'text-sm font-semibold capitalize px-3 py-1 rounded-full',
              tier === 'excellent' && 'bg-green-100 text-green-700',
              tier === 'stable' && 'bg-blue-100 text-blue-700',
              tier === 'riskZone' && 'bg-orange-100 text-orange-700',
              tier === 'critical' && 'bg-red-100 text-red-700'
            )}
          >
            {tier === 'riskZone' ? 'Risk Zone' : tier}
          </div>
        </div>
      )}
    </div>
  )
}

