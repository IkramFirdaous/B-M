'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Receipt, Target, CreditCard, X } from 'lucide-react'
import Link from 'next/link'

interface FABAction {
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  color: string
}

const actions: FABAction[] = [
  {
    label: 'Add Transaction',
    icon: Receipt,
    href: '/transactions/new',
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    label: 'Set Budget',
    icon: Target,
    href: '/budgets',
    color: 'bg-green-500 hover:bg-green-600',
  },
  {
    label: 'Add Subscription',
    icon: CreditCard,
    href: '/subscriptions/new',
    color: 'bg-purple-500 hover:bg-purple-600',
  },
]

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="fixed bottom-24 right-6 z-50 md:bottom-8 md:right-8">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="flex flex-col gap-3 mb-4"
            >
              {actions.map((action, index) => {
                const Icon = action.icon
                return (
                  <motion.div
                    key={action.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={action.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 ${action.color} text-white rounded-full shadow-soft-xl hover:shadow-glow transition-all group`}
                    >
                      <span className="text-sm font-medium whitespace-nowrap">
                        {action.label}
                      </span>
                      <Icon className="w-5 h-5" />
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full shadow-soft-xl flex items-center justify-center transition-all ${
            isOpen
              ? 'bg-gray-600 hover:bg-gray-700 rotate-45'
              : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:shadow-glow'
          }`}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Plus className="w-6 h-6 text-white" />
          )}
        </motion.button>
      </div>
    </>
  )
}
