'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Receipt,
  Target,
  CreditCard,
  PiggyBank,
  Calendar,
  Settings,
  LogOut
} from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  mobileOnly?: boolean
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions/new', icon: Receipt },
  { name: 'Budgets', href: '/budgets', icon: Target },
  { name: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
  { name: 'Savings', href: '/savings', icon: PiggyBank, mobileOnly: false },
  { name: 'Wraps', href: '/wraps/monthly', icon: Calendar, mobileOnly: false },
]

export default function Navigation() {
  const pathname = usePathname()
  const supabase = createSupabaseClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }

  // Mobile Bottom Navigation
  const MobileNav = () => (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-soft-xl md:hidden"
    >
      <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
        {navItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 py-2 group"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-active-pill"
                  className="absolute inset-0 bg-primary-50 rounded-2xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center gap-1">
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive
                      ? 'text-primary-600'
                      : 'text-gray-500 group-hover:text-gray-700'
                  }`}
                />
                <span
                  className={`text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-primary-600'
                      : 'text-gray-500 group-hover:text-gray-700'
                  }`}
                >
                  {item.name}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </motion.nav>
  )

  // Desktop Sidebar Navigation
  const DesktopNav = () => (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 md:bg-white md:border-r md:border-gray-200 md:shadow-soft"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <motion.h1
          className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent"
          whileHover={{ scale: 1.05 }}
        >
          Biff&Moi
        </motion.h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="desktop-active-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-600 rounded-r-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-500'}`} />
                <span>{item.name}</span>
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200 space-y-1">
        <Link href="/settings">
          <motion.div
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-500" />
            <span>Settings</span>
          </motion.div>
        </Link>

        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </motion.button>
      </div>
    </motion.aside>
  )

  return (
    <>
      <DesktopNav />
      <MobileNav />
    </>
  )
}
