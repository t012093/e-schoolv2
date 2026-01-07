'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { springConfig } from '../utils/animations'

interface RippleButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  variant?: 'primary' | 'secondary' | 'ghost'
}

export default function RippleButton({
  children,
  onClick,
  className = '',
  variant = 'primary'
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget
    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newRipple = { x, y, id: Date.now() }
    setRipples(prev => [...prev, newRipple])

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id))
    }, 600)

    onClick?.()
  }

  const baseClasses = "relative overflow-hidden font-bold rounded-2xl transition-all"
  const variantClasses = {
    primary: "bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg",
    secondary: "bg-white text-gray-900 shadow-md border border-gray-200",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100"
  }

  return (
    <motion.button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={handleClick}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={springConfig}
    >
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full bg-white"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 10,
            height: 10,
            marginLeft: -5,
            marginTop: -5,
            pointerEvents: 'none'
          }}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 40, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}
      {children}
    </motion.button>
  )
}
