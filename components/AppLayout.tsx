'use client'

import Navigation from './Navigation'
import { motion } from 'framer-motion'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
      <Navigation />

      {/* Main Content - adjusted for sidebar on desktop and bottom nav on mobile */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="md:pl-64 pb-20 md:pb-0"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
          {children}
        </div>
      </motion.main>
    </div>
  )
}
