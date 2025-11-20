'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Dynamically import the mobile app to avoid SSR issues
const MobileApp = dynamic(() => import('../../../mobile-ui-sample/src/App'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">📱</div>
        <p className="text-gray-600">読み込み中...</p>
      </div>
    </div>
  )
})

export default function MobilePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile viewport container - iPhone 14 Pro size */}
      <div className="mx-auto max-w-[428px] min-h-screen bg-white shadow-2xl rounded-3xl overflow-hidden">
        <Suspense fallback={
          <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">📱</div>
              <p className="text-gray-600">読み込み中...</p>
            </div>
          </div>
        }>
          <MobileApp />
        </Suspense>
      </div>
    </div>
  )
}
