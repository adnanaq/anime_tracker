import { useRef, useState } from 'react'
import { animate } from 'animejs'

interface AnimatedButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  animation?: 'bounce' | 'ripple' | 'glow' | 'morph' | 'magnetic'
  disabled?: boolean
  className?: string
}

export const AnimatedButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  animation = 'bounce',
  disabled = false,
  className = ''
}: AnimatedButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const rippleRef = useRef<HTMLDivElement>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const baseClasses = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg',
    secondary: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 shadow-md',
    ghost: 'bg-transparent border-2 border-blue-500 text-blue-500 hover:bg-blue-50',
    danger: 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg'
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg'
  }

  const handleMouseEnter = () => {
    if (disabled || !buttonRef.current) return

    switch (animation) {
      case 'bounce':
        animate(buttonRef.current, {
          scale: 1.05,
          translateY: -2,
          duration: 300,
          easing: 'easeOutBack'
        })
        break

      case 'glow':
        animate(buttonRef.current, {
          boxShadow: '0 10px 30px rgba(59, 130, 246, 0.5)',
          scale: 1.02,
          duration: 300,
          easing: 'easeOutQuart'
        })
        break

      case 'morph':
        animate(buttonRef.current, {
          borderRadius: ['8px', '20px'],
          scale: 1.03,
          duration: 400,
          easing: 'easeOutQuart'
        })
        break

      case 'magnetic':
        animate(buttonRef.current, {
          scale: 1.1,
          rotate: '2deg',
          duration: 200,
          easing: 'easeOutQuart'
        })
        break
    }
  }

  const handleMouseLeave = () => {
    if (disabled || !buttonRef.current) return

    animate(buttonRef.current, {
      scale: 1,
      translateY: 0,
      rotate: '0deg',
      borderRadius: '8px',
      boxShadow: variant === 'primary' ? '0 4px 14px rgba(0, 0, 0, 0.1)' : 
                 variant === 'danger' ? '0 4px 14px rgba(239, 68, 68, 0.2)' : 
                 '0 2px 8px rgba(0, 0, 0, 0.05)',
      duration: 300,
      easing: 'easeOutQuart'
    })
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isAnimating) return

    setIsAnimating(true)

    if (animation === 'ripple') {
      const rect = buttonRef.current!.getBoundingClientRect()
      const ripple = rippleRef.current!
      const size = Math.max(rect.width, rect.height)
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2

      ripple.style.width = ripple.style.height = size + 'px'
      ripple.style.left = x + 'px'
      ripple.style.top = y + 'px'

      animate(ripple, {
        scale: [0, 1],
        opacity: [0.5, 0],
        duration: 600,
        easing: 'easeOutQuart'
      })
    } else {
      // Button press animation
      if (buttonRef.current) {
        animate(buttonRef.current, {
          scale: [1, 0.95, 1],
          duration: 200,
          easing: 'easeInOutQuart'
        })
      }
    }

    setTimeout(() => {
      setIsAnimating(false)
      onClick?.()
    }, 200)
  }

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      className={`
        relative overflow-hidden rounded-lg font-medium transition-all duration-200
        transform will-change-transform
        ${baseClasses[variant]}
        ${sizeClasses[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-xl'}
        ${className}
      `}
      style={{
        willChange: 'transform, box-shadow, border-radius'
      }}
    >
      {animation === 'ripple' && (
        <div
          ref={rippleRef}
          className="absolute bg-white rounded-full pointer-events-none"
          style={{
            transform: 'scale(0)',
            opacity: 0
          }}
        />
      )}
      
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  )
}

// Specialized button variants
export const PrimaryButton = (props: Omit<AnimatedButtonProps, 'variant'>) => (
  <AnimatedButton variant="primary" {...props} />
)

export const SecondaryButton = (props: Omit<AnimatedButtonProps, 'variant'>) => (
  <AnimatedButton variant="secondary" {...props} />
)

export const GhostButton = (props: Omit<AnimatedButtonProps, 'variant'>) => (
  <AnimatedButton variant="ghost" {...props} />
)

export const DangerButton = (props: Omit<AnimatedButtonProps, 'variant'>) => (
  <AnimatedButton variant="danger" {...props} />
)