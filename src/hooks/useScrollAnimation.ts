import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'

interface ScrollAnimationOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  animation?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scaleIn' | 'flipIn'
  duration?: number
  delay?: number
  stagger?: number
}

export const useScrollAnimation = (options: ScrollAnimationOptions = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -100px 0px',
    triggerOnce = true,
    animation = 'fadeIn',
    duration = 800,
    delay = 0,
    stagger = 0
  } = options

  const elementRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // Set initial state (commented out unused variable)
    // const initialStates = {
    //   fadeIn: { opacity: 0 },
    //   slideUp: { opacity: 0, translateY: 50 },
    //   slideLeft: { opacity: 0, translateX: -50 },
    //   slideRight: { opacity: 0, translateX: 50 },
    //   scaleIn: { opacity: 0, scale: 0.8 },
    //   flipIn: { opacity: 0, rotateX: -90 }
    // }

    const finalStates = {
      fadeIn: { opacity: 1 },
      slideUp: { opacity: 1, translateY: 0 },
      slideLeft: { opacity: 1, translateX: 0 },
      slideRight: { opacity: 1, translateX: 0 },
      scaleIn: { opacity: 1, scale: 1 },
      flipIn: { opacity: 1, rotateX: 0 }
    }

    // Apply initial state
    Object.assign(element.style, {
      opacity: '0',
      transform: animation === 'slideUp' ? 'translateY(50px)' :
                 animation === 'slideLeft' ? 'translateX(-50px)' :
                 animation === 'slideRight' ? 'translateX(50px)' :
                 animation === 'scaleIn' ? 'scale(0.8)' :
                 animation === 'flipIn' ? 'rotateX(-90deg)' : 'none',
      willChange: 'transform, opacity'
    })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true)
            
            // Handle staggered animations for child elements
            if (stagger > 0 && element.children.length > 0) {
              Array.from(element.children).forEach((child, index) => {
                const childElement = child as HTMLElement
                // Apply same initial state to children
                Object.assign(childElement.style, {
                  opacity: '0',
                  transform: element.style.transform
                })
                
                animate(childElement, {
                  ...finalStates[animation],
                  duration,
                  delay: delay + (index * stagger),
                  easing: 'easeOutQuart'
                })
              })
            } else {
              // Animate the main element
              animate(element, {
                ...finalStates[animation],
                duration,
                delay,
                easing: animation === 'flipIn' ? 'easeOutBack' : 'easeOutQuart'
              })
            }

            if (triggerOnce) {
              observer.unobserve(element)
            }
          }
        })
      },
      { threshold, rootMargin }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold, rootMargin, triggerOnce, animation, duration, delay, stagger, isVisible])

  return { elementRef, isVisible }
}

// Hook for multiple elements with staggered animations
export const useStaggeredScrollAnimation = (
  count: number,
  options: ScrollAnimationOptions = {}
) => {
  const { stagger = 100, ...restOptions } = options
  const refs = useRef<(HTMLElement | null)[]>(Array(count).fill(null))
  const [visibleItems, setVisibleItems] = useState<boolean[]>(Array(count).fill(false))

  useEffect(() => {
    const observers = refs.current.map((element, index) => {
      if (!element) return null

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !visibleItems[index]) {
              setVisibleItems(prev => {
                const newState = [...prev]
                newState[index] = true
                return newState
              })

              animate(element, {
                opacity: [0, 1],
                translateY: [30, 0],
                scale: [0.9, 1],
                duration: restOptions.duration || 600,
                delay: index * stagger,
                easing: 'easeOutQuart'
              })

              if (restOptions.triggerOnce !== false) {
                observer.unobserve(element)
              }
            }
          })
        },
        { 
          threshold: restOptions.threshold || 0.1,
          rootMargin: restOptions.rootMargin || '0px 0px -50px 0px'
        }
      )

      observer.observe(element)
      return observer
    })

    return () => {
      observers.forEach(observer => observer?.disconnect())
    }
  }, [count, stagger, visibleItems, restOptions])

  const setRef = (index: number) => (el: HTMLElement | null) => {
    refs.current[index] = el
  }

  return { setRef, visibleItems }
}