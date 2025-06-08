import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
}

export const LoadingSpinner = ({ size = 'md', message = 'Loading...' }: LoadingSpinnerProps) => {
  const spinnerRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<HTMLDivElement>(null)
  const messageRef = useRef<HTMLParagraphElement>(null)

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  useEffect(() => {
    // Spinner animation
    if (spinnerRef.current) {
      animate(spinnerRef.current, {
        rotate: 360,
        duration: 2000,
        easing: 'linear',
        loop: true
      })
    }

    // Dots animation
    if (dotsRef.current?.children) {
      animate(Array.from(dotsRef.current.children), {
        scale: [1, 1.2, 1],
        opacity: [0.5, 1, 0.5],
        duration: 1000,
        easing: 'easeInOutSine',
        loop: true,
        delay: stagger(200)
      })
    }

    // Message fade animation
    if (messageRef.current) {
      animate(messageRef.current, {
        opacity: [0.7, 1, 0.7],
        duration: 2000,
        easing: 'easeInOutSine',
        loop: true
      })
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Main spinner */}
      <div className="relative">
        <div 
          ref={spinnerRef}
          className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full`}
        />
        
        {/* Inner particles */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div ref={dotsRef} className="flex space-x-1">
            <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
            <div className="w-1 h-1 bg-purple-600 rounded-full"></div>
            <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Loading message */}
      {message && (
        <p 
          ref={messageRef}
          className="text-gray-600 text-sm font-medium"
        >
          {message}
        </p>
      )}
    </div>
  )
}