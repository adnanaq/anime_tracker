import { useEffect, useRef } from 'react'
import { animate } from 'animejs'

interface PageTransitionProps {
  children: React.ReactNode
  direction?: 'slide' | 'fade' | 'scale' | 'flip'
  duration?: number
}

export const PageTransition = ({ 
  children, 
  direction = 'slide',
  duration = 600 
}: PageTransitionProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Initial state based on transition type
    const initialState = {
      slide: { translateX: 50, opacity: 0 },
      fade: { opacity: 0 },
      scale: { scale: 0.9, opacity: 0 },
      flip: { rotateY: 90, opacity: 0 }
    }

    const finalState = {
      slide: { translateX: 0, opacity: 1 },
      fade: { opacity: 1 },
      scale: { scale: 1, opacity: 1 },
      flip: { rotateY: 0, opacity: 1 }
    }

    // Set initial state
    Object.assign(containerRef.current.style, {
      transform: direction === 'slide' ? 'translateX(50px)' : 
                 direction === 'scale' ? 'scale(0.9)' :
                 direction === 'flip' ? 'rotateY(90deg)' : 'none',
      opacity: '0'
    })

    // Animate to final state
    animate(containerRef.current, {
      ...finalState[direction],
      duration,
      easing: direction === 'flip' ? 'easeOutBack' : 'easeOutQuart',
      delay: 100
    })

    // Cleanup function for page exit
    return () => {
      if (containerRef.current) {
        animate(containerRef.current, {
          ...initialState[direction],
          duration: duration * 0.6,
          easing: 'easeInQuart'
        })
      }
    }
  }, [direction, duration])

  return (
    <div 
      ref={containerRef}
      className="page-transition-container"
      style={{ 
        opacity: 0,
        willChange: 'transform, opacity'
      }}
    >
      {children}
    </div>
  )
}

// Route-specific transition wrapper
export const RouteTransition = ({ 
  children, 
  routeName 
}: { 
  children: React.ReactNode
  routeName: string 
}) => {
  // Different animations for different routes
  const transitionMap: Record<string, 'slide' | 'fade' | 'scale' | 'flip'> = {
    dashboard: 'fade',
    animeDetail: 'slide',
    authCallback: 'scale'
  }

  return (
    <PageTransition direction={transitionMap[routeName] || 'slide'}>
      {children}
    </PageTransition>
  )
}