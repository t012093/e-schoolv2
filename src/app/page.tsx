'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // デバイスタイプを検知
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
                     window.innerWidth <= 768

    // 適切なページにリダイレクト
    if (isMobile) {
      router.push('/mobile')
    } else {
      router.push('/desktop')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-pulse">🔄</div>
        <p className="text-gray-600">リダイレクト中...</p>
      </div>
    </div>
  )
}
