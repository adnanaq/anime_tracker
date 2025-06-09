import { useEffect, useRef } from 'react'
import { animate } from 'animejs'
import { useTheme } from '../context/ThemeContext'

export const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const circleRef = useRef<HTMLDivElement>(null)
  const lightIconRef = useRef<HTMLDivElement>(null)
  const darkIconRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!buttonRef.current || !circleRef.current || !lightIconRef.current || !darkIconRef.current) return

    // Animate the theme change with smooth transitions
    animate(circleRef.current, {
      translateX: isDark ? 20 : 0,
      backgroundColor: isDark ? '#1f2937' : '#fbbf24',
      duration: 400,
      easing: 'easeOutElastic(1, .8)'
    })

    animate(lightIconRef.current, {
      opacity: isDark ? 0 : 1,
      scale: isDark ? 0.5 : 1,
      rotate: isDark ? 180 : 0,
      duration: 300,
      easing: 'easeOutQuart'
    })

    animate(darkIconRef.current, {
      opacity: isDark ? 1 : 0,
      scale: isDark ? 1 : 0.5,
      rotate: isDark ? 0 : -180,
      duration: 300,
      easing: 'easeOutQuart'
    })
  }, [isDark])

  const handleToggle = () => {
    // Add click animation
    if (buttonRef.current) {
      animate(buttonRef.current, {
        scale: [1, 0.95, 1],
        duration: 200,
        easing: 'easeOutQuart'
      })
    }

    // Add ripple effect
    const ripple = document.createElement('div')
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
      transform: scale(0);
      animation: ripple 600ms linear;
      pointer-events: none;
      width: 100px;
      height: 100px;
      left: 50%;
      top: 50%;
      margin-left: -50px;
      margin-top: -50px;
    `
    
    if (buttonRef.current) {
      buttonRef.current.appendChild(ripple)
      setTimeout(() => ripple.remove(), 600)
    }

    toggleTheme()
  }

  return (
    <>
      <style>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
      
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="relative w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-yellow-400 dark:focus:ring-offset-gray-900 overflow-hidden"
        aria-label="Toggle theme"
      >
        {/* Track background */}
        <div className="absolute inset-1 bg-gradient-to-r from-blue-400 to-yellow-400 dark:from-purple-600 dark:to-blue-600 rounded-full opacity-20 transition-all duration-300" />
        
        {/* Moving circle */}
        <div
          ref={circleRef}
          className="relative w-4 h-4 bg-yellow-400 rounded-full shadow-lg flex items-center justify-center transition-shadow duration-300 hover:shadow-xl"
          style={{ 
            boxShadow: isDark 
              ? '0 2px 8px rgba(31, 41, 55, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.2)' 
              : '0 2px 8px rgba(251, 191, 36, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.8)'
          }}
        >
          {/* Light mode icon (sun) */}
          <div
            ref={lightIconRef}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-2 h-2 bg-orange-500 rounded-full relative">
              {/* Sun rays */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-0.5 h-1 bg-orange-500 rounded-full"
                  style={{
                    transform: `rotate(${i * 45}deg) translateY(-6px)`,
                    transformOrigin: 'center 6px'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Dark mode icon (moon) */}
          <div
            ref={darkIconRef}
            className="absolute inset-0 flex items-center justify-center opacity-0"
          >
            <div className="w-3 h-3 bg-gray-200 rounded-full relative overflow-hidden">
              <div className="absolute top-0.5 left-0.5 w-2 h-2 bg-gray-700 rounded-full transform -translate-x-0.5 -translate-y-0.5" />
            </div>
          </div>
        </div>
      </button>
    </>
  )
}