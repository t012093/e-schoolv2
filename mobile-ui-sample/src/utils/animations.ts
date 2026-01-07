// Common animation variants for Framer Motion

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

export const slideInFromRight = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 }
}

export const slideInFromLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 }
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 }
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
}

// Spring configurations
export const springConfig = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30
}

export const softSpring = {
  type: "spring" as const,
  stiffness: 200,
  damping: 20
}

export const bouncySpring = {
  type: "spring" as const,
  stiffness: 500,
  damping: 25,
  mass: 1
}

// Tap animations
export const tapScale = {
  scale: 0.95,
  transition: springConfig
}

export const tapScaleBig = {
  scale: 0.92,
  transition: softSpring
}

// Hover animations
export const hoverScale = {
  scale: 1.02,
  transition: springConfig
}

export const hoverLift = {
  y: -2,
  scale: 1.01,
  transition: springConfig
}

// Page transition variants
export const pageTransition = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3, ease: "easeInOut" }
}

// Card animations
export const cardHover = {
  scale: 1.02,
  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  transition: springConfig
}

export const cardTap = {
  scale: 0.98,
  transition: springConfig
}
