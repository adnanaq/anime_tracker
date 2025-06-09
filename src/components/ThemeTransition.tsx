import { useEffect, useRef } from 'react'
import { animate } from 'animejs'
import { useTheme } from '../context/ThemeContext'

export const ThemeTransition = () => {
  const { isDark } = useTheme()
  const overlayRef = useRef<HTMLDivElement>(null)
  const circleRef = useRef<HTMLDivElement>(null)
  const isTransitioning = useRef(false)

  useEffect(() => {
    if (!overlayRef.current || !circleRef.current || isTransitioning.current) return

    isTransitioning.current = true

    // Create expanding circle animation for theme transition
    animate(overlayRef.current, {
      opacity: [0, 1, 0],
      duration: 500,
      easing: 'easeInOutQuart',
      begin: () => {
        if (overlayRef.current) {
          overlayRef.current.style.pointerEvents = 'auto'
        }
      },
      complete: () => {
        if (overlayRef.current) {
          overlayRef.current.style.pointerEvents = 'none'
        }
        isTransitioning.current = false
      }
    })

    // Expand circle from center
    animate(circleRef.current, {
      scale: [0, 4, 0],
      duration: 500,
      easing: 'easeInOutQuart',
      delay: 0
    })

    // Add subtle page shake for impact
    animate(document.body, {
      translateX: [0, 2, -2, 0],
      translateY: [0, 1, -1, 0],
      duration: 200,
      easing: 'easeOutElastic(1, .6)',
      delay: 100
    })

  }, [isDark])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 pointer-events-none opacity-0"
      style={{
        background: isDark 
          ? 'radial-gradient(circle, rgba(17, 24, 39, 0.95) 0%, rgba(17, 24, 39, 0.8) 50%, transparent 100%)'
          : 'radial-gradient(circle, rgba(249, 250, 251, 0.95) 0%, rgba(249, 250, 251, 0.8) 50%, transparent 100%)'
      }}
    >
      <div
        ref={circleRef}
        className="absolute top-1/2 left-1/2 w-20 h-20 rounded-full transform -translate-x-1/2 -translate-y-1/2"
        style={{
          background: isDark 
            ? 'linear-gradient(135deg, #4f46e5, #7c3aed, #db2777)'
            : 'linear-gradient(135deg, #3b82f6, #06b6d4, #10b981)',
          boxShadow: isDark 
            ? '0 0 50px rgba(79, 70, 229, 0.5), 0 0 100px rgba(124, 58, 237, 0.3)'
            : '0 0 50px rgba(59, 130, 246, 0.5), 0 0 100px rgba(6, 182, 212, 0.3)'
        }}
      />
    </div>
  )
}