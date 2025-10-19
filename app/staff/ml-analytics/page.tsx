"use client"

import { MLDashboard } from "@/components/ml-dashboard"
import Link from "next/link"
import { ArrowLeft, Brain, Sparkles } from 'lucide-react'

export default function MLAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link href="/staff/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 mr-6 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-yellow-500 rounded-xl flex items-center justify-center animate-pulse-glow">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-yellow-600 bg-clip-text text-transparent">
                  Machine Learning Analytics
                </h1>
                <p className="text-gray-600 flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
                  AI-powered insights for optimal barangay management
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MLDashboard />
      </div>
    </div>
  )
}
